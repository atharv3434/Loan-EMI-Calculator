"""
api/routes.py — REST API endpoints
"""

from fastapi import APIRouter, HTTPException
from models.schemas import (
    LoanRequest, LoanResult, PrepaymentRequest,
    PrepaymentResult, CompareRequest, LoanComparison
)
from finance.calculator import calculate_loan, calculate_prepayment
from finance.comparator import compare_loans

router = APIRouter(prefix="/api")

LOAN_TYPE_DEFAULTS = {
    "home":      {"typical_rate_min": 8.0,  "typical_rate_max": 10.0, "max_tenure_months": 360, "label": "Home Loan"},
    "car":       {"typical_rate_min": 9.0,  "typical_rate_max": 12.0, "max_tenure_months": 84,  "label": "Car Loan"},
    "personal":  {"typical_rate_min": 12.0, "typical_rate_max": 24.0, "max_tenure_months": 60,  "label": "Personal Loan"},
    "education": {"typical_rate_min": 8.0,  "typical_rate_max": 15.0, "max_tenure_months": 180, "label": "Education Loan"},
    "custom":    {"typical_rate_min": 1.0,  "typical_rate_max": 50.0, "max_tenure_months": 360, "label": "Custom Loan"},
}


@router.get("/loan-types")
def get_loan_types():
    return {"loan_types": LOAN_TYPE_DEFAULTS}


@router.post("/calculate", response_model=LoanResult)
def calculate(req: LoanRequest):
    try:
        return calculate_loan(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/prepayment", response_model=PrepaymentResult)
def prepayment(req: PrepaymentRequest):
    if req.prepayment_month >= req.tenure_months:
        raise HTTPException(status_code=400, detail="Prepayment month must be before loan end")
    if req.prepayment_amount >= req.principal:
        raise HTTPException(status_code=400, detail="Prepayment cannot exceed principal")
    try:
        return calculate_prepayment(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/compare", response_model=LoanComparison)
def compare(req: CompareRequest):
    try:
        return compare_loans(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
