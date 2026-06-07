import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Play, Zap, Code, Brain, Building2, Shield,
  Eye, Mic, FileText, ArrowRight, Upload, X, CheckCircle
} from 'lucide-react'
import { interviewAPI } from '../services/api'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Button, Card, GlowOrbs, Spinner } from '../components/ui/index.jsx'
import toast from 'react-hot-toast'

const INTERVIEW_TYPES = [
  { id: 'technical',    label: 'Technical',    icon: Code,     desc: 'Coding & architecture' },
  { id: 'behavioral',   label: 'Behavioral',   icon: Brain,    desc: 'Soft skills & culture fit' },
  { id: 'mixed',        label: 'Mixed',        icon: Zap,      desc: 'Balanced session', recommended: true },
  { id: 'resume-based', label: 'Resume Based', icon: FileText, desc: 'Based on your resume' },
]
const COMPANY_MODES = ['general','google','amazon','microsoft','tcs','infosys','wipro']
const LEVELS        = ['beginner','intermediate','advanced']
const SKILLS_LIST   = ['JavaScript','Python','React','Node.js','Java','SQL','TypeScript','Go','System Design','Docker','AWS','C++']

function SectionHeader({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-emerald/10 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-emerald" />
      </div>
      <h3 className="font-display font-semibold text-sm text-[#F3F4F6] uppercase tracking-wider">{label}</h3>
    </div>
  )
}

export default function StartInterviewPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const fileRef   = useRef(null)

  const [loading,       setLoading]       = useState(false)
  const [resumeFile,    setResumeFile]     = useState(null)
  const [resumeParsing, setResumeParsing]  = useState(false)
  const [resumeText,    setResumeText]     = useState('')
  const [resumeSkills,  setResumeSkills]   = useState([])

  const [config, setConfig] = useState({
    interviewTitle:      '',
    interviewType:       'mixed',
    companyMode:         'general',
    targetRole:          user?.targetRole || '',
    experienceLevel:     user?.experienceLevel || 'beginner',
    skillsTargeted:      user?.skills?.slice(0, 3) || [],
    adaptiveModeEnabled: true,
    voiceModeEnabled:    false,
    proctoringEnabled:   true,
  })

  function toggleSkill(skill) {
    setConfig(c => ({
      ...c,
      skillsTargeted: c.skillsTargeted.includes(skill)
        ? c.skillsTargeted.filter(s => s !== skill)
        : [...c.skillsTargeted, skill]
    }))
  }

  async function handleResumeUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') { toast.error('Only PDF files supported'); return }

    setResumeFile(file)
    setResumeParsing(true)

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const res = await api.post('/resume/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const { rawText, extractedSkills } = res.data.data
      setResumeText(rawText)
      setResumeSkills(extractedSkills)

      // Auto-add extracted skills
      setConfig(c => ({
        ...c,
        skillsTargeted: [...new Set([...c.skillsTargeted, ...extractedSkills])],
        interviewType: 'resume-based'
      }))

      toast.success(`Resume parsed! Found ${extractedSkills.length} skills.`)
    } catch (err) {
      toast.error('Failed to parse resume')
      console.error(err)
    } finally {
      setResumeParsing(false)
    }
  }

  function removeResume() {
    setResumeFile(null)
    setResumeText('')
    setResumeSkills([])
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleStart() {
  setLoading(true)
  try {
    const payload = {
      ...config,
      interviewTitle: config.interviewTitle ||
        `${config.interviewType} Interview — ${new Date().toLocaleDateString()}`,
      resumeUsed:  !!resumeFile,
      resumeText:  resumeText,
    }
    const res = await interviewAPI.start(payload)
    const { interview, firstQuestion } = res.data.data
    toast.success('Interview started!')
    // Pass firstQuestion in navigation state — avoids extra API call
    navigate(`/interview/${interview._id}`, {
      state: { firstQuestion }
    })
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to start interview')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="relative min-h-screen">
      <GlowOrbs />
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-3xl mx-auto space-y-6"
      >

        {/* Interview Type */}
        <Card className="p-6">
          <SectionHeader icon={Zap} label="Interview Type" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {INTERVIEW_TYPES.map(({ id, label, icon: Icon, desc, recommended }) => (
              <button key={id}
                onClick={() => setConfig(c => ({ ...c, interviewType: id }))}
                className={`relative p-4 rounded-xl border text-left transition-all ${
                  config.interviewType === id
                    ? 'bg-emerald/10 border-emerald/40'
                    : 'border-border text-[#94A3B8] hover:border-emerald/20 hover:bg-white/3'
                }`}
              >
                {recommended && (
                  <span className="absolute -top-2 left-3 px-2 py-0.5 bg-emerald text-bg text-[10px] font-bold rounded-full">REC</span>
                )}
                <Icon className={`w-5 h-5 mb-2 ${config.interviewType === id ? 'text-emerald' : ''}`} />
                <p className="text-sm font-medium text-[#F3F4F6]">{label}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Resume Upload — shows when resume-based selected */}
        {config.interviewType === 'resume-based' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6">
              <SectionHeader icon={FileText} label="Upload Resume (PDF)" />
              {!resumeFile ? (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-emerald/20 rounded-xl p-8 text-center cursor-pointer hover:border-emerald/40 hover:bg-emerald/3 transition-all"
                >
                  <Upload className="w-8 h-8 text-emerald/50 mx-auto mb-3" />
                  <p className="text-sm text-[#94A3B8]">Click to upload your resume PDF</p>
                  <p className="text-xs text-[#4B5563] mt-1">Max 5MB · PDF only</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald/5 border border-emerald/20">
                  {resumeParsing ? (
                    <Spinner size="sm" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F3F4F6] truncate">{resumeFile.name}</p>
                    {resumeSkills.length > 0 && (
                      <p className="text-xs text-emerald mt-0.5">
                        Skills found: {resumeSkills.join(', ')}
                      </p>
                    )}
                    {resumeParsing && (
                      <p className="text-xs text-[#94A3B8] mt-0.5">Parsing resume...</p>
                    )}
                  </div>
                  <button onClick={removeResume} className="text-[#94A3B8] hover:text-danger transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Company Mode */}
        <Card className="p-6">
          <SectionHeader icon={Building2} label="Company Mode" />
          <div className="flex flex-wrap gap-2">
            {COMPANY_MODES.map(mode => (
              <button key={mode}
                onClick={() => setConfig(c => ({ ...c, companyMode: mode }))}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  config.companyMode === mode
                    ? 'bg-emerald/15 border border-emerald/40 text-emerald'
                    : 'border border-border text-[#94A3B8] hover:border-emerald/20'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </Card>

        {/* Details */}
        <Card className="p-6">
          <SectionHeader icon={Brain} label="Details" />
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Session Title</label>
              <input
                type="text" value={config.interviewTitle}
                onChange={e => setConfig(c => ({ ...c, interviewTitle: e.target.value }))}
                placeholder="e.g. FAANG Prep Round 1"
                className="w-full bg-white/3 border border-border rounded-xl px-4 py-3 text-sm text-[#F3F4F6] placeholder:text-[#4B5563] focus:outline-none focus:border-emerald/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Target Role</label>
              <input
                type="text" value={config.targetRole}
                onChange={e => setConfig(c => ({ ...c, targetRole: e.target.value }))}
                placeholder="e.g. Senior Software Engineer"
                className="w-full bg-white/3 border border-border rounded-xl px-4 py-3 text-sm text-[#F3F4F6] placeholder:text-[#4B5563] focus:outline-none focus:border-emerald/50 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Experience Level</label>
            <div className="flex gap-2">
              {LEVELS.map(level => (
                <button key={level}
                  onClick={() => setConfig(c => ({ ...c, experienceLevel: level }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                    config.experienceLevel === level
                      ? 'bg-emerald/15 border border-emerald/40 text-emerald'
                      : 'border border-border text-[#94A3B8] hover:border-emerald/20'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Skills */}
        <Card className="p-6">
          <SectionHeader icon={Code} label="Skills to Target" />
          <div className="flex flex-wrap gap-2">
            {SKILLS_LIST.map(skill => (
              <button key={skill} onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  config.skillsTargeted.includes(skill)
                    ? 'bg-emerald/15 border border-emerald/40 text-emerald'
                    : 'border border-border text-[#94A3B8] hover:border-emerald/20'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          {resumeSkills.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-emerald mb-2">From your resume:</p>
              <div className="flex flex-wrap gap-2">
                {resumeSkills.map(skill => (
                  <span key={skill} className="px-2.5 py-1 rounded-lg text-xs bg-emerald/10 border border-emerald/25 text-emerald">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Options */}
        <Card className="p-6">
          <SectionHeader icon={Shield} label="Session Options" />
          <div className="space-y-4">
            {[
              { key: 'adaptiveModeEnabled', icon: Zap,  label: 'Adaptive Difficulty', desc: 'AI adjusts difficulty based on performance' },
              { key: 'proctoringEnabled',   icon: Eye,  label: 'Proctoring',           desc: 'Monitor integrity during the session' },
              { key: 'voiceModeEnabled',    icon: Mic,  label: 'Voice Mode',           desc: 'Answer using microphone (Chrome only)' },
            ].map(({ key, icon: Icon, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald/8 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-emerald/70" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#F3F4F6]">{label}</p>
                    <p className="text-xs text-[#94A3B8]">{desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setConfig(c => ({ ...c, [key]: !c[key] }))}
                  className={`w-11 h-6 rounded-full transition-all duration-300 relative ${config[key] ? 'bg-emerald' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-bg rounded-full transition-all duration-300 ${config[key] ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Launch */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="glass-strong rounded-3xl p-6 flex items-center justify-between"
        >
          <div>
            <p className="font-display font-bold text-[#F3F4F6]">Ready to begin?</p>
            <p className="text-sm text-[#94A3B8]">
              {config.interviewType === 'resume-based' && !resumeFile
                ? '⚠ Upload resume for best results'
                : 'AI evaluator is standing by'
              }
            </p>
          </div>
          <Button onClick={handleStart} loading={loading} size="lg">
            <Play className="w-5 h-5" /> Launch <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>

      </motion.div>
    </div>
  )
}