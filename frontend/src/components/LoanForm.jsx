// src/components/LoanForm.jsx
import { useState } from 'react'

const LOAN_TYPES = [
  { value: 'home',      label: '🏠 Home Loan',      rate: 8.5,  months: 240 },
  { value: 'car',       label: '🚗 Car Loan',        rate: 10.5, months: 60  },
  { value: 'personal',  label: '👤 Personal Loan',   rate: 15.0, months: 36  },
  { value: 'education', label: '🎓 Education Loan',  rate: 10.0, months: 120 },
  { value: 'custom',    label: '⚙️ Custom',           rate: 10.0, months: 120 },
]

export default function LoanForm({ onCalculate, loading }) {
  const [form, setForm] = useState({
    loan_type: 'home', principal: 5000000,
    annual_rate: 8.5, tenure_months: 240,
    start_month: new Date().getMonth() + 1,
    start_year:  new Date().getFullYear(),
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const onTypeChange = (type) => {
    const preset = LOAN_TYPES.find(t => t.value === type)
    setForm(f => ({ ...f, loan_type: type, annual_rate: preset.rate, tenure_months: preset.months }))
  }

  const submit = (e) => {
    e.preventDefault()
    onCalculate({
      ...form,
      principal:     parseFloat(form.principal),
      annual_rate:   parseFloat(form.annual_rate),
      tenure_months: parseInt(form.tenure_months),
      start_month:   parseInt(form.start_month),
      start_year:    parseInt(form.start_year),
    })
  }

  const years = Math.floor(form.tenure_months / 12)
  const months = form.tenure_months % 12

  return (
    <form onSubmit={submit} style={styles.form}>
      <h2 style={styles.title}>Loan Details</h2>

      {/* Loan Type */}
      <div style={styles.typeGrid}>
        {LOAN_TYPES.map(t => (
          <button key={t.value} type="button"
            style={{ ...styles.typeBtn, ...(form.loan_type === t.value ? styles.typeBtnActive : {}) }}
            onClick={() => onTypeChange(t.value)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Principal */}
      <label style={styles.label}>
        Loan Amount
        <div style={styles.inputWrap}>
          <span style={styles.prefix}>₹</span>
          <input type="number" value={form.principal} min="1000" max="100000000" step="10000"
            onChange={e => set('principal', e.target.value)} style={styles.input} required />
        </div>
        <input type="range" min="100000" max="50000000" step="100000"
          value={form.principal} onChange={e => set('principal', +e.target.value)} style={styles.slider} />
        <div style={styles.rangeLabels}><span>₹1L</span><span>₹5Cr</span></div>
      </label>

      {/* Rate */}
      <label style={styles.label}>
        Annual Interest Rate
        <div style={styles.inputWrap}>
          <input type="number" value={form.annual_rate} min="0.1" max="50" step="0.05"
            onChange={e => set('annual_rate', e.target.value)} style={styles.input} required />
          <span style={styles.suffix}>%</span>
        </div>
        <input type="range" min="4" max="30" step="0.25"
          value={form.annual_rate} onChange={e => set('annual_rate', +e.target.value)} style={styles.slider} />
        <div style={styles.rangeLabels}><span>4%</span><span>30%</span></div>
      </label>

      {/* Tenure */}
      <label style={styles.label}>
        Loan Tenure
        <div style={styles.inputWrap}>
          <input type="number" value={form.tenure_months} min="1" max="360" step="1"
            onChange={e => set('tenure_months', e.target.value)} style={styles.input} required />
          <span style={styles.suffix}>months</span>
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
          {years > 0 && `${years} year${years>1?'s':''}`}{months > 0 && ` ${months} month${months>1?'s':''}`}
        </div>
        <input type="range" min="12" max="360" step="12"
          value={form.tenure_months} onChange={e => set('tenure_months', +e.target.value)} style={styles.slider} />
        <div style={styles.rangeLabels}><span>1y</span><span>30y</span></div>
      </label>

      {/* Start date */}
      <div style={styles.row}>
        <label style={{ ...styles.label, flex: 1 }}>
          Start Month
          <select value={form.start_month} onChange={e => set('start_month', +e.target.value)} style={styles.select}>
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) =>
              <option key={i} value={i+1}>{m}</option>)}
          </select>
        </label>
        <label style={{ ...styles.label, flex: 1 }}>
          Start Year
          <select value={form.start_year} onChange={e => set('start_year', +e.target.value)} style={styles.select}>
            {[2023,2024,2025,2026,2027,2028].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
      </div>

      <button type="submit" disabled={loading} style={styles.submitBtn}>
        {loading ? '⏳ Calculating…' : '📊 Calculate EMI'}
      </button>
    </form>
  )
}

const styles = {
  form:      { background: '#1e2235', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 18 },
  title:     { fontSize: 18, fontWeight: 700, color: '#e2e8f0', margin: 0 },
  typeGrid:  { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 },
  typeBtn:   { padding: '8px 4px', border: '1px solid #2d3148', borderRadius: 8, background: '#12151f',
               color: '#94a3b8', cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all .15s' },
  typeBtnActive: { background: '#6c63ff', borderColor: '#6c63ff', color: '#fff' },
  label:     { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#94a3b8', fontWeight: 500 },
  inputWrap: { display: 'flex', alignItems: 'center', background: '#12151f', border: '1px solid #2d3148',
               borderRadius: 10, overflow: 'hidden' },
  prefix:    { padding: '10px 12px', color: '#6c63ff', fontWeight: 700, fontSize: 16, background: '#1a1d2e' },
  suffix:    { padding: '10px 12px', color: '#94a3b8', fontSize: 13 },
  input:     { flex: 1, border: 'none', background: 'transparent', color: '#e2e8f0', padding: '10px 12px',
               fontSize: 15, fontWeight: 600, outline: 'none', width: '100%' },
  slider:    { width: '100%', accentColor: '#6c63ff', marginTop: 6 },
  rangeLabels: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569' },
  row:       { display: 'flex', gap: 12 },
  select:    { padding: '9px 12px', border: '1px solid #2d3148', borderRadius: 10, background: '#12151f',
               color: '#e2e8f0', fontSize: 14, outline: 'none', marginTop: 4 },
  submitBtn: { padding: '14px', background: '#6c63ff', color: '#fff', border: 'none',
               borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer',
               transition: 'background .15s', marginTop: 4 },
}
