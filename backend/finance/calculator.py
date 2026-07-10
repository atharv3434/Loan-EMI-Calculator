"""
finance/calculator.py
──────────────────────
Core loan & EMI calculation engine.

Formulas
────────
  EMI  = P × r × (1+r)^n  /  ((1+r)^n - 1)
  where:
    P = Principal
    r = monthly interest rate = annual_rate / 12 / 100
    n = tenure in months

  Total Payment = EMI × n
  Total Interest = Total Payment − Principal
"""

import math
from datetime import date
from calendar import month_abbr

from models.schemas import (
    LoanRequest, LoanResult, AmortizationRow,
    PrepaymentRequest, PrepaymentResult
)

MONTH_NAMES = ["", "Jan","Feb","Mar","Apr","May","Jun",
               "Jul","Aug","Sep","Oct","Nov","Dec"]


# ── EMI ───────────────────────────────────────────────────────────────────────

def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    """
    Calculate monthly EMI using the standard reducing-balance formula.
    For 0% interest, returns principal / tenure.
    """
    if annual_rate == 0:
        return round(principal / tenure_months, 2)

    r = annual_rate / 12 / 100
    n = tenure_months
    emi = principal * r * (1 + r) ** n / ((1 + r) ** n - 1)
    return round(emi, 2)


# ── Amortization schedule ─────────────────────────────────────────────────────

def build_schedule(
    principal: float,
    annual_rate: float,
    tenure_months: int,
    emi: float,
    start_month: int = 1,
    start_year:  int = 2024,
) -> list[AmortizationRow]:
    """
    Build a month-by-month amortization schedule.
    Returns list of AmortizationRow objects.
    """
    schedule = []
    r = annual_rate / 12 / 100
    balance  = principal
    cum_int  = 0.0
    cum_prin = 0.0

    month = start_month
    year  = start_year

    for i in range(1, tenure_months + 1):
        interest_paid  = round(balance * r, 2)
        principal_paid = round(min(emi - interest_paid, balance), 2)

        # Last month: clear the balance entirely (rounding correction)
        if i == tenure_months:
            principal_paid = round(balance, 2)
            actual_emi     = round(principal_paid + interest_paid, 2)
        else:
            actual_emi = emi

        closing_balance = round(balance - principal_paid, 2)
        cum_int   += interest_paid
        cum_prin  += principal_paid

        date_label = f"{MONTH_NAMES[month]} {year}"

        schedule.append(AmortizationRow(
            month             = i,
            date              = date_label,
            opening_balance   = round(balance, 2),
            emi               = actual_emi,
            principal_paid    = principal_paid,
            interest_paid     = interest_paid,
            closing_balance   = max(closing_balance, 0.0),
            cumulative_interest  = round(cum_int, 2),
            cumulative_principal = round(cum_prin, 2),
        ))

        balance = closing_balance
        month  += 1
        if month > 12:
            month = 1
            year += 1

        if balance <= 0:
            break

    return schedule


# ── Yearly summary ────────────────────────────────────────────────────────────

def yearly_summary(schedule: list[AmortizationRow]) -> list[dict]:
    """Aggregate the monthly schedule into a year-by-year summary."""
    years: dict[int, dict] = {}
    for row in schedule:
        year_num = (row.month - 1) // 12 + 1
        if year_num not in years:
            years[year_num] = {
                "year":            year_num,
                "principal_paid":  0.0,
                "interest_paid":   0.0,
                "total_paid":      0.0,
                "closing_balance": 0.0,
            }
        years[year_num]["principal_paid"]  += row.principal_paid
        years[year_num]["interest_paid"]   += row.interest_paid
        years[year_num]["total_paid"]      += row.emi
        years[year_num]["closing_balance"]  = row.closing_balance

    for y in years.values():
        y["principal_paid"] = round(y["principal_paid"], 2)
        y["interest_paid"]  = round(y["interest_paid"], 2)
        y["total_paid"]     = round(y["total_paid"], 2)
        y["closing_balance"]= round(y["closing_balance"], 2)

    return list(years.values())


# ── Full calculation ──────────────────────────────────────────────────────────

def calculate_loan(req: LoanRequest) -> LoanResult:
    emi          = calculate_emi(req.principal, req.annual_rate, req.tenure_months)
    total_payment = round(emi * req.tenure_months, 2)
    total_interest = round(total_payment - req.principal, 2)
    interest_ratio = round(total_interest / total_payment * 100, 2)

    schedule = build_schedule(
        req.principal, req.annual_rate, req.tenure_months, emi,
        start_month=req.start_month, start_year=req.start_year
    )
    yr_summary = yearly_summary(schedule)

    return LoanResult(
        principal       = req.principal,
        annual_rate     = req.annual_rate,
        tenure_months   = req.tenure_months,
        emi             = emi,
        total_payment   = total_payment,
        total_interest  = total_interest,
        interest_ratio  = interest_ratio,
        loan_type       = req.loan_type.value,
        schedule        = schedule,
        yearly_summary  = yr_summary,
    )


# ── Prepayment analysis ───────────────────────────────────────────────────────

def calculate_prepayment(req: PrepaymentRequest) -> PrepaymentResult:
    """
    Analyse the impact of a one-time prepayment on a loan.
    Shows months saved and interest saved.
    """
    emi = calculate_emi(req.principal, req.annual_rate, req.tenure_months)
    r   = req.annual_rate / 12 / 100

    # Original totals
    orig_total    = round(emi * req.tenure_months, 2)
    orig_interest = round(orig_total - req.principal, 2)

    # Simulate up to prepayment month
    balance  = req.principal
    paid_int = 0.0

    for m in range(1, req.prepayment_month):
        interest_this = round(balance * r, 2)
        principal_this = round(emi - interest_this, 2)
        balance  -= principal_this
        paid_int += interest_this
        if balance <= 0:
            break

    # Apply prepayment
    balance = max(0.0, balance - req.prepayment_amount)

    # Remaining schedule after prepayment (same EMI, shorter tenure)
    schedule_after = []
    month = req.prepayment_month
    cum_int_after = 0.0

    while balance > 0.01:
        interest_this  = round(balance * r, 2)
        principal_this = round(min(emi - interest_this, balance), 2)
        closing        = round(balance - principal_this, 2)
        cum_int_after += interest_this

        schedule_after.append(AmortizationRow(
            month             = month,
            date              = f"Month {month}",
            opening_balance   = round(balance, 2),
            emi               = round(emi, 2),
            principal_paid    = principal_this,
            interest_paid     = interest_this,
            closing_balance   = max(closing, 0.0),
            cumulative_interest  = round(paid_int + cum_int_after, 2),
            cumulative_principal = round(req.principal - closing, 2),
        ))

        balance = closing
        month  += 1
        if month > req.tenure_months + 12:   # safety cap
            break

    new_tenure   = req.prepayment_month - 1 + len(schedule_after)
    new_interest  = round(paid_int + cum_int_after, 2)
    new_total     = round(req.principal + new_interest, 2)
    months_saved  = req.tenure_months - new_tenure
    interest_saved = round(orig_interest - new_interest, 2)

    # Simple return estimate: interest saved / prepayment amount as annual %
    years_remaining = (req.tenure_months - req.prepayment_month) / 12
    effective_return = round(
        (interest_saved / req.prepayment_amount) / max(years_remaining, 0.1) * 100, 2
    )

    return PrepaymentResult(
        original_emi       = emi,
        original_total     = orig_total,
        original_interest  = orig_interest,
        original_tenure    = req.tenure_months,
        new_tenure         = new_tenure,
        new_total          = new_total,
        new_interest       = new_interest,
        months_saved       = max(months_saved, 0),
        interest_saved     = max(interest_saved, 0.0),
        effective_return   = effective_return,
        schedule_after     = schedule_after[:60],  # cap for response size
    )
