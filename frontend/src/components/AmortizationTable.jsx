// src/components/AmortizationTable.jsx
import { useState } from 'react'
import { fmt, shortFmt } from '../utils/formatters'

export default function AmortizationTable({ schedule }) {
  const [view, setView]   = useState('monthly') // 'monthly' | 'yearly'
  const [page, setPage]   = useState(0)
  const PER_PAGE = 12

  if (!schedule?.length) return null

  // Build yearly from monthly
  const yearly = {}
  schedule.forEach(r => {
    const yr = Math.ceil(r.month / 12)
    if (!yearly[yr]) yearly[yr] = { year: yr, principal: 0, interest: 0, emi: 0, closing: 0 }
    yearly[yr].principal += r.principal_paid
    yearly[yr].interest  += r.interest_paid
    yearly[yr].emi       += r.emi
    yearly[yr].closing    = r.closing_balance
  })
  const yearlyRows = Object.values(yearly).map(r => ({
    ...r, principal: Math.round(r.principal), interest: Math.round(r.interest),
    emi: Math.round(r.emi), closing: Math.round(r.closing)
  }))

  const rows    = view === 'monthly' ? schedule : yearlyRows
  const totalP  = Math.ceil(rows.length / PER_PAGE)
  const slice   = rows.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h3 style={styles.title}>Amortization Schedule</h3>
        <div style={styles.tabs}>
          {['monthly','yearly'].map(v => (
            <button key={v} onClick={() => { setView(v); setPage(0) }}
              style={{ ...styles.tab, ...(view===v ? styles.tabActive : {}) }}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {view === 'monthly'
                ? ['#','Date','Opening','EMI','Principal','Interest','Closing'].map(h =>
                    <th key={h} style={styles.th}>{h}</th>)
                : ['Year','Total EMI','Principal','Interest','Balance'].map(h =>
                    <th key={h} style={styles.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {view === 'monthly'
              ? slice.map(r => (
                  <tr key={r.month} style={styles.tr}>
                    <td style={styles.td}>{r.month}</td>
                    <td style={styles.td}>{r.date}</td>
                    <td style={styles.td}>{shortFmt(r.opening_balance)}</td>
                    <td style={{ ...styles.td, color: '#a78bfa', fontWeight: 600 }}>{fmt(r.emi)}</td>
                    <td style={{ ...styles.td, color: '#4ade80' }}>{fmt(r.principal_paid)}</td>
                    <td style={{ ...styles.td, color: '#f87171' }}>{fmt(r.interest_paid)}</td>
                    <td style={styles.td}>{shortFmt(r.closing_balance)}</td>
                  </tr>))
              : slice.map(r => (
                  <tr key={r.year} style={styles.tr}>
                    <td style={styles.td}>Year {r.year}</td>
                    <td style={{ ...styles.td, color: '#a78bfa', fontWeight: 600 }}>{shortFmt(r.emi)}</td>
                    <td style={{ ...styles.td, color: '#4ade80' }}>{shortFmt(r.principal)}</td>
                    <td style={{ ...styles.td, color: '#f87171' }}>{shortFmt(r.interest)}</td>
                    <td style={styles.td}>{shortFmt(r.closing)}</td>
                  </tr>))}
          </tbody>
        </table>
      </div>

      {totalP > 1 && (
        <div style={styles.pagination}>
          <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page===0} style={styles.pgBtn}>‹ Prev</button>
          <span style={{ color: '#64748b', fontSize: 13 }}>Page {page+1} of {totalP}</span>
          <button onClick={() => setPage(p => Math.min(totalP-1, p+1))} disabled={page===totalP-1} style={styles.pgBtn}>Next ›</button>
        </div>
      )}
    </div>
  )
}

const styles = {
  wrap:      { background: '#1e2235', borderRadius: 16, padding: 20 },
  header:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title:     { fontSize: 16, fontWeight: 700, color: '#e2e8f0', margin: 0 },
  tabs:      { display: 'flex', gap: 4, background: '#12151f', padding: 4, borderRadius: 8 },
  tab:       { padding: '6px 14px', border: 'none', borderRadius: 6, background: 'transparent',
               color: '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  tabActive: { background: '#6c63ff', color: '#fff' },
  tableWrap: { overflowX: 'auto' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:        { textAlign: 'right', padding: '8px 12px', color: '#475569', fontWeight: 600,
               borderBottom: '1px solid #2d3148', whiteSpace: 'nowrap' },
  td:        { textAlign: 'right', padding: '7px 12px', color: '#94a3b8',
               borderBottom: '1px solid #1a1d2e' },
  tr:        { transition: 'background .1s' },
  pagination:{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 12 },
  pgBtn:     { padding: '6px 16px', border: '1px solid #2d3148', borderRadius: 8, background: '#12151f',
               color: '#94a3b8', cursor: 'pointer', fontSize: 13 },
}
