"""
models/schemas.py — Request/Response Pydantic schemas
"""

from pydantic import BaseModel, field_validator, model_validator
from typing import Optional
from enum import Enum


class LoanType(str, Enum):
    HOME       = "home"
    CAR        = "car"
    PERSONAL   = "personal"
    EDUCATION  = "education"
    CUSTOM     = "custom"


# ── Requests ──────────────────────────────────────────────────────────────────

class LoanRequest(BaseModel):
    principal:       float         # Loan amount in ₹
    annual_rate:     float         # Annual interest rate (%)
    tenure_months:   int           # Loan tenure in months
    loan_type:       LoanType = LoanType.CUSTOM
    start_month:     int = 1       # 1–12
    start_year:      int = 2024

    @field_validator("principal")
    @classmethod
    def principal_positive(cls, v):
        if v <= 0:
            raise ValueError("Principal must be greater than 0")
        if v > 1_000_000_000:
            raise ValueError("Principal cannot exceed ₹100 crore")
        return round(v, 2)

    @field_validator("annual_rate")
    @classmethod
    def rate_valid(cls, v):
        if not (0.1 <= v <= 50):
            raise ValueError("Annual rate must be between 0.1% and 50%")
        return round(v, 4)

    @field_validator("tenure_months")
    @classmethod
    def tenure_valid(cls, v):
        if not (1 <= v <= 360):
            raise ValueError("Tenure must be between 1 and 360 months")
        return v


class PrepaymentRequest(BaseModel):
    principal:       float
    annual_rate:     float
    tenure_months:   int
    prepayment_amount: float       # One-time prepayment
    prepayment_month:  int         # Month at which prepayment is made

    @field_validator("prepayment_amount")
    @classmethod
    def prepayment_positive(cls, v):
        if v <= 0:
            raise ValueError("Prepayment amount must be > 0")
        return round(v, 2)


class CompareRequest(BaseModel):
    loans: list[LoanRequest]

    @field_validator("loans")
    @classmethod
    def at_least_two(cls, v):
        if len(v) < 2:
            raise ValueError("Provide at least 2 loans to compare")
        if len(v) > 5:
            raise ValueError("Maximum 5 loans for comparison")
        return v


# ── Responses ─────────────────────────────────────────────────────────────────

class AmortizationRow(BaseModel):
    month:           int
    date:            str           # "Jan 2025"
    opening_balance: float
    emi:             float
    principal_paid:  float
    interest_paid:   float
    closing_balance: float
    cumulative_interest: float
    cumulative_principal: float


class LoanResult(BaseModel):
    principal:          float
    annual_rate:        float
    tenure_months:      float
    emi:                float
    total_payment:      float
    total_interest:     float
    interest_ratio:     float      # % of total payment that is interest
    loan_type:          str
    schedule:           list[AmortizationRow]
    yearly_summary:     list[dict]


class PrepaymentResult(BaseModel):
    original_emi:          float
    original_total:        float
    original_interest:     float
    original_tenure:       int

    new_tenure:            int
    new_total:             float
    new_interest:          float

    months_saved:          int
    interest_saved:        float
    effective_return:      float   # IRR-equivalent of prepayment (%)
    schedule_after:        list[AmortizationRow]


class LoanComparison(BaseModel):
    loans:          list[LoanResult]
    best_emi:       int            # index of loan with lowest EMI
    best_interest:  int            # index of loan with lowest total interest
    best_tenure:    int            # index with shortest tenure
