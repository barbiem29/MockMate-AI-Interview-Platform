import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Briefcase, Save, Zap } from 'lucide-react'
import { userAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Button, Card, Badge, GlowOrbs } from '../components/ui/index.jsx'
import toast from 'react-hot-toast'

const SKILLS_LIST = ['JavaScript','Python','React','Node.js','Java','SQL','TypeScript','Go','AWS','Docker','System Design','C++']
const LEVELS      = ['beginner','intermediate','advanced']

export default function ProfilePage() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    fullName:        user?.fullName || '',
    targetRole:      user?.targetRole || '',
    experienceLevel: user?.experienceLevel || 'beginner',
    skills:          user?.skills || [],
  })
  const [loading, setLoading] = useState(false)

  function toggleSkill(skill) {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill]
    }))
  }

  async function handleSave() {
    setLoading(true)
    try {
      await userAPI.updateProfile(form)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <GlowOrbs />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-2xl space-y-6">

        {/* Avatar card */}
        <Card className="p-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald/10 border-2 border-emerald/30 flex items-center justify-center emerald-glow flex-shrink-0">
            <span className="font-display font-bold text-3xl text-emerald">
              {user?.fullName?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-[#F3F4F6]">{user?.fullName}</h2>
            <p className="text-[#94A3B8]">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="emerald">{user?.role}</Badge>
              <Badge variant="default">{user?.experienceLevel}</Badge>
            </div>
          </div>
        </Card>

        {/* Edit form */}
        <Card className="p-6 space-y-5">
          <h3 className="font-display font-semibold text-[#F3F4F6]">Edit Profile</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                <input type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full bg-white/3 border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-[#F3F4F6] focus:outline-none focus:border-emerald/50 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Target Role</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                <input type="text" value={form.targetRole} onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}
                  placeholder="e.g. Senior Engineer"
                  className="w-full bg-white/3 border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-[#F3F4F6] focus:outline-none focus:border-emerald/50 transition-all" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Experience Level</label>
            <div className="flex gap-2">
              {LEVELS.map(level => (
                <button key={level} onClick={() => setForm(f => ({ ...f, experienceLevel: level }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                    form.experienceLevel === level
                      ? 'bg-emerald/15 border border-emerald/40 text-emerald'
                      : 'border border-border text-[#94A3B8] hover:border-emerald/20'
                  }`}>
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Skills</label>
            <div className="flex flex-wrap gap-2">
              {SKILLS_LIST.map(skill => (
                <button key={skill} onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    form.skills.includes(skill)
                      ? 'bg-emerald/15 border border-emerald/40 text-emerald'
                      : 'border border-border text-[#94A3B8] hover:border-emerald/20'
                  }`}>
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} loading={loading}>
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </Card>

        {user?.badges?.length > 0 && (
          <Card className="p-6">
            <h3 className="font-display font-semibold text-[#F3F4F6] mb-4">Badges</h3>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald/8 border border-emerald/20">
                  <Zap className="w-3 h-3 text-emerald" />
                  <span className="text-xs font-medium text-[#F3F4F6]">{badge}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

      </motion.div>
    </div>
  )
}