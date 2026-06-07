// Route paths
export const ROUTES = {
  SPLASH: '/',
  WELCOME: '/welcome',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  HOME: '/home',
  DOCTORS: '/home/doctors',
  DOCTOR_DETAIL: '/home/doctors/:id',
  PROFILE: '/home/profile',
  FAVORITES: '/home/favorites',
  APPOINTMENTS: '/home/appointments',
  APPOINTMENT_SUMMARY: '/home/appointments/summary',
  PAYMENTS: '/home/payments',
  NOTIFICATIONS: '/home/notifications',
  CHATS: '/home/chats',
  CALENDAR: '/home/calendar',
  SETTINGS: '/home/settings',
  HELP: '/home/help'
} as const

// LocalStorage keys
export const STORAGE_KEYS = {
  USER: 'MEDI_USER',
  DOCTORS: 'MEDI_DOCTORS',
  APPOINTMENTS: 'MEDI_APPOINTMENTS',
  PAYMENT_METHODS: 'MEDI_PAYMENT_METHODS',
  NOTIFICATIONS: 'MEDI_NOTIFICATIONS',
  FAQS: 'MEDI_FAQS',
  CURRENT_USER: 'CURRENT_USER',
  REVIEWS: 'MEDI_REVIEWS'
} as const

// Appointment statuses
export const APPOINTMENT_STATUS = {
  UPCOMING: 'upcoming',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

// Payment types
export const PAYMENT_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  APPLEPAY: 'applepay',
  PAYPAL: 'paypal',
  GOOGLEPAY: 'googlepay'
} as const

// Notification types
export const NOTIFICATION_TYPES = {
  APPOINTMENT: 'appointment',
  REMINDER: 'reminder',
  SYSTEM: 'system'
} as const

// FAQ categories
export const FAQ_CATEGORIES = {
  POPULAR: 'popular',
  GENERAL: 'general',
  SERVICES: 'services'
} as const

// Time slots for appointments
export const TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM'
] as const

// Gender options
export const GENDER_OPTIONS = {
  MALE: 'male',
  FEMALE: 'female'
} as const

// Filter options for doctors
export const DOCTOR_FILTERS = {
  ALL: 'all',
  FAVORITES: 'favorites',
  MALE: 'male',
  FEMALE: 'female',
  HIGH_RATING: 'high_rating'
} as const

// Cancel reasons
export const CANCEL_REASONS = [
  'Rescheduling needed',
  'Weather conditions',
  'Unexpected work',
  'Personal emergency',
  'Others'
] as const