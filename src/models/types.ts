export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  password: string
  dob: string
  avatarUrl?: string
  fingerprintRegistered?: boolean
  fingerprintCredentialId?: string
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  gender: 'male' | 'female'
  rating: number
  messages: number
  photoUrl: string
  isFavorite: boolean
  experience: number
  focus: string
  about: string
  availability: {
    days: string
    time: string
  }
  schedule: {
    day: string
    slots: string[]
  }[]
}

export interface Appointment {
  id: string
  doctorId: string
  date: string
  time: string
  status: 'upcoming' | 'completed' | 'cancelled'
  patientName: string
  forSelf: boolean
  notes: string
  amount: number
  cancelReason?: string
  cancelNotes?: string
}

export interface Review {
  id: string
  appointmentId: string
  doctorId: string
  rating: number
  comment: string
  date: string
}

export interface PaymentMethod {
  id: string
  type: 'credit' | 'debit' | 'applepay' | 'paypal' | 'googlepay'
  cardNumber?: string
  cardHolder?: string
  expiryDate?: string
  cvv?: string
  isDefault: boolean
}

export interface AppointmentSlot {
  date: string
  times: string[]
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export interface Modal {
  isOpen: boolean
  title: string
  content: string
}

export interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'appointment' | 'reminder' | 'system' | 'scheduled_appointment' | 'scheduled_changes' | 'medical_notes' | 'medical_history_update'
  date: string
}

export interface ChatMessage {
  id: string
  senderId: string
  receiverId: string
  message: string
  timestamp: string
  isRead: boolean
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: 'popular' | 'general' | 'services'
}

export interface Service {
  id: string
  name: string
  brief: string
  isFavorite: boolean
}
