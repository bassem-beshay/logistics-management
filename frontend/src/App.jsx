import AccessDenied from './components/AccessDenied'
import AuthGate from './components/AuthGate'
import LoadingState from './components/LoadingState'
import AdminExperience from './experiences/AdminExperience'
import DriverExperience from './experiences/DriverExperience'
import UserExperience from './experiences/UserExperience'
import useLogistics from './hooks/useLogistics'
import useRoleRoute, { experienceForRoles } from './hooks/useRoleRoute'

export default function App() {
  const logistics = useLogistics()
  const experience = experienceForRoles(logistics.session.roles || [])
  const { path, navigate } = useRoleRoute(experience)

  if (logistics.loading) return <LoadingState />
  if (logistics.authRequired || !logistics.session.user) {
    return <AuthGate connectionError={logistics.authRequired ? '' : logistics.error} onRetry={logistics.retry} />
  }
  if (!experience) return <AccessDenied session={logistics.session} onRetry={logistics.retry} />
  if (experience === 'admin') return <AdminExperience logistics={logistics} path={path} navigate={navigate} />
  if (experience === 'driver') return <DriverExperience logistics={logistics} />
  return <UserExperience logistics={logistics} />
}
