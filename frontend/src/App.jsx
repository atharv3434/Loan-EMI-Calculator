// src/App.jsx
import { useState } from 'react'
import LoanForm          from './components/LoanForm'
import ResultCard        from './components/ResultCard'
import PaymentChart      from './components/PaymentChart'
import AmortizationTable from './components/AmortizationTable'
import PrepaymentAnalyzer from './components/PrepaymentAnalyzer'
import { useLoanCalc }   from './hooks/useLoanCalc'

const TABS = ['📊 Summary', '📈 Charts', '📋 Schedule', '🔄 Prepayment']

export default function App() {
  const [tab, setTab]         = useState(0)
  const [loanParams, setLP]   = useState(null)
  const { result, prepResult, loading, error,
          calculate, calcPrepayment } = useLoanCalc()

  const handleCalc = (params) => {
    setLP(params)
    calculate(params)
    setTab(0)
  }

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🏦</span>
          <div>
            <div style={styles.logoTitle}>Loan & EMI Calculator</div>
            <div style={styles.logoSub}>Amortization · Prepayment · Comparison</div>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Left: form */}
        <aside style={styles.sidebar}>
          <LoanForm onCalculate={handleCalc} loading={loading} />
        </aside>

        {/* Right: results */}
        <section style={styles.content}>
          {error && <div style={styles.error}>⚠️ {error}</div>}

          {!result && !loading && (
            <div style={styles.empty}>
              <div style={{ fontSize: 56 }}>📊</div>
              <h2 style={{ color: '#e2e8f0', margin: '12px 0 8px' }}>Enter loan details</h2>
              <p style={{ color: '#64748b', fontSize: 14 }}>Fill in the form to calculate your EMI, view amortization schedule, and analyse prepayment savings.</p>
            </div>
          )}

          {loading && (
            <div style={styles.empty}>
              <div style={{ fontSize: 40 }}>⏳</div>
              <p style={{ color: '#94a3b8' }}>Calculating…</p>
            </div>
          )}

          {result && !loading && (
            <>
              {/* Tabs */}
              <div style={styles.tabs}>
                {TABS.map((t, i) => (
                  <button key={i} onClick={() => setTab(i)}
                    style={{ ...styles.tab, ...(tab === i ? styles.tabActive : {}) }}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div style={styles.tabContent}>
                {tab === 0 && <ResultCard result={result} />}
                {tab === 1 && <PaymentChart result={result} />}
                {tab === 2 && <AmortizationTable schedule={result.schedule} />}
                {tab === 3 && (
                  <PrepaymentAnalyzer
                    loanParams={loanParams}
                    onAnalyze={calcPrepayment}
                    result={prepResult}
                    loading={loading}
                  />
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

const styles = {
  root:       { minHeight: '100vh', background: '#0f1117', color: '#e2e8f0', fontFamily: 'Inter,system-ui,sans-serif' },
  header:     { padding: '16px 32px', borderBottom: '1px solid #1e2235', display: 'flex', alignItems: 'center' },
  logo:       { display: 'flex', alignItems: 'center', gap: 12 },
  logoIcon:   { fontSize: 28 },
  logoTitle:  { fontSize: 18, fontWeight: 700, color: '#e2e8f0' },
  logoSub:    { fontSize: 12, color: '#475569' },
  main:       { display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, padding: '24px 32px', maxWidth: 1400, margin: '0 auto' },
  sidebar:    { position: 'sticky', top: 24, alignSelf: 'start' },
  content:    { display: 'flex', flexDirection: 'column', gap: 16, minHeight: 400 },
  error:      { background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 10, padding: 12, fontSize: 14, color: '#f87171' },
  empty:      { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', padding: 60, background: '#1e2235', borderRadius: 16 },
  tabs:       { display: 'flex', gap: 4, background: '#1e2235', padding: 6, borderRadius: 12 },
  tab:        { flex: 1, padding: '10px 12px', border: 'none', borderRadius: 8, background: 'transparent',
                color: '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all .15s' },
  tabActive:  { background: '#6c63ff', color: '#fff' },
  tabContent: { flex: 1 },
}
