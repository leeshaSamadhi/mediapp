/**
 * MediApp API Service
 * 
 * Centralized API service for communicating with the FastAPI backend.
 * In production, tokens should be verified properly with JWT signature verification.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Types
interface User {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
  dob: string;
  avatar_url?: string;
  fingerprint_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  gender: 'male' | 'female';
  rating: number;
  messages: number;
  photo_url?: string;
  is_favorite: boolean;
  experience: number;
  focus?: string;
  about?: string;
  availability: {
    days: string;
    time: string;
  };
  schedule?: {
    day: string;
    slots: string[];
  }[];
}

interface Appointment {
  id: string;
  doctor_id: string;
  doctor_name?: string;
  doctor_specialty?: string;
  doctor_photo?: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  patient_name: string;
  for_self: boolean;
  notes?: string;
  amount: number;
  cancel_reason?: string;
  cancel_notes?: string;
  created_at?: string;
}

interface Review {
  id: string;
  appointment_id: string;
  doctor_id: string;
  rating: number;
  comment?: string;
  date: string;
  user_name?: string;
  created_at?: string;
}

interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit' | 'applepay' | 'paypal' | 'googlepay';
  card_number?: string;
  card_holder?: string;
  expiry_date?: string;
  is_default: boolean;
  created_at?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  date: string;
  created_at?: string;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  timestamp: string;
  is_read: boolean;
  created_at?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'popular' | 'general' | 'services';
}

interface Service {
  id: string;
  name: string;
  brief?: string;
  is_favorite: boolean;
}

interface FavoriteDoctor {
  id: string;
  favorite_id: string;
  name: string;
  specialty: string;
  gender: 'male' | 'female';
  rating: number;
  messages: number;
  photo_url?: string;
  is_favorite: boolean;
  experience: number;
  focus?: string;
  about?: string;
  availability?: {
    days: string;
    time: string;
  };
}

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('ACCESS_TOKEN');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// =============================================
// Authentication API
// =============================================

export const authApi = {
  /**
   * Sign up a new user
   */
  async signup(data: {
    full_name: string;
    email: string;
    mobile: string;
    password: string;
    dob: string;
    avatar_url?: string;
    fingerprint_data?: string;
  }): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>('/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store token
    localStorage.setItem('ACCESS_TOKEN', response.access_token);
    localStorage.setItem('CURRENT_USER', JSON.stringify(response.user));
    
    return response;
  },

  /**
   * Login with email/mobile and password
   */
  async login(emailOrMobile: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email_or_mobile: emailOrMobile, password }),
    });
    
    // Store token
    localStorage.setItem('ACCESS_TOKEN', response.access_token);
    
    // Transform backend user to frontend User type
    const frontendUser = {
      id: response.user.id,
      fullName: response.user.full_name,
      email: response.user.email,
      phone: response.user.mobile,
      password: '', // Don't store password
      dob: response.user.dob,
      avatarUrl: response.user.avatar_url,
      fingerprintRegistered: response.user.fingerprint_enabled
    };
    localStorage.setItem('CURRENT_USER', JSON.stringify(frontendUser));
    
    return response;
  },

  /**
   * Login with fingerprint data
   */
  async loginWithFingerprint(fingerprintData: string): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>('/login/fingerprint', {
      method: 'POST',
      body: JSON.stringify({ fingerprint_data: fingerprintData }),
    });
    
    // Store token
    localStorage.setItem('ACCESS_TOKEN', response.access_token);
    
    // Transform backend user to frontend User type
    const frontendUser = {
      id: response.user.id,
      fullName: response.user.full_name,
      email: response.user.email,
      phone: response.user.mobile,
      password: '', // Don't store password
      dob: response.user.dob,
      avatarUrl: response.user.avatar_url,
      fingerprintRegistered: response.user.fingerprint_enabled
    };
    localStorage.setItem('CURRENT_USER', JSON.stringify(frontendUser));
    
    return response;
  },

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('CURRENT_USER');
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const stored = localStorage.getItem('CURRENT_USER');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('ACCESS_TOKEN');
  },
};

// =============================================
// Profile API
// =============================================

export const profileApi = {
  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<User> {
    return apiRequest<User>(`/profile/${userId}`);
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const response = await apiRequest<User>(`/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    // Update stored user
    localStorage.setItem('CURRENT_USER', JSON.stringify(response));
    
    return response;
  },

  /**
   * Change user password
   */
  async changePassword(userId: string, data: { current_password?: string; new_password: string }): Promise<void> {
    await apiRequest(`/profile/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// =============================================
// Doctors API
// =============================================

export const doctorsApi = {
  /**
   * Get all doctors, optionally filtered.
   * Pass userId to get per-user favorite status from the database.
   */
  async getDoctors(filters?: { specialty?: string; search?: string; userId?: string }): Promise<Doctor[]> {
    const params = new URLSearchParams();
    if (filters?.specialty) params.append('specialty', filters.specialty);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.userId) params.append('user_id', filters.userId);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<Doctor[]>(`/doctors${query}`);
  },

  /**
   * Get doctor by ID.
   * Pass userId to get per-user favorite status from the database.
   */
  async getDoctor(doctorId: string, userId?: string): Promise<Doctor> {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<Doctor>(`/doctors/${doctorId}${query}`);
  },

  /**
   * Toggle doctor favorite
   */
  async toggleFavorite(doctorId: string, userId: string): Promise<{ favorited: boolean }> {
    return apiRequest<{ favorited: boolean }>(`/doctors/${doctorId}/favorite`, {
      method: 'POST',
      body: JSON.stringify({ doctor_id: doctorId, user_id: userId }),
    });
  },
};

// =============================================
// Appointments API
// =============================================

export const appointmentsApi = {
  /**
   * Get user appointments
   */
  async getAppointments(userId: string, status?: string): Promise<Appointment[]> {
    const params = new URLSearchParams();
    params.append('user_id', userId);
    if (status) params.append('status', status);
    
    return apiRequest<Appointment[]>(`/appointments?${params.toString()}`);
  },

  /**
   * Create new appointment
   */
  async createAppointment(
    userId: string,
    data: {
      doctor_id: string;
      date: string;
      time: string;
      patient_name: string;
      for_self?: boolean;
      notes?: string;
      amount?: number;
    }
  ): Promise<Appointment> {
    const params = new URLSearchParams();
    params.append('user_id', userId);
    
    return apiRequest<Appointment>(`/appointments?${params.toString()}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update appointment status
   */
  async updateAppointment(
    appointmentId: string,
    data: {
      status?: string;
      cancel_reason?: string;
      cancel_notes?: string;
    }
  ): Promise<Appointment> {
    return apiRequest<Appointment>(`/appointments/${appointmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// =============================================
// Reviews API
// =============================================

export const reviewsApi = {
  /**
   * Get reviews
   */
  async getReviews(filters?: { doctorId?: string; appointmentId?: string }): Promise<Review[]> {
    const params = new URLSearchParams();
    if (filters?.doctorId) params.append('doctor_id', filters.doctorId);
    if (filters?.appointmentId) params.append('appointment_id', filters.appointmentId);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<Review[]>(`/reviews${query}`);
  },

  /**
   * Create review
   */
  async createReview(
    userId: string,
    data: {
      appointment_id: string;
      doctor_id: string;
      rating: number;
      comment?: string;
    }
  ): Promise<Review> {
    const params = new URLSearchParams();
    params.append('user_id', userId);
    
    return apiRequest<Review>(`/reviews?${params.toString()}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// =============================================
// Payment Methods API
// =============================================

export const paymentApi = {
  /**
   * Get payment methods
   */
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const params = new URLSearchParams();
    params.append('user_id', userId);
    
    return apiRequest<PaymentMethod[]>(`/payment-methods?${params.toString()}`);
  },

  /**
   * Create payment method
   */
  async createPaymentMethod(
    userId: string,
    data: {
      type: string;
      card_number?: string;
      card_holder?: string;
      expiry_date?: string;
      cvv?: string;
      is_default?: boolean;
    }
  ): Promise<PaymentMethod> {
    const params = new URLSearchParams();
    params.append('user_id', userId);
    
    return apiRequest<PaymentMethod>(`/payment-methods?${params.toString()}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update payment method
   */
  async updatePaymentMethod(
    methodId: string,
    data: {
      card_holder?: string;
      expiry_date?: string;
      is_default?: boolean;
    }
  ): Promise<PaymentMethod> {
    return apiRequest<PaymentMethod>(`/payment-methods/${methodId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete payment method
   */
  async deletePaymentMethod(methodId: string): Promise<void> {
    await apiRequest(`/payment-methods/${methodId}`, {
      method: 'DELETE',
    });
  },
};

// =============================================
// Notifications API
// =============================================

export const notificationsApi = {
  /**
   * Get notifications
   */
  async getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]> {
    const params = new URLSearchParams();
    params.append('user_id', userId);
    if (unreadOnly) params.append('unread_only', 'true');
    
    return apiRequest<Notification[]>(`/notifications?${params.toString()}`);
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await apiRequest(`/notifications/${notificationId}`, {
      method: 'PUT',
      body: JSON.stringify({ read: true }),
    });
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    const params = new URLSearchParams();
    params.append('user_id', userId);
    
    await apiRequest(`/notifications/mark-all-read?${params.toString()}`, {
      method: 'PUT',
    });
  },

  /**
   * Create a new notification
   */
  async createNotification(userId: string, data: { title: string; message: string; type: string; date: string }): Promise<Notification> {
    const params = new URLSearchParams();
    params.append('user_id', userId);
    
    return apiRequest<Notification>(`/notifications?${params.toString()}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// =============================================
// Chat Messages API
// =============================================

export const chatApi = {
  /**
   * Get messages
   */
  async getMessages(userId: string, otherUserId?: string): Promise<ChatMessage[]> {
    const params = new URLSearchParams();
    params.append('user_id', userId);
    if (otherUserId) params.append('other_user_id', otherUserId);
    
    return apiRequest<ChatMessage[]>(`/messages?${params.toString()}`);
  },

  /**
   * Send message
   */
  async sendMessage(
    senderId: string,
    data: {
      receiver_id: string;
      message: string;
    }
  ): Promise<ChatMessage> {
    const params = new URLSearchParams();
    params.append('sender_id', senderId);
    
    return apiRequest<ChatMessage>(`/messages?${params.toString()}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    await apiRequest(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  },
};

// =============================================
// Favorites API
// =============================================

export const favoritesApi = {
  /**
   * Get user favorites
   */
  async getFavorites(userId: string): Promise<FavoriteDoctor[]> {
    const params = new URLSearchParams();
    params.append('user_id', userId);
    
    return apiRequest<FavoriteDoctor[]>(`/favorites?${params.toString()}`);
  },

  /**
   * Add doctor to favorites
   */
  async addFavorite(userId: string, doctorId: string): Promise<void> {
    const params = new URLSearchParams();
    params.append('user_id', userId);
    
    await apiRequest(`/favorites/${doctorId}?${params.toString()}`, {
      method: 'POST',
    });
  },

  /**
   * Remove doctor from favorites
   */
  async removeFavorite(userId: string, doctorId: string): Promise<void> {
    const params = new URLSearchParams();
    params.append('user_id', userId);
    
    await apiRequest(`/favorites/${doctorId}?${params.toString()}`, {
      method: 'DELETE',
    });
  },
};

// =============================================
// FAQs API
// =============================================

export const faqsApi = {
  /**
   * Get FAQs
   */
  async getFaqs(category?: string): Promise<FAQ[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<FAQ[]>(`/faqs${query}`);
  },
};

// =============================================
// Services API
// =============================================

export const servicesApi = {
  /**
   * Get all services
   */
  async getServices(): Promise<Service[]> {
    return apiRequest<Service[]>('/services');
  },

  /**
   * Toggle service favorite
   */
  async toggleFavorite(serviceId: string): Promise<{ favorited: boolean }> {
    return apiRequest<{ favorited: boolean }>(`/services/${serviceId}/favorite`, {
      method: 'PUT',
    });
  },
};

// Export all APIs
export default {
  auth: authApi,
  profile: profileApi,
  doctors: doctorsApi,
  appointments: appointmentsApi,
  reviews: reviewsApi,
  payment: paymentApi,
  notifications: notificationsApi,
  chat: chatApi,
  favorites: favoritesApi,
  faqs: faqsApi,
  services: servicesApi,
};