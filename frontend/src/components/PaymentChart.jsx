// src/components/PaymentChart.jsx
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { fmt, shortFmt } from '../utils/formatters'

const COLORS = ['#4ade80', '#f87171']

export default function PaymentChart({ result }) {
  if (!result) return null

  const pieData = [
    { name: 'Principal', value: result.principal },
    { name: 'Interest',  value: result.total_interest },
  ]

  // Yearly cumulative chart data
  const yearlyData = result.yearly_summary.map((y, i) => ({
    year:      `Yr ${y.year}`,
    principal: Math.round(y.principal_paid),
    interest:  Math.round(y.interest_paid),
    balance:   Math.round(y.closing_balance),
  }))

  return (
    <div style={styles.wrap}>
      <div style={styles.row}>
        {/* Pie chart */}
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}>Payment Breakdown</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                   dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => shortFmt(v)} contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={10}
                formatter={(v, e) => <span style={{ color: '#94a3b8', fontSize: 12 }}>
                  {v}: {shortFmt(e.payload.value)}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Balance chart */}
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}>Outstanding Balance</h4>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={yearlyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="bal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6c63ff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6c63ff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
              <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} tick={{ fill: '#64748b', fontSize: 10 }} width={45} />
              <Tooltip formatter={(v) => shortFmt(v)} contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="balance" stroke="#6c63ff" fill="url(#bal)" strokeWidth={2} name="Balance" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stacked yearly P+I chart */}
      <div style={styles.chartCard}>
        <h4 style={styles.chartTitle}>Yearly Principal vs Interest Paid</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={yearlyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="pri" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="int" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
            <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} tick={{ fill: '#64748b', fontSize: 10 }} width={50} />
            <Tooltip formatter={(v) => shortFmt(v)} contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="principal" stroke="#4ade80" fill="url(#pri)" strokeWidth={2} name="Principal" />
            <Area type="monotone" dataKey="interest"  stroke="#f87171" fill="url(#int)" strokeWidth={2} name="Interest" />
            <Legend iconType="circle" iconSize={10}
              formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const tooltipStyle = {
  background: '#1e2235', border: '1px solid #2d3148',
  borderRadius: 8, fontSize: 12, color: '#e2e8f0'
}

const styles = {
  wrap:       { display: 'flex', flexDirection: 'column', gap: 16 },
  row:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  chartCard:  { background: '#1e2235', borderRadius: 12, padding: 16 },
  chartTitle: { fontSize: 13, fontWeight: 600, color: '#94a3b8', margin: '0 0 12px' },
}
