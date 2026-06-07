import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, ArrowRight, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, GlowOrbs } from '../components/ui/index.jsx'
import toast from 'react-hot-toast'

function InputField({ label, icon: Icon, type, value, onChange, placeholder, required, suffix }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-white/3 border border-border rounded-xl pl-11 pr-11 py-3 text-sm text-[#F3F4F6] placeholder:text-[#4B5563] focus:outline-none focus:border-emerald/50 transition-all duration-200"
        />
        {suffix && <div className="absolute right-4 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg grid-bg flex items-center justify-center p-4 relative">
      <GlowOrbs />
      <div className="w-full max-w-md relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald/10 border border-emerald/30 flex items-center justify-center emerald-glow">
              <Zap className="w-6 h-6 text-emerald" />
            </div>
            <span className="font-display font-bold text-2xl text-[#F3F4F6]">MockMate</span>
          </div>
          <p className="text-[#94A3B8] text-sm">Elite AI Interview Engine</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-strong rounded-3xl p-8">
          <div className="mb-8">
            <h2 className="font-display font-bold text-2xl text-[#F3F4F6]">Sign in</h2>
            <p className="text-[#94A3B8] text-sm mt-1">Continue your interview preparation</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField label="Email" icon={Mail} type="email" value={form.email}
              onChange={(v) => setForm(f => ({ ...f, email: v }))} placeholder="you@company.com" required />
            <InputField label="Password" icon={Lock} type={showPass ? 'text' : 'password'} value={form.password}
              onChange={(v) => setForm(f => ({ ...f, password: v }))} placeholder="••••••••" required
              suffix={
                <button type="button" onClick={() => setShowPass(s => !s)} className="text-[#94A3B8] hover:text-[#F3F4F6] transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
              Sign in <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#94A3B8] text-sm">
              New here?{' '}
              <Link to="/signup" className="text-emerald hover:text-emerald-hover font-medium transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}