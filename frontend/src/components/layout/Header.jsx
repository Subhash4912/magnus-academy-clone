import { Link, useLocation } from 'react-router-dom'
import { getPageInfo } from '../../utils/navigation'
import { APP_NAME } from '../../utils/constants'
import Button from '../common/Button'
import Icon from '../common/Icon'
import useAuth from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
export default function Header({ onOpenMenu }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const page = getPageInfo(useLocation().pathname)
  return (
    <header className="workspace-header sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-white/10 px-4 text-white sm:px-6">
      <Button
        onClick={onOpenMenu}
        aria-label="Open navigation"
        aria-haspopup="dialog"
        aria-controls="mobile-navigation"
        className="shrink-0 border-white/20 bg-white/10 text-white hover:bg-white/20 lg:hidden"
      >
        <Icon name="menu" />
      </Button>
      <Link
        to="/dashboard"
        className="hidden w-52 shrink-0 items-center gap-3 font-semibold tracking-tight text-white lg:flex"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 text-lg font-bold text-white shadow-inner ring-1 ring-white/20">
          M
        </span>
        {APP_NAME}
      </Link>
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex min-w-0 items-center gap-2 text-sm">
          <li className="hidden text-indigo-200 sm:block">Workspace</li>
          <li aria-hidden="true" className="hidden text-indigo-300/60 sm:block">
            /
          </li>
          {page.parent && (
            <>
              <li className="hidden sm:block">
                <Link
                  className="text-indigo-100 hover:text-white"
                  to={page.parent.to}
                >
                  {page.parent.label}
                </Link>
              </li>
              <li aria-hidden="true" className="hidden text-indigo-300/60 sm:block">
                /
              </li>
            </>
          )}
          <li
            className="truncate font-semibold text-white"
            aria-current="page"
          >
            {page.title}
          </li>
        </ol>
      </nav>
      <div className="flex shrink-0 items-center gap-3 border-l border-white/15 pl-3 sm:pl-5">
        <span
          className="flex size-9 items-center justify-center rounded-full bg-white text-xs font-bold text-indigo-700 shadow-sm"
          aria-hidden="true"
        >
          {(user?.name || user?.email || 'U').slice(0, 2).toUpperCase()}
        </span>
        <div className="hidden sm:block">
          <p
            className="max-w-40 truncate text-sm font-semibold text-white"
            title={user?.name}
          >
            {user?.name}
          </p>
          <p className="text-xs capitalize text-indigo-200">{user?.role}</p>
        </div>
        <Button
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
          aria-label="Logout"
          title="Logout"
          className="border-white/20 bg-white/10 text-white hover:bg-white/20"
        >
          <Icon name="logout" />
          <span className="hidden xl:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}
