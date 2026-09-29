import { useCallback, useEffect, useState } from 'react'

export function experienceForRoles(roles = []) {
  if (roles.includes('Logistics Manager')) return 'admin'
  if (roles.includes('Logistics Dispatcher')) return 'user'
  if (roles.includes('Logistics Driver')) return 'driver'
  return null
}

const allowedPath = (experience, path) => {
  if (experience === 'admin') return ['/admin', '/admin/orders', '/admin/runs', '/admin/drivers'].includes(path)
  return path === `/${experience}`
}

export default function useRoleRoute(experience) {
  const [path, setPath] = useState(window.location.pathname)

  const navigate = useCallback((nextPath, { replace = false } = {}) => {
    if (nextPath === window.location.pathname) return
    window.history[replace ? 'replaceState' : 'pushState']({}, '', nextPath)
    setPath(nextPath)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (experience && !allowedPath(experience, path)) navigate(`/${experience}`, { replace: true })
  }, [experience, navigate, path])

  return { path, navigate }
}
