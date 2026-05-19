import { Doctor, User, Appointment, PaymentMethod, Notification, FAQ, Service, Review, ChatMessage } from '../models/types'

export const sampleUser: User = {
  id: 'user-1',
  fullName: 'John Smith',
  email: 'john.smith@email.com',
  phone: '+1 234 567 8900',
  password: 'password123',
  dob: '1990-05-15',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
}

export const sampleDoctors: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    gender: 'female',
    rating: 4.8,
    messages: 156,
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    isFavorite: false,
    experience: 12,
    focus: 'Heart Disease Prevention',
    about: 'Dr. Sarah Johnson is a board-certified cardiologist with over 12 years of experience in treating cardiovascular diseases. She specializes in preventive cardiology and heart failure management.',
    availability: {
      days: 'Mon - Fri',
      time: '9:00 AM - 5:00 PM'
    },
    schedule: [
      { day: 'Monday', slots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
      { day: 'Tuesday', slots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
      { day: 'Wednesday', slots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
      { day: 'Thursday', slots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
      { day: 'Friday', slots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] }
    ]
  },
  {
    id: 'doc-2',
    name: 'Dr. Michael Chen',
    specialty: 'Dermatologist',
    gender: 'male',
    rating: 4.9,
    messages: 234,
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    isFavorite: true,
    experience: 8,
    focus: 'Skin Cancer Treatment',
    about: 'Dr. Michael Chen is a renowned dermatologist specializing in skin cancer treatment and cosmetic dermatology. He has published numerous research papers on melanoma detection.',
    availability: {
      days: 'Mon - Sat',
      time: '8:00 AM - 6:00 PM'
    },
    schedule: [
      { day: 'Monday', slots: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'] },
      { day: 'Tuesday', slots: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'] },
      { day: 'Wednesday', slots: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'] },
      { day: 'Thursday', slots: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'] },
      { day: 'Friday', slots: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'] },
      { day: 'Saturday', slots: ['9:00 AM', '10:00 AM', '11:00 AM'] }
    ]
  },
  {
    id: 'doc-3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pediatrician',
    gender: 'female',
    rating: 4.7,
    messages: 189,
    photoUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face',
    isFavorite: false,
    experience: 15,
    focus: 'Child Development',
    about: 'Dr. Emily Rodriguez has been caring for children for over 15 years. She is passionate about childhood development and preventive care for infants and adolescents.',
    availability: {
      days: 'Mon - Fri',
      time: '8:30 AM - 4:30 PM'
    },
    schedule: [
      { day: 'Monday', slots: ['8:30 AM', '9:30 AM', '10:30 AM', '11:30 AM', '1:30 PM', '2:30 PM', '3:30 PM'] },
      { day: 'Tuesday', slots: ['8:30 AM', '9:30 AM', '10:30 AM', '11:30 AM', '1:30 PM', '2:30 PM', '3:30 PM'] },
      { day: 'Wednesday', slots: ['8:30 AM', '9:30 AM', '10:30 AM', '11:30 AM', '1:30 PM', '2:30 PM', '3:30 PM'] },
      { day: 'Thursday', slots: ['8:30 AM', '9:30 AM', '10:30 AM', '11:30 AM', '1:30 PM', '2:30 PM', '3:30 PM'] },
      { day: 'Friday', slots: ['8:30 AM', '9:30 AM', '10:30 AM', '11:30 AM', '1:30 PM', '2:30 PM', '3:30 PM'] }
    ]
  },
  {
    id: 'doc-4',
    name: 'Dr. James Wilson',
    specialty: 'Orthopedic Surgeon',
    gender: 'male',
    rating: 4.6,
    messages: 112,
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face',
    isFavorite: false,
    experience: 20,
    focus: 'Sports Medicine',
    about: 'Dr. James Wilson is a leading orthopedic surgeon with expertise in sports medicine and joint replacement surgery. He has treated numerous professional athletes.',
    availability: {
      days: 'Tue - Sat',
      time: '10:00 AM - 7:00 PM'
    },
    schedule: [
      { day: 'Tuesday', slots: ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'] },
      { day: 'Wednesday', slots: ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'] },
      { day: 'Thursday', slots: ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'] },
      { day: 'Friday', slots: ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'] },
      { day: 'Saturday', slots: ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM'] }
    ]
  }
]

// Generate dates relative to current date
const getUpcomingDate = (daysFromNow: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().split('T')[0]
}

const getPastDate = (daysAgo: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split('T')[0]
}

export const sampleAppointments: Appointment[] = [
  {
    id: 'apt-1',
    doctorId: 'doc-1',
    date: getUpcomingDate(3),
    time: '10:00 AM',
    status: 'upcoming',
    patientName: 'John Smith',
    forSelf: true,
    notes: 'Regular checkup',
    amount: 150
  },
  {
    id: 'apt-2',
    doctorId: 'doc-2',
    date: getPastDate(5),
    time: '02:30 PM',
    status: 'completed',
    patientName: 'John Smith',
    forSelf: true,
    notes: 'Skin examination',
    amount: 120
  }
]

export const samplePaymentMethods: PaymentMethod[] = [
  {
    id: 'pm-1',
    type: 'credit',
    cardNumber: '**** **** **** 4532',
    cardHolder: 'John Smith',
    expiryDate: '12/28',
    cvv: '***',
    isDefault: true
  }
]

export const sampleNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Scheduled Appointment',
    message: 'Your appointment with Dr. Sarah Johnson is tomorrow at 10:00 AM',
    time: '2 hours ago',
    read: false,
    type: 'scheduled_appointment',
    date: new Date().toISOString()
  },
  {
    id: 'notif-2',
    title: 'Schedule Change',
    message: 'Your appointment time has been updated to 2:30 PM',
    time: '5 hours ago',
    read: false,
    type: 'scheduled_changes',
    date: new Date().toISOString()
  },
  {
    id: 'notif-3',
    title: 'Medical Notes Available',
    message: 'Dr. Chen has added notes from your last visit',
    time: 'Yesterday at 3:45 PM',
    read: true,
    type: 'medical_notes',
    date: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'notif-4',
    title: 'Medical History Updated',
    message: 'Your medical history has been updated successfully',
    time: 'Yesterday at 10:30 AM',
    read: true,
    type: 'medical_history_update',
    date: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'notif-5',
    title: 'Appointment Confirmed',
    message: 'Your appointment with Dr. Michael Chen has been confirmed',
    time: '3 days ago',
    read: true,
    type: 'appointment',
    date: new Date(Date.now() - 259200000).toISOString()
  }
]

export const sampleFAQs: FAQ[] = [
  {
    id: 'faq-1',
    question: 'How do I book an appointment?',
    answer: 'To book an appointment, go to the Doctors section, select a doctor, choose an available date and time, and confirm your booking.',
    category: 'popular'
  },
  {
    id: 'faq-2',
    question: 'Can I cancel my appointment?',
    answer: 'Yes, you can cancel your appointment up to 24 hours before the scheduled time. Go to your appointments and select the cancel option.',
    category: 'popular'
  },
  {
    id: 'faq-3',
    question: 'How do I update my profile?',
    answer: 'Go to your Profile section and click on the edit button to update your personal information.',
    category: 'general'
  },
  {
    id: 'faq-4',
    question: 'What payment methods are accepted?',
    answer: 'We accept credit/debit cards, Apple Pay, PayPal, and Google Pay.',
    category: 'services'
  },
  {
    id: 'faq-5',
    question: 'How do I contact support?',
    answer: 'You can contact our support team through the Help Centre by clicking on Contact Us, or email us at support@mediapp.com.',
    category: 'services'
  }
]

export const sampleServices: Service[] = [
  {
    id: 'svc-1',
    name: 'Cardiology Consultation',
    brief: 'Comprehensive heart health evaluation including ECG, blood pressure monitoring, and personalized treatment plans for cardiovascular conditions.',
    isFavorite: false
  },
  {
    id: 'svc-2',
    name: 'Dermatology Check-up',
    brief: 'Full skin examination for early detection of skin conditions, mole mapping, and personalized skincare recommendations.',
    isFavorite: true
  },
  {
    id: 'svc-3',
    name: 'Pediatric Care',
    brief: 'Complete child healthcare services including vaccinations, growth monitoring, and developmental assessments for infants and children.',
    isFavorite: false
  },
  {
    id: 'svc-4',
    name: 'Orthopedic Assessment',
    brief: 'Evaluation of musculoskeletal conditions, joint pain management, and sports injury treatment with personalized rehabilitation plans.',
    isFavorite: false
  },
  {
    id: 'svc-5',
    name: 'General Health Check-up',
    brief: 'Comprehensive annual health screening including blood tests, vital signs monitoring, and preventive care recommendations.',
    isFavorite: true
  }
]

export const sampleReviews: Review[] = [
  {
    id: 'review-1',
    appointmentId: 'apt-2',
    doctorId: 'doc-2',
    rating: 5,
    comment: 'Dr. Chen was very thorough and professional. Highly recommend!',
    date: getPastDate(4)
  }
]

export const sampleChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'doc-1',
    receiverId: 'user-1',
    message: 'Hello! How can I help you today?',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isRead: true
  },
  {
    id: 'msg-2',
    senderId: 'user-1',
    receiverId: 'doc-1',
    message: 'Hi Dr. Johnson, I have some questions about my upcoming appointment.',
    timestamp: new Date(Date.now() - 3500000).toISOString(),
    isRead: true
  },
  {
    id: 'msg-3',
    senderId: 'doc-1',
    receiverId: 'user-1',
    message: 'Of course! I\'d be happy to help. What would you like to know?',
    timestamp: new Date(Date.now() - 3400000).toISOString(),
    isRead: true
  },
  {
    id: 'msg-4',
    senderId: 'user-1',
    receiverId: 'doc-1',
    message: 'Should I bring any specific documents for the checkup?',
    timestamp: new Date(Date.now() - 3300000).toISOString(),
    isRead: true
  },
  {
    id: 'msg-5',
    senderId: 'doc-1',
    receiverId: 'user-1',
    message: 'Please bring your ID, insurance card, and a list of any current medications you\'re taking.',
    timestamp: new Date(Date.now() - 3200000).toISOString(),
    isRead: false
  },
  {
    id: 'msg-6',
    senderId: 'doc-2',
    receiverId: 'user-1',
    message: 'Good morning! Your skin examination results are ready.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    isRead: true
  },
  {
    id: 'msg-7',
    senderId: 'user-1',
    receiverId: 'doc-2',
    message: 'Thank you, Dr. Chen! Everything looks good?',
    timestamp: new Date(Date.now() - 86300000).toISOString(),
    isRead: true
  },
  {
    id: 'msg-8',
    senderId: 'doc-2',
    receiverId: 'user-1',
    message: 'Yes, everything looks great. Just remember to apply sunscreen daily.',
    timestamp: new Date(Date.now() - 86200000).toISOString(),
    isRead: true
  }
]

// Seed data initialization
export const initializeSeedData = () => {
  if (!localStorage.getItem('MEDI_USER')) {
    localStorage.setItem('MEDI_USER', JSON.stringify(sampleUser))
  }
  if (!localStorage.getItem('MEDI_DOCTORS')) {
    localStorage.setItem('MEDI_DOCTORS', JSON.stringify(sampleDoctors))
  }
  if (!localStorage.getItem('MEDI_APPOINTMENTS')) {
    localStorage.setItem('MEDI_APPOINTMENTS', JSON.stringify(sampleAppointments))
  }
  if (!localStorage.getItem('MEDI_PAYMENT_METHODS')) {
    localStorage.setItem('MEDI_PAYMENT_METHODS', JSON.stringify(samplePaymentMethods))
  }
  if (!localStorage.getItem('MEDI_NOTIFICATIONS')) {
    localStorage.setItem('MEDI_NOTIFICATIONS', JSON.stringify(sampleNotifications))
  }
  if (!localStorage.getItem('MEDI_FAQS')) {
    localStorage.setItem('MEDI_FAQS', JSON.stringify(sampleFAQs))
  }
  if (!localStorage.getItem('MEDI_REVIEWS')) {
    localStorage.setItem('MEDI_REVIEWS', JSON.stringify(sampleReviews))
  }
  if (!localStorage.getItem('MEDI_CHAT_MESSAGES')) {
    localStorage.setItem('MEDI_CHAT_MESSAGES', JSON.stringify(sampleChatMessages))
  }
}
