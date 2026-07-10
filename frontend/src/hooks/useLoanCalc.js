// src/hooks/useLoanCalc.js
import { useState, useCallback } from 'react'

const API = '/api'

export function useLoanCalc() {
  const [result, setResult]         = useState(null)
  const [prepResult, setPrepResult] = useState(null)
  const [compareResult, setCompare] = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  const calculate = useCallback(async (params) => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${API}/calculate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Calculation failed')
      setResult(data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  const calcPrepayment = useCallback(async (params) => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${API}/prepayment`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed')
      setPrepResult(data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  const compareLoans = useCallback(async (loans) => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${API}/compare`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loans })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed')
      setCompare(data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  return { result, prepResult, compareResult, loading, error,
           calculate, calcPrepayment, compareLoans, setCompare, setPrepResult }
}
