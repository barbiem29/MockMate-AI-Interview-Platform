import { motion } from 'framer-motion'

export function Button({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none'

  const variants = {
    primary:   'bg-emerald text-bg hover:bg-emerald-hover active:scale-95',
    secondary: 'glass border border-emerald/20 text-[#F3F4F6] hover:border-emerald/40 hover:bg-emerald/5 active:scale-95',
    ghost:     'text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-white/5 active:scale-95',
    danger:    'bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 active:scale-95',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      transition={{ duration: 0.2 }}
      className={`glass rounded-2xl ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-white/5 text-[#94A3B8] border border-white/10',
    emerald: 'bg-emerald/10 text-emerald border border-emerald/25',
    danger:  'bg-danger/10 text-danger border border-danger/25',
    warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' }
  return (
    <div className={`${sizes[size]} rounded-full border-2 border-emerald/20 border-t-emerald animate-spin ${className}`} />
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`shimmer-bg rounded-xl ${className}`} />
}

export function ScoreRing({ score = 0, size = 120, strokeWidth = 8, label = '', color = '#2EE6A6' }) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const progress = (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(46,230,166,0.08)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-display font-bold text-[#F3F4F6]"
          style={{ fontSize: size * 0.22 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        {label && <span className="text-[#94A3B8]" style={{ fontSize: size * 0.1 }}>{label}</span>}
      </div>
    </div>
  )
}

export function StatCard({ label, value, icon: Icon }) {
  return (
    <Card className="p-5" hover>
      <div className="w-9 h-9 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center mb-3">
        <Icon className="w-4 h-4 text-emerald" />
      </div>
      <p className="text-2xl font-display font-bold text-[#F3F4F6]">{value}</p>
      <p className="text-xs text-[#94A3B8] mt-1">{label}</p>
    </Card>
  )
}

export function ProgressBar({ value = 0, label = '' }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-[#94A3B8]">{label}</span>
        <span className="text-sm font-mono font-medium text-[#F3F4F6]">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-emerald"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  )
}

export function HireBadge({ recommendation }) {
  const config = {
    'Hire':      { color: 'text-emerald',       bg: 'bg-emerald/10 border-emerald/30',        dot: 'bg-emerald' },
    'Borderline':{ color: 'text-yellow-400',    bg: 'bg-yellow-500/10 border-yellow-500/30',  dot: 'bg-yellow-400' },
    'No Hire':   { color: 'text-danger',        bg: 'bg-danger/10 border-danger/30',          dot: 'bg-danger' },
  }
  const { color, bg, dot } = config[recommendation] || config['Borderline']
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${bg}`}>
      <span className={`w-2 h-2 rounded-full ${dot} animate-pulse`} />
      <span className={`font-display font-bold text-sm ${color}`}>{recommendation}</span>
    </div>
  )
}

export function GlowOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="orb-1 absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-emerald/5 blur-3xl" />
      <div className="orb-2 absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-emerald/4 blur-3xl" />
      <div className="orb-3 absolute top-3/4 left-1/2 w-72 h-72 rounded-full bg-emerald/3 blur-3xl" />
    </div>
  )
}