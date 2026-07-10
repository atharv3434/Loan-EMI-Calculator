"""
finance/comparator.py
──────────────────────
Multi-loan comparison engine.
Compares up to 5 loan options side-by-side.
"""

from models.schemas import CompareRequest, LoanComparison, LoanResult
from finance.calculator import calculate_loan


def compare_loans(req: CompareRequest) -> LoanComparison:
    results: list[LoanResult] = [calculate_loan(loan) for loan in req.loans]

    best_emi      = min(range(len(results)), key=lambda i: results[i].emi)
    best_interest = min(range(len(results)), key=lambda i: results[i].total_interest)
    best_tenure   = min(range(len(results)), key=lambda i: results[i].tenure_months)

    return LoanComparison(
        loans         = results,
        best_emi      = best_emi,
        best_interest = best_interest,
        best_tenure   = best_tenure,
    )
