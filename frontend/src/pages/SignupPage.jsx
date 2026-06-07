import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, ArrowRight, User, Mail, Lock, Briefcase } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, GlowOrbs } from '../components/ui/index.jsx'
import toast from 'react-hot-toast'

const ROLES = ['Software Engineer','Frontend Developer','Backend Developer','Full Stack Developer','Data Scientist','DevOps Engineer','Product Manager','Other']
const LEVELS = ['beginner','intermediate','advanced']
const SKILLS = ['JavaScript','Python','React','Node.js','Java','SQL','TypeScript','Go','AWS','Docker']

function InputField({ label, icon: Icon, type, value, onChange, placeholder, required, suffix }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} required={required}
          className="w-full bg-white/3 border border-border rounded-xl pl-11 pr-11 py-3 text-sm text-[#F3F4F6] placeholder:text-[#4B5563] focus:outline-none focus:border-emerald/50 transition-all"
        />
        {suffix && <div className="absolute right-4 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
    </div>
  )
}

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({
    fullName: '', email: '', password: '',
    targetRole: '', experienceLevel: 'beginner', skills: []
  })

  function toggleSkill(skill) {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill]
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signup(form)
      toast.success('Account created! Welcome to MockMate.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg grid-bg flex items-center justify-center p-4 relative">
      <GlowOrbs />
      <div className="w-full max-w-md relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald/10 border border-emerald/30 flex items-center justify-center emerald-glow">
              <Zap className="w-6 h-6 text-emerald" />
            </div>
            <span className="font-display font-bold text-2xl text-[#F3F4F6]">MockMate</span>
          </div>
        </motion.div>

        {/* Step progress */}
        <div className="flex gap-2 mb-6">
          <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-emerald' : 'bg-white/10'}`} />
          <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-emerald' : 'bg-white/10'}`} />
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-strong rounded-3xl p-8">
          {step === 1 ? (
            <>
              <div className="mb-6">
                <h2 className="font-display font-bold text-2xl text-[#F3F4F6]">Create account</h2>
                <p className="text-[#94A3B8] text-sm mt-1">Step 1 of 2 — Basic info</p>
              </div>
              <div className="space-y-4">
                <InputField label="Full Name" icon={User} type="text" value={form.fullName}
                  onChange={v => setForm(f => ({ ...f, fullName: v }))} placeholder="Alex Johnson" required />
                <InputField label="Email" icon={Mail} type="email" value={form.email}
                  onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="you@company.com" required />
                <InputField label="Password" icon={Lock} type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={v => setForm(f => ({ ...f, password: v }))} placeholder="Min. 6 characters" required
                  suffix={
                    <button type="button" onClick={() => setShowPass(s => !s)} className="text-[#94A3B8]">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                <Button type="button" className="w-full mt-2" size="lg"
                  onClick={() => {
                    if (!form.fullName || !form.email || !form.password) { toast.error('Fill all fields'); return }
                    setStep(2)
                  }}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h2 className="font-display font-bold text-2xl text-[#F3F4F6]">Your profile</h2>
                <p className="text-[#94A3B8] text-sm mt-1">Step 2 of 2 — Preferences</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Target Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                    <select value={form.targetRole} onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}
                      className="w-full bg-white/3 border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-[#F3F4F6] focus:outline-none focus:border-emerald/50 appearance-none">
                      <option value="">Select role...</option>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Experience Level</label>
                  <div className="flex gap-2">
                    {LEVELS.map(level => (
                      <button key={level} type="button" onClick={() => setForm(f => ({ ...f, experienceLevel: level }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                          form.experienceLevel === level ? 'bg-emerald/15 border border-emerald/40 text-emerald' : 'border border-border text-[#94A3B8] hover:border-emerald/20'
                        }`}>
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map(skill => (
                      <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          form.skills.includes(skill) ? 'bg-emerald/15 border border-emerald/40 text-emerald' : 'border border-border text-[#94A3B8] hover:border-emerald/20'
                        }`}>
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
                  <Button type="submit" loading={loading} className="flex-1">Launch <Zap className="w-4 h-4" /></Button>
                </div>
              </div>
            </form>
          )}
        </motion.div>

        <p className="text-center text-[#94A3B8] text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald hover:text-emerald-hover font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}