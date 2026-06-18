import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Play, BarChart3, TrendingUp, Target, Award,
  Zap, ArrowRight, ChevronRight, Sparkles
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts'
import { resultAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Card, Badge, Skeleton, GlowOrbs, ScoreRing, HireBadge } from '../components/ui/index.jsx'
import toast from 'react-hot-toast'

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }
const stagger = { show: { transition: { staggerChildren: 0.08 } } }

export default function DashboardPage() {
  const { user } = useAuth()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    resultAPI.getMyResults()
      .then(res => setResults(res.data.data || []))
      .catch(() => toast.error('Could not load results'))
      .finally(() => setLoading(false))
  }, [])

  const total     = results.length
  const avgScore  = total > 0 ? Math.round(results.reduce((s, r) => s + (r.overallScore || 0), 0) / total) : 0
  const hireCount = results.filter(r => r.hireRecommendation === 'Hire').length
  const bestScore = total > 0 ? Math.max(...results.map(r => r.overallScore || 0)) : 0
  const lastResult = results[0]

  const trendData = results.slice(0, 8).reverse().map((r, i) => ({
    name: `#${i + 1}`,
    score:      r.overallScore      || 0,
    confidence: r.confidenceScore   || 0,
  }))

  const radarData = lastResult ? [
    { metric: 'Overall',    value: lastResult.overallScore        || 0 },
    { metric: 'Confidence', value: lastResult.confidenceScore     || 0 },
    { metric: 'Comm.',      value: lastResult.communicationScore  || 0 },
    { metric: 'Accuracy',   value: lastResult.accuracy            || 0 },
    { metric: 'Time',       value: lastResult.timeManagementScore || 0 },
  ] : []

  return (
    <div className="relative min-h-screen">
      <GlowOrbs />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 space-y-6"
      >

        {/* ── Hero Banner ── */}
        <motion.div variants={fadeUp}>
          <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
            {/* Animated background orb */}
            <motion.div
              className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
              style={{ background: 'rgba(46,230,166,0.07)' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald/40 to-transparent" />

            <div className="relative z-10">
              <motion.div
                className="flex items-center gap-2 mb-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.span
                  className="w-2 h-2 rounded-full bg-emerald"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-xs font-mono text-emerald/80 tracking-widest">SYSTEM READY</span>
              </motion.div>

              <motion.h1
                className="font-display font-bold text-3xl text-[#F3F4F6] mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                Welcome back,{' '}
                <span className="text-gradient">{user?.fullName?.split(' ')[0]}</span>
              </motion.h1>

              <motion.p
                className="text-[#94A3B8] mb-6 max-w-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                {total === 0
                  ? 'Start your first AI-powered interview and get instant performance insights.'
                  : `You've completed ${total} interview${total !== 1 ? 's' : ''}. ${avgScore >= 70 ? '🔥 Outstanding performance!' : 'Keep practicing to improve.'}`
                }
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link to="/interview/start">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(46,230,166,0.4)' }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-3 bg-emerald text-bg px-7 py-3.5 rounded-xl font-display font-bold text-sm transition-all"
                    style={{ boxShadow: '0 0 20px rgba(46,230,166,0.25)' }}
                  >
                    <Play className="w-4 h-4" />
                    Begin New Interview
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: 'Interviews', value: total,          icon: Target,    color: '#2EE6A6' },
            { label: 'Avg Score',  value: `${avgScore}%`, icon: BarChart3, color: '#2EE6A6' },
            {
              label: 'Hire Rate',
              value: total > 0 ? `${Math.round((hireCount / total) * 100)}%` : '—',
              icon: Award, color: '#2EE6A6'
            },
            {
              label: 'Best Score',
              value: total > 0 ? `${bestScore}%` : '—',
              icon: TrendingUp, color: '#2EE6A6'
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass rounded-2xl p-5 relative overflow-hidden group cursor-default"
              style={{ border: '1px solid rgba(46,230,166,0.1)' }}
            >
              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                style={{ background: 'rgba(46,230,166,0.04)' }}
              />
              <div className="relative z-10">
                <div className="w-9 h-9 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center mb-3 group-hover:bg-emerald/20 transition-colors duration-200">
                  <stat.icon className="w-4 h-4 text-emerald" />
                </div>
                <motion.p
                  className="text-2xl font-display font-bold text-[#F3F4F6]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-xs text-[#94A3B8] mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Charts Row ── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Trend chart */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <motion.div
              className="glass rounded-2xl p-6"
              whileHover={{ boxShadow: '0 8px 32px rgba(46,230,166,0.08)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display font-bold text-[#F3F4F6]">Performance Trend</h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5">Last {trendData.length} sessions</p>
                </div>
                <Badge variant="emerald">Live</Badge>
              </div>
              {loading ? (
                <Skeleton className="h-44" />
              ) : trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={175}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#2EE6A6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2EE6A6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#4B5563" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <YAxis domain={[0, 100]} stroke="#4B5563" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(46,230,166,0.2)', borderRadius: 12, color: '#F3F4F6' }} />
                    <Area type="monotone" dataKey="score" stroke="#2EE6A6" strokeWidth={2} fill="url(#sg)" dot={{ fill: '#2EE6A6', r: 3 }} />
                    <Area type="monotone" dataKey="confidence" stroke="#6FFFCF" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center gap-3 text-center">
                  <motion.div
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <BarChart3 className="w-8 h-8 text-[#4B5563]" />
                  </motion.div>
                  <p className="text-sm text-[#94A3B8]">Complete interviews to see your trend</p>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Latest score ring */}
          <motion.div variants={fadeUp}>
            <motion.div
              className="glass rounded-2xl p-6 flex flex-col items-center justify-center min-h-[240px]"
              whileHover={{ boxShadow: '0 8px 32px rgba(46,230,166,0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-xs font-mono text-[#94A3B8] tracking-widest mb-4">LATEST SESSION</p>
              {lastResult ? (
                <motion.div
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  <ScoreRing score={lastResult.overallScore || 0} size={120} />
                  <div className="mt-4 text-center">
                    <HireBadge recommendation={lastResult.hireRecommendation} />
                    <p className="text-xs text-[#94A3B8] mt-2">
                      {lastResult.interview?.interviewTitle || 'Mock Interview'}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="text-center"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <p className="text-sm text-[#94A3B8]">No sessions yet</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* ── Radar + Recent Sessions ── */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Radar */}
          <motion.div variants={fadeUp}>
            <motion.div
              className="glass rounded-2xl p-6"
              whileHover={{ boxShadow: '0 8px 32px rgba(46,230,166,0.08)' }}
            >
              <h3 className="font-display font-bold text-[#F3F4F6] mb-1">Skill Radar</h3>
              <p className="text-xs text-[#94A3B8] mb-4">Latest session breakdown</p>
              {loading ? (
                <Skeleton className="h-44" />
              ) : radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(46,230,166,0.1)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <Radar dataKey="value" stroke="#2EE6A6" fill="#2EE6A6" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-44 flex items-center justify-center text-[#94A3B8] text-sm">
                  Complete an interview to see radar
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Recent Sessions */}
          <motion.div variants={fadeUp}>
            <motion.div
              className="glass rounded-2xl p-6"
              whileHover={{ boxShadow: '0 8px 32px rgba(46,230,166,0.08)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-[#F3F4F6]">Recent Sessions</h3>
                <Link to="/results" className="text-xs text-emerald hover:text-[#6FFFCF] flex items-center gap-1 transition-colors">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.slice(0, 4).map((r, i) => (
                    <Link key={r._id} to={`/results/${r.interview?._id || r.interview}`}>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i }}
                        whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.04)' }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-emerald/10 transition-all duration-200 cursor-pointer"
                      >
                        <motion.div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            r.hireRecommendation === 'Hire'    ? 'bg-emerald' :
                            r.hireRecommendation === 'No Hire' ? 'bg-danger'  : 'bg-yellow-400'
                          }`}
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#F3F4F6] truncate">
                            {r.interview?.interviewTitle || 'Mock Interview'}
                          </p>
                          <p className="text-xs text-[#94A3B8]">
                            {r.interview?.interviewType} · {r.totalQuestions} questions
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-mono font-bold text-emerald">{r.overallScore}%</p>
                          <p className="text-xs text-[#94A3B8]">{r.finalRating}</p>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Zap className="w-8 h-8 text-[#4B5563]" />
                  </motion.div>
                  <p className="text-sm text-[#94A3B8]">No interviews yet</p>
                  <Link to="/interview/start">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className="text-xs text-emerald hover:text-[#6FFFCF] transition-colors cursor-pointer"
                    >
                      Start your first →
                    </motion.span>
                  </Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  )
}