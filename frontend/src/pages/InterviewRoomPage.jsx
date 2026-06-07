import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Send, ChevronRight, Zap, AlertTriangle,
  CheckCircle, Loader2, Brain, Flag, Eye, Mic, MicOff, WifiOff
} from 'lucide-react'
import { interviewAPI, proctorAPI } from '../services/api'
import { Button, Badge, GlowOrbs, Spinner } from '../components/ui/index.jsx'
import toast from 'react-hot-toast'

const MAX_Q = 10

export default function InterviewRoomPage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const location     = useLocation()

  const [interview, setInterview]           = useState(null)
  const [question, setQuestion]             = useState(null)
  const [answers, setAnswers]               = useState([])
  const [currentAnswer, setCurrentAnswer]   = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [elapsed, setElapsed]               = useState(0)
  const [qTimer, setQTimer]                 = useState(0)
  const [phase, setPhase]                   = useState('init')
  const [lastScore, setLastScore]           = useState(null)
  const [warnings, setWarnings]             = useState(0)
  const [showWarning, setShowWarning]       = useState(false)
  const [ending, setEnding]                 = useState(false)
  const [voiceActive, setVoiceActive]       = useState(false)
  const [voiceSupported]                    = useState(
    () => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  )

  const globalTimer    = useRef(null)
  const questionTimer  = useRef(null)
  const hasInit        = useRef(false)
  const recognitionRef = useRef(null)
  const answersRef     = useRef([])

  useEffect(() => { answersRef.current = answers }, [answers])

  // ── INIT ──────────────────────────────────────────────
  useEffect(() => {
    if (hasInit.current) return
    hasInit.current = true

    interviewAPI.getById(id)
      .then(res => {
        const iv = res.data.data
        setInterview(iv)

        // Check if firstQuestion was passed via navigation state
        const firstQuestion = location.state?.firstQuestion
        if (firstQuestion && firstQuestion._id && firstQuestion.questionText) {
          console.log('[INIT] Using firstQuestion from nav state:', firstQuestion._id)
          setQuestion(firstQuestion)
          setPhase('answering')
        } else {
          // Fallback: fetch from backend
          console.log('[INIT] No firstQuestion in state, fetching from backend')
          fetchQuestion()
        }
      })
      .catch(err => {
        console.error('[INIT] Error:', err)
        toast.error('Could not load interview')
        navigate('/dashboard')
      })
  }, [id])

  // ── Global timer ──────────────────────────────────────
  useEffect(() => {
    globalTimer.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(globalTimer.current)
  }, [])

  // ── Per-question timer ────────────────────────────────
  useEffect(() => {
    clearInterval(questionTimer.current)
    if (phase !== 'answering') return
    setQTimer(0)
    questionTimer.current = setInterval(() => setQTimer(t => t + 1), 1000)
    return () => clearInterval(questionTimer.current)
  }, [question?._id, phase])

  // ── Proctoring ────────────────────────────────────────
  useEffect(() => {
    function onHide()  { if (document.hidden) logProctor('tab-switch', 'Tab switched', 'medium') }
    function onPaste() { logProctor('copy-paste', 'Paste detected', 'high') }
    document.addEventListener('visibilitychange', onHide)
    document.addEventListener('paste', onPaste)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      document.removeEventListener('paste', onPaste)
    }
  }, [])

  async function logProctor(eventType, description, severity) {
    setWarnings(w => w + 1)
    setShowWarning(true)
    setTimeout(() => setShowWarning(false), 3000)
    try { await proctorAPI.addEvent({ interviewId: id, eventType, description, severity }) } catch (_) {}
  }

  // ── Fetch question ────────────────────────────────────
  function fetchQuestion() {
    setPhase('loading_next')
    setCurrentAnswer('')
    setSelectedOption('')
    setLastScore(null)
    stopVoice()

    let attempts = 0

    function tryFetch() {
      interviewAPI.getNextQuestion(id)
        .then(res => {
          console.log('[FETCH] Response:', res.data)

          if (!res.data.data) {
            console.log('[FETCH] null returned — done')
            setPhase('done')
            return
          }

          setQuestion(res.data.data)
          setPhase('answering')
        })
        .catch(err => {
          attempts++
          console.error(`[FETCH] Attempt ${attempts} failed:`, err.message)

          if (attempts < 3) {
            console.log(`[FETCH] Retrying in 2s...`)
            setTimeout(tryFetch, 2000)
          } else {
            const count = answersRef.current.length
            if (count === 0) {
              setPhase('terminated')
            } else {
              toast.error('Could not load next question. Session ended.')
              setPhase('done')
            }
          }
        })
    }

    tryFetch()
  }

  // ── Submit answer ─────────────────────────────────────
  async function handleSubmit() {
    if (!question) return
    const answerText = question.questionType === 'mcq' ? selectedOption : currentAnswer
    if (!answerText.trim()) { toast.error('Please provide an answer'); return }

    clearInterval(questionTimer.current)
    stopVoice()
    setPhase('evaluating')

    try {
      const payload = {
        userAnswerText:     question.questionType !== 'mcq' ? currentAnswer : '',
        selectedOption:     question.questionType === 'mcq' ? selectedOption : '',
        timeTakenInSeconds: qTimer,
      }

      const res = await interviewAPI.submitAnswer(id, question._id, payload)
      console.log('[SUBMIT] Response:', res.data)

      const { mergedFinalScore } = res.data.data
      setLastScore(mergedFinalScore)

      const newAnswers = [
        ...answersRef.current,
        { score: mergedFinalScore, questionText: question.questionText }
      ]
      setAnswers(newAnswers)
      answersRef.current = newAnswers

      console.log(`[SUBMIT] Total answered: ${newAnswers.length}/${MAX_Q}`)

      if (newAnswers.length >= MAX_Q) {
        setPhase('done')
      } else {
        setTimeout(() => fetchQuestion(), 1500)
      }
    } catch (err) {
      console.error('[SUBMIT] Error:', err)
      toast.error(err.response?.data?.message || 'Submission failed. Try again.')
      setPhase('answering')
    }
  }

  // ── End interview ─────────────────────────────────────
  async function handleEnd() {
    if (ending) return
    setEnding(true)

    try {
      const res = await interviewAPI.end(id)
      console.log('[END] Response:', res.data)

      if (res.data.terminated) {
        toast.error('Interview terminated — no answers recorded.')
        setTimeout(() => navigate('/dashboard'), 2500)
        return
      }

      toast.success('Generating report...')
      setTimeout(() => navigate(`/results/${id}`), 1200)
    } catch (err) {
      console.error('[END] Error:', err)

      if (err.response?.status === 400 && err.response?.data?.terminated) {
        toast.error('Interview terminated due to a technical issue.')
        setTimeout(() => navigate('/dashboard'), 3000)
        return
      }

      toast.error(err.response?.data?.message || 'Failed to end interview')
      setEnding(false)
    }
  }

  // ── Voice ─────────────────────────────────────────────
  function startVoice() {
    if (!voiceSupported) { toast.error('Voice not supported — use Chrome/Edge'); return }
    const SR  = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.continuous     = true
    rec.interimResults = true
    rec.lang           = 'en-US'
    rec.onresult = e => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('')
      setCurrentAnswer(t)
    }
    rec.onerror = () => setVoiceActive(false)
    rec.onend   = () => setVoiceActive(false)
    rec.start()
    recognitionRef.current = rec
    setVoiceActive(true)
    toast.success('Listening...')
  }

  function stopVoice() {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null }
    setVoiceActive(false)
  }

  const fmt   = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const isMCQ = question?.questionType === 'mcq'

  // ── Screens ───────────────────────────────────────────
  if (phase === 'init') {
    return (
      <div className="min-h-screen bg-bg grid-bg flex items-center justify-center">
        <GlowOrbs />
        <div className="relative z-10 text-center space-y-4">
          <Spinner size="xl" />
          <p className="font-mono text-[#94A3B8] tracking-widest text-sm">INITIALIZING AI EVALUATOR</p>
          <p className="text-xs text-[#4B5563]">Preparing your first question...</p>
        </div>
      </div>
    )
  }

  if (phase === 'terminated') {
    return (
      <div className="min-h-screen bg-bg grid-bg flex items-center justify-center p-4">
        <GlowOrbs />
        <div className="relative z-10 glass-strong rounded-3xl p-10 max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/30 flex items-center justify-center mx-auto">
            <WifiOff className="w-8 h-8 text-danger" />
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-[#F3F4F6] mb-3">Interview Terminated</h3>
            <p className="text-[#94A3B8] leading-relaxed">
              Interview terminated due to a technical issue. We apologize for the inconvenience and will investigate the problem.
            </p>
          </div>
          <Button onClick={() => navigate('/dashboard')} variant="secondary" size="lg" className="w-full">
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg grid-bg relative flex flex-col">
      <GlowOrbs />

      {/* HUD */}
      <header className="relative z-20 px-4 lg:px-8 py-4 border-b border-border glass-strong">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald/10 border border-emerald/25 flex items-center justify-center emerald-glow">
              <Zap className="w-4 h-4 text-emerald" />
            </div>
            <div>
              <p className="text-sm font-display font-bold text-[#F3F4F6] truncate max-w-[180px] lg:max-w-sm">
                {interview?.interviewTitle || 'Interview'}
              </p>
              <p className="text-xs text-[#94A3B8] font-mono capitalize">
                {interview?.interviewType} · {interview?.experienceLevel}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            {Array.from({ length: MAX_Q }).map((_, i) => (
              <div key={i} className={`h-1.5 w-5 rounded-full transition-all duration-500 ${
                i < answers.length   ? 'bg-emerald' :
                i === answers.length ? 'bg-emerald/40 animate-pulse' :
                                       'bg-white/10'
              }`} />
            ))}
            <span className="text-xs font-mono text-[#94A3B8] ml-2">{answers.length}/{MAX_Q}</span>
          </div>

          <div className="flex items-center gap-2">
            {warnings > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <Eye className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs font-mono text-yellow-400">{warnings}</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-border">
              <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span className="text-sm font-mono text-[#F3F4F6] tabular-nums">{fmt(elapsed)}</span>
            </div>
            <Button variant="danger" size="sm" onClick={handleEnd} loading={ending}>
              <Flag className="w-3.5 h-3.5" /> End
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 glass-strong rounded-xl border border-yellow-500/40 text-yellow-400"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Proctoring event detected</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-3xl space-y-5">

          {/* AI status bar */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4 flex items-center gap-4 border-l-2 border-emerald"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/25 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-emerald" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-emerald/80 tracking-widest">AI INTERVIEWER</p>
              <p className="text-sm text-[#94A3B8]">
                {phase === 'loading_next' && 'AI is generating your next question...'}
                {phase === 'answering'    && (isMCQ ? 'Select the best answer.' : 'Type your answer clearly.')}
                {phase === 'evaluating'   && 'AI is evaluating your answer...'}
                {phase === 'done'         && 'All questions answered! Generate your report.'}
              </p>
            </div>
            <div className="flex-shrink-0">
              {(phase === 'evaluating' || phase === 'loading_next') && <Spinner size="sm" />}
              {phase === 'answering' && (
                <span className="text-xs font-mono text-[#94A3B8] tabular-nums">{fmt(qTimer)}</span>
              )}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">

            {phase === 'loading_next' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass rounded-2xl p-8 space-y-4"
              >
                <div className="flex gap-2">
                  <div className="shimmer-bg h-6 w-16 rounded-full" />
                  <div className="shimmer-bg h-6 w-20 rounded-full" />
                </div>
                <div className="shimmer-bg h-7 rounded-lg w-full" />
                <div className="shimmer-bg h-7 rounded-lg w-5/6" />
                <div className="mt-4 space-y-3">
                  {[1,2,3,4].map(i => <div key={i} className="shimmer-bg h-14 rounded-xl" />)}
                </div>
              </motion.div>
            )}

            {phase === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl p-10 text-center space-y-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald/10 border border-emerald/30 flex items-center justify-center mx-auto emerald-glow">
                  <CheckCircle className="w-8 h-8 text-emerald" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-2xl text-[#F3F4F6] mb-2">Interview Complete!</h3>
                  <p className="text-[#94A3B8]">
                    Answered {answers.length} question{answers.length !== 1 ? 's' : ''}.
                    {answers.length === MAX_Q ? ' All 10 completed!' : ''}
                  </p>
                </div>
                {answers.length > 0 && (
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {answers.map((a, i) => (
                      <div key={i} title={`Q${i+1}: ${a.score}%`}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-mono font-bold border ${
                          a.score >= 70 ? 'bg-emerald/10 border-emerald/30 text-emerald' :
                          a.score >= 40 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                                          'bg-danger/10 border-danger/30 text-danger'
                        }`}
                      >
                        {a.score}
                      </div>
                    ))}
                  </div>
                )}
                <Button onClick={handleEnd} loading={ending} size="lg">
                  Generate Report <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {(phase === 'answering' || phase === 'evaluating') && question && (
              <motion.div key={question._id}
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                className="glass-strong rounded-2xl overflow-hidden"
              >
                <div className="px-6 pt-6 pb-5 border-b border-border">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge variant={
                      question.difficulty === 'hard'   ? 'danger'  :
                      question.difficulty === 'medium' ? 'warning' : 'emerald'
                    }>
                      {question.difficulty}
                    </Badge>
                    <Badge variant="default">{question.questionType}</Badge>
                    {question.category && <Badge variant="default">{question.category}</Badge>}
                    <span className="ml-auto text-xs font-mono text-[#94A3B8]">
                      Q{answers.length + 1} / {MAX_Q}
                    </span>
                  </div>
                  <p className="font-display text-xl text-[#F3F4F6] leading-snug">{question.questionText}</p>
                </div>

                <div className="p-6 space-y-4">
                  {isMCQ && question.options?.length > 0 ? (
                    <div className="space-y-3">
                      {question.options.map((opt, i) => (
                        <motion.button key={i}
                          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          disabled={phase === 'evaluating'}
                          onClick={() => setSelectedOption(opt)}
                          className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-200 ${
                            selectedOption === opt
                              ? 'bg-emerald/10 border-emerald/40 text-emerald'
                              : 'border-border text-[#94A3B8] hover:border-emerald/30 hover:bg-white/3'
                          }`}
                        >
                          <span className={`inline-flex w-6 h-6 rounded-lg items-center justify-center text-xs font-mono mr-3 flex-shrink-0 border ${
                            selectedOption === opt ? 'bg-emerald text-bg border-emerald' : 'border-border'
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="relative">
                      <textarea
                        value={currentAnswer}
                        onChange={e => setCurrentAnswer(e.target.value)}
                        disabled={phase === 'evaluating'}
                        placeholder="Type your answer clearly and in detail..."
                        rows={6}
                        className="w-full bg-white/3 border border-border rounded-xl px-4 py-3 text-sm text-[#F3F4F6] placeholder:text-[#4B5563] focus:outline-none focus:border-emerald/50 resize-none transition-all leading-relaxed"
                      />
                      {voiceSupported && (
                        <button
                          onClick={() => voiceActive ? stopVoice() : startVoice()}
                          disabled={phase === 'evaluating'}
                          className={`absolute bottom-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            voiceActive ? 'bg-danger text-white animate-pulse' : 'bg-emerald/10 border border-emerald/20 text-emerald hover:bg-emerald/20'
                          }`}
                        >
                          {voiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  )}

                  <AnimatePresence>
                    {lastScore !== null && phase === 'evaluating' && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-4 rounded-xl bg-emerald/5 border border-emerald/20 flex items-center gap-3"
                      >
                        <Loader2 className="w-4 h-4 text-emerald animate-spin flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-emerald">Score: {lastScore}%</p>
                          <p className="text-xs text-[#94A3B8]">Generating next question...</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      {!isMCQ && <span className="text-xs text-[#4B5563]">{currentAnswer.length} chars</span>}
                      {voiceActive && (
                        <span className="flex items-center gap-1 text-xs text-danger animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-danger inline-block" />
                          Recording
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={handleSubmit}
                      loading={phase === 'evaluating'}
                      disabled={phase === 'evaluating' || (isMCQ ? !selectedOption : !currentAnswer.trim())}
                    >
                      Submit <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {answers.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl px-5 py-3">
              <div className="flex items-center gap-3 overflow-x-auto">
                <span className="text-xs font-mono text-[#4B5563] whitespace-nowrap flex-shrink-0">HISTORY</span>
                {answers.map((a, i) => (
                  <div key={i} title={`Q${i+1}: ${a.score}%`}
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold border ${
                      a.score >= 70 ? 'bg-emerald/10 border-emerald/30 text-emerald' :
                      a.score >= 40 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                                      'bg-danger/10 border-danger/30 text-danger'
                    }`}
                  >
                    {a.score}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}