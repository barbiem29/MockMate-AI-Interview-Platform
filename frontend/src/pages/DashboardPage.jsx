import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, BarChart3, TrendingUp, Target, Award, Zap, ArrowRight, ChevronRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import { resultAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Card, StatCard, Badge, Skeleton, GlowOrbs, ScoreRing, HireBadge } from '../components/ui/index.jsx'
import toast from 'react-hot-toast'

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
const stagger = { show: { transition: { staggerChildren: 0.07 } } }

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

  const total = results.length
  const avgScore = total > 0 ? Math.round(results.reduce((s, r) => s + (r.overallScore || 0), 0) / total) : 0
  const hireCount = results.filter(r => r.hireRecommendation === 'Hire').length
  const bestScore = total > 0 ? Math.max(...results.map(r => r.overallScore || 0)) : 0
  const lastResult = results[0]

  const trendData = results.slice(0, 8).reverse().map((r, i) => ({
    name: `#${i + 1}`,
    score: r.overallScore || 0,
    confidence: r.confidenceScore || 0,
  }))

  const radarData = lastResult ? [
    { metric: 'Overall',    value: lastResult.overallScore || 0 },
    { metric: 'Confidence', value: lastResult.confidenceScore || 0 },
    { metric: 'Comm.',      value: lastResult.communicationScore || 0 },
    { metric: 'Accuracy',   value: lastResult.accuracy || 0 },
    { metric: 'Time',       value: lastResult.timeManagementScore || 0 },
  ] : []

  return (
    <div className="relative min-h-screen">
      <GlowOrbs />
      <motion.div variants={stagger} initial="hidden" animate="show" className="relative z-10 space-y-6">

        {/* Hero */}
        <motion.div variants={fadeUp} className="glass-strong rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
              <span className="text-xs font-mono text-emerald/80 tracking-widest">SYSTEM READY</span>
            </div>
            <h1 className="font-display font-bold text-3xl text-[#F3F4F6] mb-2">
              Welcome back, <span className="text-gradient">{user?.fullName?.split(' ')[0]}</span>
            </h1>
            <p className="text-[#94A3B8] mb-6 max-w-lg">
              {total === 0
                ? 'Start your first AI-powered interview and get instant performance insights.'
                : `You've completed ${total} interview${total !== 1 ? 's' : ''}. ${avgScore >= 70 ? 'Outstanding performance!' : 'Keep practicing to improve.'}`
              }
            </p>
            <Link to="/interview/start">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 bg-emerald text-bg px-7 py-3.5 rounded-xl font-display font-bold text-sm"
              >
                <Play className="w-4 h-4" /> Begin New Interview <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Interviews',  value: total,             icon: Target },
            { label: 'Avg Score',   value: `${avgScore}%`,    icon: BarChart3 },
            { label: 'Hire Rate',   value: total > 0 ? `${Math.round((hireCount/total)*100)}%` : '—', icon: Award },
            { label: 'Best Score',  value: total > 0 ? `${bestScore}%` : '—', icon: TrendingUp },
          ].map(stat => (
            <motion.div key={stat.label} variants={fadeUp}>
              <StatCard {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display font-bold text-[#F3F4F6]">Performance Trend</h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5">Last {trendData.length} sessions</p>
                </div>
                <Badge variant="emerald">Live</Badge>
              </div>
              {loading ? <Skeleton className="h-44" /> : trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={175}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#2EE6A6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2EE6A6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#4B5563" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <YAxis domain={[0,100]} stroke="#4B5563" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(46,230,166,0.2)', borderRadius: 12, color: '#F3F4F6' }} />
                    <Area type="monotone" dataKey="score" stroke="#2EE6A6" strokeWidth={2} fill="url(#sg)" dot={{ fill: '#2EE6A6', r: 3 }} />
                    <Area type="monotone" dataKey="confidence" stroke="#6FFFCF" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-44 flex items-center justify-center text-[#94A3B8] text-sm">Complete interviews to see your trend</div>
              )}
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="p-6 flex flex-col items-center justify-center min-h-[240px]">
              <p className="text-xs font-mono text-[#94A3B8] tracking-widest mb-4">LATEST SESSION</p>
              {lastResult ? (
                <>
                  <ScoreRing score={lastResult.overallScore || 0} size={120} />
                  <div className="mt-4 text-center">
                    <HireBadge recommendation={lastResult.hireRecommendation} />
                    <p className="text-xs text-[#94A3B8] mt-2">{lastResult.interview?.interviewTitle || 'Mock Interview'}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[#94A3B8]">No sessions yet</p>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Radar + Recent */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div variants={fadeUp}>
            <Card className="p-6">
              <h3 className="font-display font-bold text-[#F3F4F6] mb-1">Skill Radar</h3>
              <p className="text-xs text-[#94A3B8] mb-4">Latest session breakdown</p>
              {loading ? <Skeleton className="h-44" /> : radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(46,230,166,0.1)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <Radar dataKey="value" stroke="#2EE6A6" fill="#2EE6A6" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-44 flex items-center justify-center text-[#94A3B8] text-sm">Complete an interview to see radar</div>
              )}
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-[#F3F4F6]">Recent Sessions</h3>
                <Link to="/results" className="text-xs text-emerald hover:text-emerald-hover flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.slice(0, 4).map(r => (
                    <Link key={r._id} to={`/results/${r.interview?._id || r.interview}`}>
                      <motion.div whileHover={{ x: 3 }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-border transition-all">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.hireRecommendation === 'Hire' ? 'bg-emerald' : r.hireRecommendation === 'No Hire' ? 'bg-danger' : 'bg-yellow-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#F3F4F6] truncate">{r.interview?.interviewTitle || 'Mock Interview'}</p>
                          <p className="text-xs text-[#94A3B8]">{r.interview?.interviewType} · {r.totalQuestions} questions</p>
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
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Zap className="w-8 h-8 text-[#4B5563] mb-3" />
                  <p className="text-sm text-[#94A3B8]">No interviews yet</p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

      </motion.div>
    </div>
  )
}