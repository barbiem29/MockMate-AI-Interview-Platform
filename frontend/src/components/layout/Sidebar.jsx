import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { LayoutDashboard, Play, BarChart3, User, LogOut, Zap, Menu, X, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/interview/start', icon: Play,            label: 'New Interview' },
  { to: '/results',         icon: BarChart3,       label: 'My Results' },
  { to: '/profile',         icon: User,            label: 'Profile' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleLogout() {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  function SidebarContent() {
    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald/10 border border-emerald/30 flex items-center justify-center emerald-glow">
              <Zap className="w-5 h-5 text-emerald" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-[#F3F4F6] tracking-tight">MockMate</span>
              <div className="text-[10px] font-mono text-emerald/70 tracking-widest -mt-0.5">AI ENGINE</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? 'text-emerald bg-emerald/10 border border-emerald/25'
                    : 'text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-white/5 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto text-emerald/60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 pb-6 mt-4">
          <div className="glass rounded-2xl p-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-display font-bold text-emerald">
                  {user?.fullName?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#F3F4F6] truncate">{user?.fullName}</p>
                <p className="text-xs text-[#94A3B8] truncate">{user?.targetRole || 'Candidate'}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[#94A3B8] hover:text-danger hover:bg-danger/5 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 glass-strong border-r border-border flex-col z-40">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 glass rounded-xl flex items-center justify-center"
      >
        <Menu className="w-5 h-5 text-[#F3F4F6]" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="lg:hidden fixed left-0 top-0 h-full w-72 bg-surface border-r border-border z-50 flex flex-col"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#94A3B8]"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}