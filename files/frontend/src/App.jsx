import { useState } from 'react'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import CoursePage from './pages/CoursePage.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [activeCourse, setActiveCourse] = useState(null)

  if (!user) return <Landing onLogin={setUser} />
  if (activeCourse) return <CoursePage course={activeCourse} onBack={() => setActiveCourse(null)} />
  if (user.isAdmin) return <AdminDashboard onLogout={() => setUser(null)} />
  return <Dashboard user={user} onLogout={() => setUser(null)} onCourse={setActiveCourse} />
}