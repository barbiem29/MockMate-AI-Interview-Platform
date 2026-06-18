import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, ArrowRight, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function NeuralBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let nodes = [], connections = [], pulses = [], t = 0

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect()
      canvas.width  = rect.width
      canvas.height = rect.height
      init()
    }

    function init() {
      const w = canvas.width, h = canvas.height
      nodes = []
      connections = []
      pulses = []

      const COLORS = [
        { r: 46,  g: 230, b: 166 },
        { r: 255, g: 230, b: 50  },
        { r: 46,  g: 230, b: 166 },
        { r: 46,  g: 230, b: 166 },
        { r: 255, g: 200, b: 40  },
      ]

      for (let i = 0; i < 35; i++) {
        const c = COLORS[Math.floor(Math.random() * COLORS.length)]
        nodes.push({
          x:     50 + Math.random() * (w - 100),
          y:     30 + Math.random() * (h - 60),
          r:     Math.random() * 3 + 1.5,
          phase: Math.random() * Math.PI * 2,
          speed: 0.015 + Math.random() * 0.025,
          fade:  0,
          color: c,
        })
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d  = Math.sqrt(dx*dx + dy*dy)
          if (d < 170 && Math.random() > 0.4) {
            connections.push({ a: i, b: j, d })
          }
        }
      }
    }

    function spawnPulse() {
      if (Math.random() < 0.07 && connections.length) {
        const c = connections[Math.floor(Math.random() * connections.length)]
        const srcColor = nodes[c.a].color
        pulses.push({
          c,
          progress: 0,
          speed: 0.007 + Math.random() * 0.013,
          size:  Math.random() * 2 + 1.5,
          color: srcColor,
        })
      }
    }

    function draw() {
      const w = canvas.width, h = canvas.height
      ctx.clearRect(0, 0, w, h)
      t += 0.016
      spawnPulse()

      // Subtle grid dots
      for (let x = 0; x < w; x += 40) {
        for (let y = 0; y < h; y += 40) {
          ctx.beginPath()
          ctx.arc(x, y, 0.7, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(46,230,166,0.04)'
          ctx.fill()
        }
      }

      // Connections
      connections.forEach(c => {
        const a = nodes[c.a], b = nodes[c.b]
        const base = Math.max(0, 0.1 - c.d / 1700)
        const boost = (a.fade + b.fade) * 0.06
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = `rgba(46,230,166,${base + boost})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      })

      // Pulses
      pulses = pulses.filter(p => p.progress < 1)
      pulses.forEach(p => {
        p.progress += p.speed
        const a = nodes[p.c.a], b = nodes[p.c.b]
        const x = a.x + (b.x - a.x) * p.progress
        const y = a.y + (b.y - a.y) * p.progress
        const fade = Math.sin(p.progress * Math.PI)
        const { r, g, b: bl } = p.color

        const grad = ctx.createRadialGradient(x, y, 0, x, y, p.size * 7)
        grad.addColorStop(0, `rgba(${r},${g},${bl},${0.55 * fade})`)
        grad.addColorStop(1, `rgba(${r},${g},${bl},0)`)
        ctx.beginPath()
        ctx.arc(x, y, p.size * 7, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${bl},${0.9 * fade})`
        ctx.fill()

        if (p.progress > 0.92) {
          nodes[p.c.b].fade = 1
        }
      })

      // Nodes
      nodes.forEach(n => {
        n.fade *= 0.96
        const pulse = Math.sin(t * n.speed * 60 + n.phase) * 0.25 + 0.75
        const { r, g, b } = n.color

        if (n.fade > 0.05) {
          const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 9)
          grd.addColorStop(0, `rgba(${r},${g},${b},${0.45 * n.fade})`)
          grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.r * 9, 0, Math.PI * 2)
          ctx.fillStyle = grd
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${0.25 + pulse * 0.4 + n.fade * 0.35})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}

function InputField({ label, icon: Icon, type, value, onChange, placeholder, required, suffix }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: 11,
        fontWeight: 500,
        color: '#94A3B8',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 8,
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon style={{
          position: 'absolute', left: 14, top: '50%',
          transform: 'translateY(-50%)',
          width: 16, height: 16,
          color: focused ? '#2EE6A6' : '#4B5563',
          transition: 'color 0.2s',
          pointerEvents: 'none',
        }} />
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required={required}
          style={{
            width: '100%',
            background: focused ? 'rgba(46,230,166,0.06)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${focused ? 'rgba(46,230,166,0.5)' : 'rgba(46,230,166,0.12)'}`,
            borderRadius: 12,
            paddingLeft: 42,
            paddingRight: suffix ? 42 : 14,
            paddingTop: 12,
            paddingBottom: 12,
            fontSize: 14,
            color: '#F3F4F6',
            outline: 'none',
            transition: 'all 0.2s',
            boxSizing: 'border-box',
          }}
        />
        {suffix && (
          <div style={{
            position: 'absolute', right: 14, top: '50%',
            transform: 'translateY(-50%)',
          }}>
            {suffix}
          </div>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

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
    <div style={{
      minHeight: '100vh',
      background: '#0A0F14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <NeuralBackground />

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 160,
        background: 'linear-gradient(transparent, #0A0F14)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 2 }}>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 16px rgba(46,230,166,0.3)',
                  '0 0 32px rgba(46,230,166,0.6)',
                  '0 0 16px rgba(46,230,166,0.3)',
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                width: 48, height: 48,
                borderRadius: 14,
                background: 'rgba(46,230,166,0.1)',
                border: '1px solid rgba(46,230,166,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Zap style={{ width: 22, height: 22, color: '#2EE6A6' }} />
            </motion.div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#F3F4F6', lineHeight: 1.1 }}>
                MockMate
              </p>
              <p style={{ margin: 0, fontSize: 10, fontFamily: 'monospace', color: 'rgba(46,230,166,0.6)', letterSpacing: '0.15em' }}>
                AI ENGINE v2.0
              </p>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#94A3B8' }}>Elite AI Interview Engine</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}
          style={{
            background: 'rgba(17,24,39,0.88)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(46,230,166,0.15)',
            borderRadius: 24,
            padding: 32,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top shimmer line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(46,230,166,0.5), transparent)',
          }} />

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            style={{ marginBottom: 28 }}
          >
            <h2 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 24, color: '#F3F4F6' }}>
              Sign in
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#94A3B8' }}>
              Continue your interview preparation
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <InputField
                label="Email" icon={Mail} type="email"
                value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))}
                placeholder="you@company.com" required
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.37 }}>
              <InputField
                label="Password" icon={Lock}
                type={showPass ? 'text' : 'password'}
                value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))}
                placeholder="••••••••" required
                suffix={
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#4B5563', display: 'flex' }}>
                    {showPass
                      ? <EyeOff style={{ width: 16, height: 16 }} />
                      : <Eye    style={{ width: 16, height: 16 }} />
                    }
                  </button>
                }
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: '0 0 32px rgba(46,230,166,0.5)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%',
                  background: '#2EE6A6',
                  color: '#0A0F14',
                  border: 'none',
                  borderRadius: 12,
                  padding: '13px 0',
                  fontSize: 14,
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 0 20px rgba(46,230,166,0.25)',
                  transition: 'box-shadow 0.2s',
                  marginTop: 4,
                }}
              >
                {loading
                  ? <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(10,15,20,0.3)', borderTopColor: '#0A0F14', animation: 'spin 0.8s linear infinite' }} />
                  : <><span>Sign in</span><ArrowRight style={{ width: 16, height: 16 }} /></>
                }
              </motion.button>
            </motion.div>
          </form>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#94A3B8' }}
          >
            New here?{' '}
            <Link to="/signup" style={{ color: '#2EE6A6', fontWeight: 600, textDecoration: 'none' }}>
              Create account
            </Link>
          </motion.p>

          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(46,230,166,0.2), transparent)',
          }} />
        </motion.div>

        {/* Footer tags */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24 }}
        >
          {['AI Powered', 'Adaptive', 'Real-time'].map((tag, i) => (
            <motion.div key={tag} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.08 }}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(46,230,166,0.5)', display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: '#4B5563', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{tag}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}