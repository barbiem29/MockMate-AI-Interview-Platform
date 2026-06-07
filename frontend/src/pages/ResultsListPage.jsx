import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, Target, Zap, ChevronRight } from 'lucide-react'
import { resultAPI } from '../services/api'
import { Card, HireBadge, Badge, Skeleton, GlowOrbs, ScoreRing } from '../components/ui/index.jsx'
import toast from 'react-hot-toast'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

export default function ResultsListPage() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    resultAPI.getMyResults()
      .then(res => setResults(res.data.data || []))
      .catch(() => toast.error('Failed to load results'))
      .finally(() => setLoading(false))
  }, [])

  const total    = results.length
  const avgScore = total > 0 ? Math.round(results.reduce((s,r) => s + (r.overallScore||0), 0) / total) : 0
  const hireRate = total > 0 ? Math.round((results.filter(r => r.hireRecommendation === 'Hire').length / total) * 100) : 0

  return (
    <div className="relative min-h-screen">
      <GlowOrbs />
      <div className="relative z-10 space-y-6">

        {!loading && total > 0 && (
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Sessions', value: total,         icon: BarChart3 },
              { label: 'Avg Score',      value: `${avgScore}%`, icon: Target },
              { label: 'Hire Rate',      value: `${hireRate}%`, icon: Zap },
            ].map(({ label, value, icon: Icon }) => (
              <motion.div key={label} variants={fadeUp}>
                <Card className="p-5">
                  <div className="w-8 h-8 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-emerald" />
                  </div>
                  <p className="font-display font-bold text-2xl text-[#F3F4F6]">{value}</p>
                  <p className="text-xs text-[#94A3B8] mt-1">{label}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          ) : total === 0 ? (
            <Card className="p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-7 h-7 text-[#4B5563]" />
              </div>
              <h3 className="font-display font-bold text-[#F3F4F6] mb-2">No interviews yet</h3>
              <p className="text-[#94A3B8] text-sm mb-6">Start your first session to see results here.</p>
              <Link to="/interview/start">
                <button className="inline-flex items-center gap-2 bg-emerald text-bg px-6 py-2.5 rounded-xl font-medium text-sm">
                  <Zap className="w-4 h-4" /> Begin Interview
                </button>
              </Link>
            </Card>
          ) : (
            <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="space-y-4">
              {results.map(result => (
                <motion.div key={result._id} variants={fadeUp}>
                  <Link to={`/results/${result.interview?._id || result.interview}`}>
                    <Card className="p-5 group" hover>
                      <div className="flex items-center gap-5">
                        <div className="flex-shrink-0">
                          <ScoreRing score={result.overallScore} size={72} strokeWidth={5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-display font-bold text-[#F3F4F6] group-hover:text-emerald transition-colors truncate">
                                {result.interview?.interviewTitle || 'Mock Interview'}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge variant="default">{result.interview?.interviewType}</Badge>
                                <Badge variant="default">{result.interview?.experienceLevel}</Badge>
                                <span className="text-xs text-[#94A3B8]">{result.totalQuestions} questions · {result.correctAnswers} correct</span>
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <HireBadge recommendation={result.hireRecommendation} />
                              <p className="text-xs text-[#94A3B8] mt-1">
                                {new Date(result.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            {[
                              { label: 'Confidence',    v: result.confidenceScore },
                              { label: 'Communication', v: result.communicationScore },
                              { label: 'Accuracy',      v: result.accuracy },
                            ].map(({ label, v }) => (
                              <div key={label} className="flex-1">
                                <div className="flex justify-between mb-0.5">
                                  <span className="text-[10px] text-[#4B5563]">{label}</span>
                                  <span className="text-[10px] font-mono text-[#94A3B8]">{v}%</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald rounded-full" style={{ width: `${v}%`, opacity: 0.7 }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#4B5563] group-hover:text-emerald transition-colors flex-shrink-0" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}