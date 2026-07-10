// src/components/PrepaymentAnalyzer.jsx
import { useState } from 'react'
import { fmt, shortFmt, monthsToYearsMonths } from '../utils/formatters'

export default function PrepaymentAnalyzer({ loanParams, onAnalyze, result, loading }) {
  const [amount, setAmount] = useState(500000)
  const [month, setMonth]   = useState(12)

  const submit = (e) => {
    e.preventDefault()
    if (!loanParams) return
    onAnalyze({
      principal:          loanParams.principal,
      annual_rate:        loanParams.annual_rate,
      tenure_months:      loanParams.tenure_months,
      prepayment_amount:  parseFloat(amount),
      prepayment_month:   parseInt(month),
    })
  }

  return (
    <div style={styles.wrap}>
      <h3 style={styles.title}>🔄 Prepayment Analyzer</h3>
      <p style={styles.sub}>See how a lump-sum payment reduces your loan tenure & interest.</p>

      <form onSubmit={submit} style={styles.form}>
        <label style={styles.label}>
          Prepayment Amount (₹)
          <input type="number" value={amount} min="10000" max="50000000" step="10000"
            onChange={e => setAmount(e.target.value)} style={styles.input} required />
        </label>
        <label style={styles.label}>
          At Month #
          <input type="number" value={month} min="1"
            max={loanParams ? loanParams.tenure_months - 1 : 120}
            onChange={e => setMonth(e.target.value)} style={styles.input} required />
        </label>
        <button type="submit" disabled={loading || !loanParams} style={styles.btn}>
          {loading ? '⏳ Analyzing…' : '🔍 Analyze Impact'}
        </button>
      </form>

      {!loanParams && <p style={styles.hint}>Calculate a loan first to use this feature.</p>}

      {result && (
        <div style={styles.results}>
          <div style={styles.compareGrid}>
            <div style={styles.compareCard}>
              <div style={styles.compareLabel}>Without Prepayment</div>
              <div style={styles.compareVal}>{monthsToYearsMonths(result.original_tenure)}</div>
              <div style={styles.compareSub}>Tenure</div>
              <div style={{ ...styles.compareVal, color: '#f87171' }}>{shortFmt(result.original_interest)}</div>
              <div style={styles.compareSub}>Total Interest</div>
              <div style={styles.compareVal}>{shortFmt(result.original_total)}</div>
              <div style={styles.compareSub}>Total Payment</div>
            </div>
            <div style={{ ...styles.compareCard, borderColor: '#4ade80' }}>
              <div style={{ ...styles.compareLabel, color: '#4ade80' }}>With Prepayment ✓</div>
              <div style={{ ...styles.compareVal, color: '#4ade80' }}>{monthsToYearsMonths(result.new_tenure)}</div>
              <div style={styles.compareSub}>Tenure</div>
              <div style={{ ...styles.compareVal, color: '#4ade80' }}>{shortFmt(result.new_interest)}</div>
              <div style={styles.compareSub}>Total Interest</div>
              <div style={{ ...styles.compareVal, color: '#4ade80' }}>{shortFmt(result.new_total)}</div>
              <div style={styles.compareSub}>Total Payment</div>
            </div>
          </div>

          <div style={styles.savingsGrid}>
            <div style={styles.saving}>
              <div style={{ fontSize: 24 }}>📅</div>
              <div style={{ ...styles.saveVal, color: '#4ade80' }}>{result.months_saved} months</div>
              <div style={styles.saveLabel}>Time Saved</div>
            </div>
            <div style={styles.saving}>
              <div style={{ fontSize: 24 }}>💰</div>
              <div style={{ ...styles.saveVal, color: '#4ade80' }}>{shortFmt(result.interest_saved)}</div>
              <div style={styles.saveLabel}>Interest Saved</div>
            </div>
            <div style={styles.saving}>
              <div style={{ fontSize: 24 }}>📈</div>
              <div style={{ ...styles.saveVal, color: '#a78bfa' }}>{result.effective_return}%</div>
              <div style={styles.saveLabel}>Effective Return</div>
            </div>
          </div>

          <div style={styles.insight}>
            💡 Prepaying <strong>{shortFmt(amount)}</strong> at month {month} saves you{' '}
            <strong style={{ color: '#4ade80' }}>{shortFmt(result.interest_saved)}</strong> in interest
            and closes the loan <strong style={{ color: '#4ade80' }}>{result.months_saved} months earlier</strong>.
            Equivalent to earning <strong style={{ color: '#a78bfa' }}>{result.effective_return}% p.a.</strong>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  wrap:        { background: '#1e2235', borderRadius: 16, padding: 20 },
  title:       { fontSize: 16, fontWeight: 700, color: '#e2e8f0', margin: '0 0 4px' },
  sub:         { fontSize: 13, color: '#64748b', margin: '0 0 16px' },
  form:        { display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end', marginBottom: 16 },
  label:       { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#94a3b8' },
  input:       { padding: '10px 12px', border: '1px solid #2d3148', borderRadius: 10,
                 background: '#12151f', color: '#e2e8f0', fontSize: 14, outline: 'none' },
  btn:         { padding: '10px 18px', background: '#6c63ff', color: '#fff', border: 'none',
                 borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' },
  hint:        { fontSize: 13, color: '#475569', textAlign: 'center', padding: 12 },
  results:     { display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 },
  compareGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  compareCard: { background: '#12151f', border: '1px solid #2d3148', borderRadius: 12, padding: 16,
                 display: 'flex', flexDirection: 'column', gap: 4 },
  compareLabel:{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8 },
  compareVal:  { fontSize: 18, fontWeight: 700, color: '#e2e8f0' },
  compareSub:  { fontSize: 11, color: '#475569', marginBottom: 8 },
  savingsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 },
  saving:      { background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)',
                 borderRadius: 12, padding: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 },
  saveVal:     { fontSize: 20, fontWeight: 700 },
  saveLabel:   { fontSize: 11, color: '#64748b' },
  insight:     { background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.25)',
                 borderRadius: 10, padding: 12, fontSize: 13, color: '#94a3b8', lineHeight: 1.6 },
}
