import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import AuthProvider from './context/AuthProvider'
import SettingsProvider from './context/SettingsProvider'

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  )
}
