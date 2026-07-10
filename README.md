# Loan & EMI Calculator — Full Stack (Python + React)

A full-featured loan calculator web app with amortization schedules, 
prepayment analysis, loan comparison, and interactive charts.

---

## Project Structure

```
loan-calculator/
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── requirements.txt
│   ├── api/
│   │   └── routes.py              # REST API endpoints
│   ├── finance/
│   │   ├── calculator.py          # Core EMI & amortization engine
│   │   └── comparator.py          # Multi-loan comparison engine
│   ├── models/
│   │   └── schemas.py             # Pydantic schemas
│   └── tests/
│       └── test_calculator.py     # Unit tests
└── frontend/
    ├── package.json
    ├── index.html
    └── src/
        ├── main.jsx               # React entry point
        ├── App.jsx                # Root component
        ├── components/
        │   ├── LoanForm.jsx       # Input form
        │   ├── ResultCard.jsx     # Summary cards
        │   ├── AmortizationTable.jsx
        │   ├── PaymentChart.jsx   # Pie + line charts
        │   └── LoanComparison.jsx # Side-by-side comparison
        ├── hooks/
        │   └── useLoanCalc.js     # API call hook
        └── utils/
            └── formatters.js      # Currency & number formatters
```

---

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # Vite dev server → http://localhost:5173
```

### Tests
```bash
cd backend
pytest tests/ -v
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/calculate` | Calculate EMI & full schedule |
| `POST` | `/api/compare` | Compare multiple loan options |
| `POST` | `/api/prepayment` | Analyze prepayment impact |
| `GET`  | `/api/loan-types` | Get supported loan types & defaults |
| `GET`  | `/health` | Health check |

---

## Loan Types & Typical Rates

| Type | Typical Rate | Max Tenure |
|------|-------------|------------|
| Home Loan | 8–10% | 30 years |
| Car Loan | 9–12% | 7 years |
| Personal Loan | 12–24% | 5 years |
| Education Loan | 8–15% | 15 years |
