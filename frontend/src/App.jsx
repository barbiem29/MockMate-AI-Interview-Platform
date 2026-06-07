import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import StartInterviewPage from './pages/StartInterviewPage'
import InterviewRoomPage from './pages/InterviewRoomPage'
import ResultPage from './pages/ResultPage'
import ResultsListPage from './pages/ResultsListPage'
import ProfilePage from './pages/ProfilePage'
import AppLayout from './components/layout/AppLayout'

function Loader() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-emerald/30 border-t-emerald animate-spin" />
        <p className="text-xs font-mono text-emerald/60 tracking-widest">LOADING</p>
      </div>
    </div>
  )
}

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login"  element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/signup" element={<PublicOnly><SignupPage /></PublicOnly>} />

      <Route element={<Protected><AppLayout /></Protected>}>
        <Route path="/dashboard"       element={<DashboardPage />} />
        <Route path="/interview/start" element={<StartInterviewPage />} />
        <Route path="/results"         element={<ResultsListPage />} />
        <Route path="/profile"         element={<ProfilePage />} />
      </Route>

      <Route path="/interview/:id"        element={<Protected><InterviewRoomPage /></Protected>} />
      <Route path="/results/:interviewId" element={<Protected><ResultPage /></Protected>} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#F3F4F6',
              border: '1px solid rgba(46,230,166,0.2)',
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#2EE6A6', secondary: '#0A0F14' } },
            error:   { iconTheme: { primary: '#FF5D73', secondary: '#0A0F14' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}