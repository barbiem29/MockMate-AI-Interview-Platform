import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Zap, ArrowRight, User, Mail, Lock, Briefcase } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const ROLES  = ['Software Engineer','Frontend Developer','Backend Developer','Full Stack Developer','Data Scientist','DevOps Engineer','Product Manager','Other']
const LEVELS = ['beginner','intermediate','advanced']
const SKILLS = ['JavaScript','Python','React','Node.js','Java','SQL','TypeScript','Go','AWS','Docker']

function NeuralBackground() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId, nodes = [], connections = [], pulses = [], t = 0

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      init()
    }

    function init() {
      const w = canvas.width, h = canvas.height
      nodes = []; connections = []; pulses = []
      const COLORS = [
        { r:46, g:230, b:166 },{ r:255, g:230, b:50 },
        { r:46, g:230, b:166 },{ r:46, g:230, b:166 },{ r:255, g:200, b:40 },
      ]
      for (let i = 0; i < 35; i++) {
        const c = COLORS[Math.floor(Math.random() * COLORS.length)]
        nodes.push({ x: 50+Math.random()*(w-100), y: 30+Math.random()*(h-60), r: Math.random()*3+1.5, phase: Math.random()*Math.PI*2, speed: 0.015+Math.random()*0.025, fade: 0, color: c })
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i+1; j < nodes.length; j++) {
          const dx = nodes[i].x-nodes[j].x, dy = nodes[i].y-nodes[j].y
          const d = Math.sqrt(dx*dx+dy*dy)
          if (d < 170 && Math.random() > 0.4) connections.push({ a:i, b:j, d })
        }
      }
    }

    function draw() {
      const w = canvas.width, h = canvas.height
      ctx.clearRect(0,0,w,h)
      t += 0.016
      if (Math.random() < 0.07 && connections.length) {
        const c = connections[Math.floor(Math.random()*connections.length)]
        pulses.push({ c, progress:0, speed:0.007+Math.random()*0.013, size:Math.random()*2+1.5, color:nodes[c.a].color })
      }
      for (let x=0; x<w; x+=40) for (let y=0; y<h; y+=40) {
        ctx.beginPath(); ctx.arc(x,y,0.7,0,Math.PI*2)
        ctx.fillStyle='rgba(46,230,166,0.04)'; ctx.fill()
      }
      connections.forEach(c => {
        const a=nodes[c.a], b=nodes[c.b]
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y)
        ctx.strokeStyle=`rgba(46,230,166,${Math.max(0,0.1-c.d/1700)+(a.fade+b.fade)*0.06})`
        ctx.lineWidth=0.5; ctx.stroke()
      })
      pulses = pulses.filter(p => p.progress < 1)
      pulses.forEach(p => {
        p.progress += p.speed
        const a=nodes[p.c.a], b=nodes[p.c.b]
        const x=a.x+(b.x-a.x)*p.progress, y=a.y+(b.y-a.y)*p.progress
        const fade=Math.sin(p.progress*Math.PI), {r,g,b:bl}=p.color
        const grad=ctx.createRadialGradient(x,y,0,x,y,p.size*7)
        grad.addColorStop(0,`rgba(${r},${g},${bl},${0.55*fade})`); grad.addColorStop(1,`rgba(${r},${g},${bl},0)`)
        ctx.beginPath(); ctx.arc(x,y,p.size*7,0,Math.PI*2); ctx.fillStyle=grad; ctx.fill()
        ctx.beginPath(); ctx.arc(x,y,p.size,0,Math.PI*2); ctx.fillStyle=`rgba(${r},${g},${bl},${0.9*fade})`; ctx.fill()
        if (p.progress > 0.92) nodes[p.c.b].fade = 1
      })
      nodes.forEach(n => {
        n.fade *= 0.96
        const pulse=Math.sin(t*n.speed*60+n.phase)*0.25+0.75, {r,g,b}=n.color
        if (n.fade > 0.05) {
          const grd=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*9)
          grd.addColorStop(0,`rgba(${r},${g},${b},${0.45*n.fade})`); grd.addColorStop(1,`rgba(${r},${g},${b},0)`)
          ctx.beginPath(); ctx.arc(n.x,n.y,n.r*9,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill()
        }
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(${r},${g},${b},${0.25+pulse*0.4+n.fade*0.35})`; ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    resize(); window.addEventListener('resize', resize); draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} />
}

function SInputField({ label, icon: Icon, type, value, onChange, placeholder, required, suffix }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{ display:'block', fontSize:11, fontWeight:500, color:'#94A3B8', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>{label}</label>
      <div style={{ position:'relative' }}>
        <Icon style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:16, height:16, color: focused?'#2EE6A6':'#4B5563', transition:'color 0.2s', pointerEvents:'none' }} />
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={placeholder} required={required}
          style={{ width:'100%', background: focused?'rgba(46,230,166,0.06)':'rgba(255,255,255,0.04)', border:`1px solid ${focused?'rgba(46,230,166,0.5)':'rgba(46,230,166,0.12)'}`, borderRadius:12, paddingLeft:42, paddingRight: suffix?42:14, paddingTop:12, paddingBottom:12, fontSize:14, color:'#F3F4F6', outline:'none', transition:'all 0.2s', boxSizing:'border-box' }}
        />
        {suffix && <div style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)' }}>{suffix}</div>}
      </div>
    </div>
  )
}

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate   = useNavigate()
  const [step, setStep]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ fullName:'', email:'', password:'', targetRole:'', experienceLevel:'beginner', skills:[] })

  function toggleSkill(skill) {
    setForm(f => ({ ...f, skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill] }))
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

  const btnStyle = {
    width:'100%', background:'#2EE6A6', color:'#0A0F14', border:'none', borderRadius:12,
    padding:'13px 0', fontSize:14, fontFamily:'Syne, sans-serif', fontWeight:700,
    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
    gap:8, boxShadow:'0 0 20px rgba(46,230,166,0.25)', marginTop:4,
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0A0F14', display:'flex', alignItems:'center', justifyContent:'center', padding:16, position:'relative', overflow:'hidden', fontFamily:"'DM Sans', sans-serif" }}>
      <NeuralBackground />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:160, background:'linear-gradient(transparent,#0A0F14)', pointerEvents:'none', zIndex:1 }} />

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:2 }}>

        {/* Logo */}
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
          style={{ textAlign:'center', marginBottom:28 }}
        >
          <div style={{ display:'inline-flex', alignItems:'center', gap:12, marginBottom:8 }}>
            <motion.div
              animate={{ boxShadow:['0 0 16px rgba(46,230,166,0.3)','0 0 32px rgba(46,230,166,0.6)','0 0 16px rgba(46,230,166,0.3)'] }}
              transition={{ duration:2.5, repeat:Infinity }}
              style={{ width:44, height:44, borderRadius:14, background:'rgba(46,230,166,0.1)', border:'1px solid rgba(46,230,166,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}
            >
              <Zap style={{ width:20, height:20, color:'#2EE6A6' }} />
            </motion.div>
            <span style={{ fontFamily:'Syne, sans-serif', fontWeight:800, fontSize:22, color:'#F3F4F6' }}>MockMate</span>
          </div>
          <p style={{ margin:0, fontSize:13, color:'#94A3B8' }}>Build your candidate profile</p>
        </motion.div>

        {/* Step bar */}
        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          {[1,2].map(s => (
            <div key={s} style={{ flex:1, height:3, borderRadius:4, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
              <motion.div
                animate={{ width: step >= s ? '100%' : '0%' }}
                transition={{ duration:0.4, ease:'easeInOut' }}
                style={{ height:'100%', background:'#2EE6A6', borderRadius:4 }}
              />
            </div>
          ))}
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity:0, y:24, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
          transition={{ duration:0.45, delay:0.1 }}
          style={{ background:'rgba(17,24,39,0.88)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(46,230,166,0.15)', borderRadius:24, padding:28, position:'relative', overflow:'hidden' }}
        >
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(46,230,166,0.45),transparent)' }} />

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="s1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.28 }}>
                <div style={{ marginBottom:24 }}>
                  <h2 style={{ margin:0, fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:22, color:'#F3F4F6' }}>Create account</h2>
                  <p style={{ margin:'5px 0 0', fontSize:13, color:'#94A3B8' }}>Step 1 of 2 — Basic info</p>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <SInputField label="Full Name" icon={User} type="text" value={form.fullName} onChange={v => setForm(f => ({...f,fullName:v}))} placeholder="Alex Johnson" required />
                  <SInputField label="Email" icon={Mail} type="email" value={form.email} onChange={v => setForm(f => ({...f,email:v}))} placeholder="you@company.com" required />
                  <SInputField label="Password" icon={Lock} type={showPass?'text':'password'} value={form.password} onChange={v => setForm(f => ({...f,password:v}))} placeholder="Min. 6 characters" required
                    suffix={<button type="button" onClick={() => setShowPass(s=>!s)} style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:'#4B5563', display:'flex' }}>{showPass?<EyeOff style={{width:16,height:16}}/>:<Eye style={{width:16,height:16}}/>}</button>}
                  />
                  <motion.button type="button" whileHover={{ scale:1.02, boxShadow:'0 0 32px rgba(46,230,166,0.5)' }} whileTap={{ scale:0.97 }}
                    onClick={() => { if (!form.fullName||!form.email||!form.password){toast.error('Fill all fields');return} setStep(2) }}
                    style={btnStyle}
                  >
                    <span>Continue</span><ArrowRight style={{width:16,height:16}}/>
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.form key="s2" onSubmit={handleSubmit} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.28 }}>
                <div style={{ marginBottom:22 }}>
                  <h2 style={{ margin:0, fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:22, color:'#F3F4F6' }}>Your profile</h2>
                  <p style={{ margin:'5px 0 0', fontSize:13, color:'#94A3B8' }}>Step 2 of 2 — Preferences</p>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

                  {/* Target Role */}
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:500, color:'#94A3B8', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Target Role</label>
                    <div style={{ position:'relative' }}>
                      <Briefcase style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'#4B5563', pointerEvents:'none' }} />
                      <select value={form.targetRole} onChange={e => setForm(f => ({...f,targetRole:e.target.value}))}
                        style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(46,230,166,0.12)', borderRadius:12, paddingLeft:42, paddingRight:14, paddingTop:12, paddingBottom:12, fontSize:14, color:'#F3F4F6', outline:'none', appearance:'none', boxSizing:'border-box' }}
                      >
                        <option value="" style={{background:'#111827'}}>Select role...</option>
                        {ROLES.map(r => <option key={r} value={r} style={{background:'#111827'}}>{r}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:500, color:'#94A3B8', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Experience Level</label>
                    <div style={{ display:'flex', gap:8 }}>
                      {LEVELS.map(level => (
                        <button key={level} type="button" onClick={() => setForm(f => ({...f,experienceLevel:level}))}
                          style={{ flex:1, padding:'10px 0', borderRadius:12, fontSize:13, fontWeight:500, textTransform:'capitalize', cursor:'pointer', transition:'all 0.2s', border: form.experienceLevel===level?'1px solid rgba(46,230,166,0.4)':'1px solid rgba(46,230,166,0.1)', background: form.experienceLevel===level?'rgba(46,230,166,0.12)':'rgba(255,255,255,0.03)', color: form.experienceLevel===level?'#2EE6A6':'#94A3B8' }}
                        >{level}</button>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:500, color:'#94A3B8', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Skills</label>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {SKILLS.map(skill => (
                        <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                          style={{ padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer', transition:'all 0.2s', border: form.skills.includes(skill)?'1px solid rgba(46,230,166,0.4)':'1px solid rgba(46,230,166,0.1)', background: form.skills.includes(skill)?'rgba(46,230,166,0.12)':'rgba(255,255,255,0.03)', color: form.skills.includes(skill)?'#2EE6A6':'#94A3B8' }}
                        >{skill}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display:'flex', gap:10 }}>
                    <button type="button" onClick={() => setStep(1)}
                      style={{ flex:1, padding:'12px 0', borderRadius:12, fontSize:14, fontWeight:500, cursor:'pointer', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(46,230,166,0.12)', color:'#94A3B8' }}
                    >Back</button>
                    <motion.button type="submit" disabled={loading} whileHover={{ scale:1.02, boxShadow:'0 0 32px rgba(46,230,166,0.5)' }} whileTap={{ scale:0.97 }}
                      style={{ ...btnStyle, flex:1, width:'auto', margin:0, opacity: loading?0.6:1 }}
                    >
                      {loading
                        ? <div style={{ width:18, height:18, borderRadius:'50%', border:'2px solid rgba(10,15,20,0.3)', borderTopColor:'#0A0F14', animation:'spin 0.8s linear infinite' }} />
                        : <><Zap style={{width:16,height:16}}/><span>Launch</span></>
                      }
                    </motion.button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(46,230,166,0.2),transparent)' }} />
        </motion.div>

        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
          style={{ textAlign:'center', marginTop:20, fontSize:13, color:'#94A3B8' }}
        >
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#2EE6A6', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
        </motion.p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}