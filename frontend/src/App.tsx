import { Routes, Route } from 'react-router-dom'
import Splash from './pages/Splash.tsx'
import Welcome from './pages/Welcome.tsx'
import Login from './pages/Login.tsx'
import SignUp from './pages/SignUp.tsx'
import ForgotPassword from './pages/ForgotPassword.tsx'
import VerifyResetCode from './pages/VerifyResetCode.tsx'
import ResetPassword from './pages/ResetPassword.tsx'
import Home from './pages/Home.tsx'
import Doctors from './pages/Doctors.tsx'
import DoctorDetail from './pages/DoctorDetail.tsx'
import Profile from './pages/Profile.tsx'
import Favorites from './pages/Favorites.tsx'
import Payments from './pages/Payments.tsx'
import AppointmentBooking from './pages/AppointmentBooking.tsx'
import PaymentDetails from './pages/PaymentDetails.tsx'
import AppointmentSummary from './pages/AppointmentSummary.tsx'
import Notifications from './pages/Notifications.tsx'
import Chats from './pages/Chats.tsx'
import ChatConversation from './pages/ChatConversation.tsx'
import Calendar from './pages/Calendar.tsx'
import Settings from './pages/Settings.tsx'
import NotificationSettings from './pages/NotificationSettings.tsx'
import PasswordManager from './pages/PasswordManager.tsx'
import HelpCentre from './pages/HelpCentre.tsx'
import PrivacyPolicy from './pages/PrivacyPolicy.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Splash />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-reset-code" element={<VerifyResetCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Protected Routes */}
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/home/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />
      <Route path="/home/doctors/:id" element={<ProtectedRoute><DoctorDetail /></ProtectedRoute>} />
      <Route path="/home/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/home/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
      <Route path="/home/appointments" element={<ProtectedRoute><AppointmentBooking /></ProtectedRoute>} />
      <Route path="/home/appointments/payment" element={<ProtectedRoute><PaymentDetails /></ProtectedRoute>} />
      <Route path="/home/appointments/summary" element={<ProtectedRoute><AppointmentSummary /></ProtectedRoute>} />
      <Route path="/home/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
      <Route path="/home/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/home/chats" element={<ProtectedRoute><Chats /></ProtectedRoute>} />
      <Route path="/home/chats/:doctorId" element={<ProtectedRoute><ChatConversation /></ProtectedRoute>} />
      <Route path="/home/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
      <Route path="/home/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/home/settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
      <Route path="/home/settings/password" element={<ProtectedRoute><PasswordManager /></ProtectedRoute>} />
      <Route path="/home/help" element={<ProtectedRoute><HelpCentre /></ProtectedRoute>} />
      <Route path="/home/privacy-policy" element={<ProtectedRoute><PrivacyPolicy /></ProtectedRoute>} />
    </Routes>
  )
}

export default App