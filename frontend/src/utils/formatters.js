// src/utils/formatters.js

export const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export const fmtNum = (n, dec = 2) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: dec }).format(n)

export const fmtPct = (n) => `${Number(n).toFixed(2)}%`

export const shortFmt = (n) => {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(2)} L`
  if (n >= 1_000)      return `₹${(n / 1_000).toFixed(1)} K`
  return fmt(n)
}

export const monthsToYearsMonths = (m) => {
  const y = Math.floor(m / 12)
  const mo = m % 12
  if (y === 0) return `${mo}m`
  if (mo === 0) return `${y}y`
  return `${y}y ${mo}m`
}
