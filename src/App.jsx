import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CreateQrPage from './pages/CreateQrPage'
import QrDetailPage from './pages/QrDetailPage'
import EditQrPage from './pages/EditQrPage'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Layout />}>
              <Route path="/qrs/new" element={<CreateQrPage />} />
              <Route element={<ProtectedRoute redirectTo="/qrs/new" />}>
                <Route path="/" element={<DashboardPage />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route path="/qrs/:id" element={<QrDetailPage />} />
                <Route path="/qrs/:id/edit" element={<EditQrPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
