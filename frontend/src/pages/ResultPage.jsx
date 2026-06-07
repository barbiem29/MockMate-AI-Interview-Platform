import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, AlertCircle, Zap, ChevronRight, Target, TrendingUp, MessageSquare, Clock, Brain } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { resultAPI } from '../services/api'
import { Card, ScoreRing, HireBadge, Badge, ProgressBar, GlowOrbs, Spinner, Button } from '../components/ui/index.jsx'
import toast from 'react-hot-toast'

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }
const stagger = { show: { transition: { staggerChildren: 0.07 } } }

export default function ResultPage() {
  const { interviewId } = useParams()
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    let attempts = 0
    setLoading(true)

    async function loadResult() {
      try {
        const res = await resultAPI.getByInterviewId(interviewId)
        setResult(res.data.data)
        setLoading(false)
      } catch (err) {
        if (attempts < 5) {
          attempts++
          setRetrying(true)
          setTimeout(loadResult, 2000)
        } else {
          toast.error('Could not load result')
          setLoading(false)
          setRetrying(false)
        }
      }
    }

    loadResult()
  }, [interviewId])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg grid-bg flex items-center justify-center">
        <GlowOrbs />
        <div className="relative z-10 text-center space-y-4">
          <Spinner size="xl" />
          <p className="font-mono text-[#94A3B8] tracking-widest text-sm">
            {retrying ? 'SAVING REPORT...' : 'GENERATING REPORT'}
          </p>
          {retrying && (
            <p className="text-xs text-[#4B5563]">This may take a few seconds...</p>
          )}
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <GlowOrbs />
        <div className="relative z-10 text-center space-y-4">
          <p className="text-[#94A3B8]">Result not found</p>
          <Link to="/results" className="text-emerald hover:text-emerald-hover">
            ← Back to results
          </Link>
        </div>
      </div>
    )
  }

  const radarData = [
    { metric: 'Overall',    value: result.overallScore        || 0 },
    { metric: 'Accuracy',   value: result.accuracy            || 0 },
    { metric: 'Confidence', value: result.confidenceScore     || 0 },
    { metric: 'Comm.',      value: result.communicationScore  || 0 },
    { metric: 'Time Mgmt',  value: result.timeManagementScore || 0 },
  ]

  return (
    <div className="min-h-screen bg-bg grid-bg relative">
      <GlowOrbs />
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <Link to="/results" className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F3F4F6] transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Results
          </Link>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

          {/* Hero */}
          <motion.div variants={fadeUp} className="glass-strong rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none bg-emerald/5" />
            <div className="relative z-10">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald" />
                    <span className="text-xs font-mono text-[#94A3B8] tracking-widest">SESSION COMPLETE</span>
                  </div>
                  <h1 className="font-display font-bold text-3xl text-[#F3F4F6] mb-2">
                    {result.interview?.interviewTitle || 'Interview Report'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="default">{result.interview?.interviewType}</Badge>
                    <Badge variant="default">{result.interview?.experienceLevel}</Badge>
                    <Badge variant="default">{result.totalQuestions} questions</Badge>
                    <span className="text-[#94A3B8] text-sm">
                      {new Date(result.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <ScoreRing score={result.overallScore || 0} size={130} />
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-mono text-[#94A3B8] mb-1">FINAL RATING</p>
                      <p className="font-display font-bold text-lg text-emerald">{result.finalRating}</p>
                    </div>
                    <HireBadge recommendation={result.hireRecommendation} />
                  </div>
                </div>
              </div>

              {result.reportText && (
                <div className="mt-6 p-4 rounded-xl bg-emerald/5 border border-emerald/15">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-emerald" />
                    <span className="text-xs font-mono text-emerald/80">AI SUMMARY</span>
                  </div>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{result.reportText}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Metrics */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Accuracy',      value: `${result.accuracy || 0}%`,            icon: Target },
              { label: 'Confidence',    value: `${result.confidenceScore || 0}%`,      icon: TrendingUp },
              { label: 'Communication', value: `${result.communicationScore || 0}%`,   icon: MessageSquare },
              { label: 'Time Mgmt',     value: `${result.timeManagementScore || 0}%`,  icon: Clock },
              { label: 'Correct',       value: `${result.correctAnswers || 0}/${result.totalQuestions || 0}`, icon: CheckCircle },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label} className="p-4 text-center" hover>
                <div className="w-8 h-8 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-4 h-4 text-emerald" />
                </div>
                <p className="font-display font-bold text-xl text-[#F3F4F6]">{value}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">{label}</p>
              </Card>
            ))}
          </motion.div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div variants={fadeUp}>
              <Card className="p-6">
                <h3 className="font-display font-bold text-[#F3F4F6] mb-1">Performance Radar</h3>
                <p className="text-xs text-[#94A3B8] mb-4">Multi-dimensional analysis</p>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(46,230,166,0.08)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <Radar dataKey="value" stroke="#2EE6A6" fill="#2EE6A6" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="p-6">
                <h3 className="font-display font-bold text-[#F3F4F6] mb-1">Skill Breakdown</h3>
                <p className="text-xs text-[#94A3B8] mb-4">Score by category</p>
                {result.skillBreakdown?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.skillBreakdown} layout="vertical">
                      <XAxis type="number" domain={[0,100]} stroke="#4B5563" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                      <YAxis type="category" dataKey="skillName" width={80} stroke="#4B5563" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                      <Tooltip
                        contentStyle={{ background: '#111827', border: '1px solid rgba(46,230,166,0.2)', borderRadius: 8, color: '#F3F4F6' }}
                        formatter={v => [`${v}%`, 'Score']}
                      />
                      <Bar dataKey="score" radius={[0,6,6,0]}>
                        {result.skillBreakdown.map((_, i) => (
                          <Cell key={i} fill={`rgba(46,230,166,${0.4 + i * 0.1})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-[#94A3B8] text-sm">
                    No skill data available
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Score bars */}
          <motion.div variants={fadeUp}>
            <Card className="p-6">
              <h3 className="font-display font-bold text-[#F3F4F6] mb-5">Detailed Scores</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Overall Score',   value: result.overallScore        || 0 },
                  { label: 'Accuracy',        value: result.accuracy            || 0 },
                  { label: 'Confidence',      value: result.confidenceScore     || 0 },
                  { label: 'Communication',   value: result.communicationScore  || 0 },
                  { label: 'Time Management', value: result.timeManagementScore || 0 },
                ].map(({ label, value }) => (
                  <ProgressBar key={label} label={label} value={value} />
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Strengths & Weaknesses */}
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div variants={fadeUp}>
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald" />
                  <h3 className="font-display font-bold text-[#F3F4F6]">Strengths</h3>
                </div>
                {result.strengths?.length > 0 ? (
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <motion.li key={i}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-start gap-2 text-sm text-[#94A3B8]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald mt-1.5 flex-shrink-0" />
                        {s}
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#4B5563]">No specific strengths noted.</p>
                )}
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-danger" />
                  <h3 className="font-display font-bold text-[#F3F4F6]">Areas to Improve</h3>
                </div>
                {result.weaknesses?.length > 0 ? (
                  <ul className="space-y-2">
                    {result.weaknesses.map((w, i) => (
                      <motion.li key={i}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-start gap-2 text-sm text-[#94A3B8]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0" />
                        {w}
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#4B5563]">No weaknesses flagged.</p>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Suggestions */}
          {result.improvementSuggestions?.length > 0 && (
            <motion.div variants={fadeUp}>
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-emerald" />
                  <h3 className="font-display font-bold text-[#F3F4F6]">Improvement Roadmap</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {result.improvementSuggestions.map((s, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.07 * i }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-border"
                    >
                      <span className="w-5 h-5 rounded-lg bg-emerald/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-mono text-emerald">{i + 1}</span>
                      </span>
                      <p className="text-sm text-[#94A3B8]">{s}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pb-8">
            <Link to="/interview/start">
              <Button size="lg"><Zap className="w-4 h-4" /> New Interview</Button>
            </Link>
            <Link to="/results">
              <Button variant="secondary" size="lg">
                <ChevronRight className="w-4 h-4" /> All Results
              </Button>
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}