// src/components/ResultCard.jsx
import { fmt, shortFmt, fmtPct, monthsToYearsMonths } from '../utils/formatters'

export default function ResultCard({ result }) {
  if (!result) return null

  const cards = [
    { label: 'Monthly EMI',      value: fmt(result.emi),            icon: '💳', accent: '#6c63ff' },
    { label: 'Total Interest',   value: shortFmt(result.total_interest), icon: '📈', accent: '#f87171' },
    { label: 'Total Payment',    value: shortFmt(result.total_payment),  icon: '💰', accent: '#4ade80' },
    { label: 'Interest Ratio',   value: fmtPct(result.interest_ratio),   icon: '📊', accent: '#fb923c' },
    { label: 'Loan Amount',      value: shortFmt(result.principal),       icon: '🏦', accent: '#38bdf8' },
    { label: 'Tenure',           value: monthsToYearsMonths(result.tenure_months), icon: '📅', accent: '#a78bfa' },
  ]

  const principalPct = (result.principal / result.total_payment * 100).toFixed(1)
  const interestPct  = result.interest_ratio.toFixed(1)

  return (
    <div style={styles.wrap}>
      <h3 style={styles.title}>EMI Breakdown</h3>

      {/* Summary cards */}
      <div style={styles.grid}>
        {cards.map(c => (
          <div key={c.label} style={{ ...styles.card, borderTop: `3px solid ${c.accent}` }}>
            <div style={styles.cardIcon}>{c.icon}</div>
            <div style={{ ...styles.cardValue, color: c.accent }}>{c.value}</div>
            <div style={styles.cardLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Visual bar */}
      <div style={styles.barWrap}>
        <div style={styles.barLabels}>
          <span style={{ color: '#4ade80' }}>Principal {principalPct}%</span>
          <span style={{ color: '#f87171' }}>Interest {interestPct}%</span>
        </div>
        <div style={styles.bar}>
          <div style={{ ...styles.barFill, width: `${principalPct}%`, background: '#4ade80' }} />
          <div style={{ ...styles.barFill, width: `${interestPct}%`, background: '#f87171' }} />
        </div>
      </div>

      {/* Quick insight */}
      <div style={styles.insight}>
        💡 For every ₹100 you pay, <strong style={{ color: '#f87171' }}>₹{interestPct} goes to interest</strong> and{' '}
        <strong style={{ color: '#4ade80' }}>₹{principalPct} repays principal</strong>.
      </div>
    </div>
  )
}

const styles = {
  wrap:       { display: 'flex', flexDirection: 'column', gap: 16 },
  title:      { fontSize: 16, fontWeight: 700, color: '#e2e8f0', margin: 0 },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  card:       { background: '#1e2235', borderRadius: 12, padding: 16,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  cardIcon:   { fontSize: 22 },
  cardValue:  { fontSize: 18, fontWeight: 700 },
  cardLabel:  { fontSize: 11, color: '#64748b', textAlign: 'center' },
  barWrap:    { background: '#1e2235', borderRadius: 12, padding: 16 },
  barLabels:  { display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, fontWeight: 600 },
  bar:        { display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', gap: 2 },
  barFill:    { height: '100%', borderRadius: 3, transition: 'width 0.5s ease' },
  insight:    { background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)',
                borderRadius: 10, padding: 12, fontSize: 13, color: '#94a3b8', lineHeight: 1.6 },
}
