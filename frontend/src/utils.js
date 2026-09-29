export const formatNumber = value => Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })

export const formatDate = value => {
  if (!value) return '—'
  const parsed = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export const initials = value => (value || 'User')
  .split(/[@.\s_-]+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part[0]?.toUpperCase())
  .join('')

export const logisticsRole = roles => roles
  .find(role => role.startsWith('Logistics '))
  ?.replace('Logistics ', '') || 'User'
