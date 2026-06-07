import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const pageTitles = {
  '/dashboard':       { title: 'Dashboard',      sub: 'Overview & analytics' },
  '/interview/start': { title: 'New Interview',  sub: 'Configure your session' },
  '/results':         { title: 'Results',        sub: 'Performance history' },
  '/profile':         { title: 'Profile',        sub: 'Account settings' },
}

export default function Navbar() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { title, sub } = pageTitles[pathname] || { title: 'MockMate', sub: '' }

  return (
    <header className="sticky top-0 z-30 px-4 lg:px-8 py-4 glass-strong border-b border-border">
      <div className="flex items-center justify-between">
        <div className="ml-12 lg:ml-0">
          <h1 className="font-display font-bold text-lg text-[#F3F4F6] tracking-tight">{title}</h1>
          {sub && <p className="text-xs text-[#94A3B8] mt-0.5">{sub}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald/5 border border-emerald/15">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
            <span className="text-xs font-mono text-emerald/80">ONLINE</span>
          </div>

          <div className="w-8 h-8 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center cursor-pointer hover:bg-emerald/20 transition-colors">
            <Bell className="w-4 h-4 text-[#94A3B8]" />
          </div>

          <div className="w-8 h-8 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center">
            <span className="text-xs font-display font-bold text-emerald">
              {user?.fullName?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}