import { Navigate, Outlet, useLocation } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import useAuth from '../hooks/useAuth'
import { routePaths } from '../utils/navigation'

export default function AuthenticatedLayout() {
  const { loading, isAuthenticated } = useAuth()
  const location = useLocation()
  if (loading)
    return (
      <p role="status" className="p-8 text-center text-slate-500">
        Checking session...
      </p>
    )
  if (!isAuthenticated)
    return (
      <Navigate
        to={routePaths.login}
        replace
        state={{ from: location.pathname + location.search + location.hash }}
      />
    )
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
