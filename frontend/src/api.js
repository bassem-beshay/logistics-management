const base = import.meta.env.VITE_FRAPPE_URL || ''
let csrfToken = window.frappe?.csrf_token || ''

export class RequestError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'RequestError'
    this.status = status
  }
}

function messageFrom(payload, fallback) {
  if (!payload?._server_messages) return payload?.message || payload?.exception || fallback
  try {
    return JSON.parse(payload._server_messages)
      .map(item => {
        try { return JSON.parse(item).message }
        catch { return item }
      })
      .filter(Boolean)
      .join(' ')
  } catch {
    return payload.message || fallback
  }
}

async function request(path, options = {}) {
  const { headers: suppliedHeaders = {}, ...requestOptions } = options
  const requestMethod = (requestOptions.method || 'GET').toUpperCase()
  const unsafe = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(requestMethod)
  if (unsafe && !csrfToken) {
    throw new RequestError('The session security token is unavailable. Refresh the page and sign in again.', 403)
  }

  const headers = { Accept: 'application/json', ...suppliedHeaders }
  if (unsafe) headers['X-Frappe-CSRF-Token'] = csrfToken
  const response = await fetch(`${base}${path}`, {
    credentials: 'include',
    ...requestOptions,
    headers,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.exc) {
    throw new RequestError(messageFrom(payload, `Request failed (${response.status})`), response.status)
  }
  return payload.message ?? payload.data
}

export async function method(name, args = {}) {
  if (['me', 'dashboard'].includes(name)) {
    const data = await request(`/api/method/logistics_management.api.${name}`)
    if (name === 'me' && data?.csrf_token) csrfToken = data.csrf_token
    return data
  }
  const form = new URLSearchParams()
  Object.entries(args).forEach(([key, value]) => {
    form.set(key, typeof value === 'string' ? value : JSON.stringify(value))
  })
  return request(`/api/method/logistics_management.api.${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: form,
  })
}

export const list = (doctype, filters = {}, fields = ['name']) => request(
  `/api/resource/${encodeURIComponent(doctype)}?fields=${encodeURIComponent(JSON.stringify(fields))}&filters=${encodeURIComponent(JSON.stringify(filters))}&limit_page_length=100`,
)

export const create = (doctype, document) => request(`/api/resource/${encodeURIComponent(doctype)}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(document),
})

export const update = (doctype, name, document) => request(
  `/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(document),
  },
)

export const get = (doctype, name) => request(
  `/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
)
