"""
tests/test_calculator.py
Unit tests for the loan calculator engine.
Run: pytest tests/ -v
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from models.schemas import LoanRequest, PrepaymentRequest, CompareRequest, LoanType
from finance.calculator import calculate_emi, calculate_loan, calculate_prepayment, build_schedule
from finance.comparator import compare_loans


# ── EMI ───────────────────────────────────────────────────────────────────────

class TestEMI:
    def test_standard_home_loan(self):
        # ₹50L, 8.5%, 20 years — expected ~₹43,391
        emi = calculate_emi(5_000_000, 8.5, 240)
        assert 43_000 < emi < 44_000

    def test_zero_interest(self):
        emi = calculate_emi(120_000, 0, 12)
        assert emi == 10_000.0

    def test_single_month(self):
        emi = calculate_emi(100_000, 12.0, 1)
        interest = 100_000 * 12 / 12 / 100
        assert abs(emi - (100_000 + interest)) < 1

    def test_emi_positive(self):
        for principal, rate, months in [
            (100_000, 10, 12), (5_000_000, 8, 240), (50_000, 24, 60)
        ]:
            assert calculate_emi(principal, rate, months) > 0

    def test_higher_rate_higher_emi(self):
        emi_low  = calculate_emi(1_000_000, 8,  120)
        emi_high = calculate_emi(1_000_000, 12, 120)
        assert emi_high > emi_low

    def test_longer_tenure_lower_emi(self):
        emi_short = calculate_emi(1_000_000, 10, 120)
        emi_long  = calculate_emi(1_000_000, 10, 240)
        assert emi_long < emi_short


# ── Amortization Schedule ─────────────────────────────────────────────────────

class TestSchedule:
    def test_schedule_length(self):
        emi = calculate_emi(500_000, 10, 60)
        schedule = build_schedule(500_000, 10, 60, emi)
        assert len(schedule) == 60

    def test_closing_balance_reaches_zero(self):
        emi = calculate_emi(300_000, 9, 36)
        schedule = build_schedule(300_000, 9, 36, emi)
        assert schedule[-1].closing_balance == pytest.approx(0.0, abs=1.0)

    def test_opening_equals_previous_closing(self):
        emi = calculate_emi(200_000, 12, 24)
        schedule = build_schedule(200_000, 12, 24, emi)
        for i in range(1, len(schedule)):
            assert schedule[i].opening_balance == pytest.approx(
                schedule[i-1].closing_balance, abs=0.5
            )

    def test_emi_equals_principal_plus_interest(self):
        emi = calculate_emi(400_000, 11, 48)
        schedule = build_schedule(400_000, 11, 48, emi)
        for row in schedule[:-1]:   # last row may differ slightly
            assert abs(row.emi - row.principal_paid - row.interest_paid) < 0.5

    def test_cumulative_principal_equals_loan(self):
        principal = 750_000
        emi = calculate_emi(principal, 9.5, 84)
        schedule = build_schedule(principal, 9.5, 84, emi)
        assert schedule[-1].cumulative_principal == pytest.approx(principal, abs=50)

    def test_interest_decreases_over_time(self):
        emi = calculate_emi(1_000_000, 10, 120)
        schedule = build_schedule(1_000_000, 10, 120, emi)
        # Interest portion should generally decrease
        assert schedule[0].interest_paid > schedule[-1].interest_paid

    def test_month_numbers_sequential(self):
        emi = calculate_emi(100_000, 8, 12)
        schedule = build_schedule(100_000, 8, 12, emi)
        for i, row in enumerate(schedule):
            assert row.month == i + 1


# ── Full Loan Calculation ─────────────────────────────────────────────────────

class TestLoanCalculation:
    def _req(self, principal=1_000_000, rate=10.0, months=120,
             loan_type=LoanType.HOME):
        return LoanRequest(principal=principal, annual_rate=rate,
                           tenure_months=months, loan_type=loan_type)

    def test_total_payment_equals_emi_times_tenure(self):
        result = calculate_loan(self._req())
        assert result.total_payment == pytest.approx(
            result.emi * result.tenure_months, rel=0.01
        )

    def test_total_interest_correct(self):
        result = calculate_loan(self._req())
        assert result.total_interest == pytest.approx(
            result.total_payment - result.principal, abs=10
        )

    def test_interest_ratio_between_0_and_100(self):
        result = calculate_loan(self._req())
        assert 0 < result.interest_ratio < 100

    def test_yearly_summary_sums_correctly(self):
        result = calculate_loan(self._req())
        total_from_years = sum(y["total_paid"] for y in result.yearly_summary)
        assert total_from_years == pytest.approx(result.total_payment, rel=0.01)

    def test_personal_loan_higher_interest_than_home(self):
        home     = calculate_loan(self._req(rate=8.5, months=240, loan_type=LoanType.HOME))
        personal = calculate_loan(self._req(rate=18.0, months=60,  loan_type=LoanType.PERSONAL))
        assert personal.interest_ratio > home.interest_ratio


# ── Prepayment ────────────────────────────────────────────────────────────────

class TestPrepayment:
    def _req(self):
        return PrepaymentRequest(
            principal=2_000_000, annual_rate=9.0,
            tenure_months=240, prepayment_amount=500_000,
            prepayment_month=12
        )

    def test_prepayment_saves_months(self):
        result = calculate_prepayment(self._req())
        assert result.months_saved > 0

    def test_prepayment_saves_interest(self):
        result = calculate_prepayment(self._req())
        assert result.interest_saved > 0

    def test_new_tenure_less_than_original(self):
        result = calculate_prepayment(self._req())
        assert result.new_tenure < result.original_tenure

    def test_new_total_less_than_original(self):
        result = calculate_prepayment(self._req())
        assert result.new_total < result.original_total

    def test_effective_return_positive(self):
        result = calculate_prepayment(self._req())
        assert result.effective_return > 0

    def test_emi_unchanged(self):
        req    = self._req()
        result = calculate_prepayment(req)
        emi    = calculate_emi(req.principal, req.annual_rate, req.tenure_months)
        assert result.original_emi == pytest.approx(emi, abs=1)


# ── Comparison ────────────────────────────────────────────────────────────────

class TestComparison:
    def _req(self):
        return CompareRequest(loans=[
            LoanRequest(principal=1_000_000, annual_rate=8.5, tenure_months=120, loan_type=LoanType.HOME),
            LoanRequest(principal=1_000_000, annual_rate=10.0, tenure_months=120, loan_type=LoanType.HOME),
            LoanRequest(principal=1_000_000, annual_rate=8.5, tenure_months=180, loan_type=LoanType.HOME),
        ])

    def test_returns_correct_count(self):
        result = compare_loans(self._req())
        assert len(result.loans) == 3

    def test_best_emi_index_valid(self):
        result = compare_loans(self._req())
        assert 0 <= result.best_emi < len(result.loans)

    def test_lower_rate_gives_lower_emi(self):
        result = compare_loans(self._req())
        # Loan 0 (8.5%) should have lower EMI than Loan 1 (10%)
        assert result.loans[0].emi < result.loans[1].emi

    def test_lower_rate_gives_less_interest(self):
        result = compare_loans(self._req())
        assert result.loans[0].total_interest < result.loans[1].total_interest


# ── Input Validation ──────────────────────────────────────────────────────────

class TestValidation:
    def test_negative_principal_rejected(self):
        with pytest.raises(Exception):
            LoanRequest(principal=-100_000, annual_rate=10, tenure_months=12)

    def test_zero_principal_rejected(self):
        with pytest.raises(Exception):
            LoanRequest(principal=0, annual_rate=10, tenure_months=12)

    def test_rate_too_high_rejected(self):
        with pytest.raises(Exception):
            LoanRequest(principal=100_000, annual_rate=99, tenure_months=12)

    def test_negative_rate_rejected(self):
        with pytest.raises(Exception):
            LoanRequest(principal=100_000, annual_rate=-1, tenure_months=12)

    def test_zero_tenure_rejected(self):
        with pytest.raises(Exception):
            LoanRequest(principal=100_000, annual_rate=10, tenure_months=0)

    def test_tenure_too_long_rejected(self):
        with pytest.raises(Exception):
            LoanRequest(principal=100_000, annual_rate=10, tenure_months=500)
