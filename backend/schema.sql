-- Medi App Database Schema
-- PostgreSQL schema for Supabase

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    dob DATE NOT NULL,
    avatar_url TEXT,
    fingerprint_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON public.users(mobile);

-- =============================================
-- FINGERPRINT_AUTH TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.fingerprint_auth (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    fingerprint_data TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_fingerprint_auth_user_id ON public.fingerprint_auth(user_id);

-- =============================================
-- TRIGGER FUNCTION: Auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGER: Update users.updated_at on change
-- =============================================
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TRIGGER FUNCTION: Insert default user row
-- when Supabase Auth creates a new user
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into users table with default values
    -- This will be triggered when Supabase Auth creates a new user
    INSERT INTO public.users (id, email, full_name, mobile, password_hash, dob)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        '',
        '',
        CURRENT_DATE
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGER: Auto-insert user on Supabase Auth signup
-- (This trigger is for auth.users, which is Supabase's internal table)
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- DOCTORS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL,
    rating NUMERIC(2,1) DEFAULT 0.0,
    messages INTEGER DEFAULT 0,
    photo_url TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    experience INTEGER DEFAULT 0,
    focus TEXT,
    about TEXT,
    availability_days TEXT,
    availability_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- APPOINTMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    status TEXT CHECK (status IN ('upcoming', 'completed', 'cancelled')) DEFAULT 'upcoming',
    patient_name TEXT NOT NULL,
    for_self BOOLEAN DEFAULT TRUE,
    notes TEXT,
    amount NUMERIC(10,2) DEFAULT 0.0,
    cancel_reason TEXT,
    cancel_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PAYMENT_METHODS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('credit', 'debit', 'applepay', 'paypal', 'googlepay')) NOT NULL,
    card_number TEXT,
    card_holder TEXT,
    expiry_date TEXT,
    cvv TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('appointment', 'reminder', 'system', 'scheduled_appointment', 'scheduled_changes', 'medical_notes', 'medical_history_update')) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CHAT_MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FAVORITES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, doctor_id)
);

-- =============================================
-- FAQS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT CHECK (category IN ('popular', 'general', 'services')) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SERVICES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brief TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DOCTOR_SCHEDULE TABLE (for appointment slots)
-- =============================================
CREATE TABLE IF NOT EXISTS public.doctor_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    slots TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES for new tables
-- =============================================
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON public.doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_reviews_doctor_id ON public.reviews(doctor_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON public.chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_doctor_id ON public.favorites(doctor_id);

-- =============================================
-- TRIGGERS for new tables
-- =============================================
DROP TRIGGER IF EXISTS update_doctors_updated_at ON public.doctors;
CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON public.payment_methods;
CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_doctor_schedule_updated_at ON public.doctor_schedule;
CREATE TRIGGER update_doctor_schedule_updated_at
    BEFORE UPDATE ON public.doctor_schedule
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE public.users IS 'Stores user authentication and profile data';
COMMENT ON TABLE public.fingerprint_auth IS 'Stores fingerprint authentication data linked to users';
COMMENT ON TABLE public.doctors IS 'Stores doctor information and availability';
COMMENT ON TABLE public.appointments IS 'Stores appointment bookings';
COMMENT ON TABLE public.reviews IS 'Stores doctor reviews from appointments';
COMMENT ON TABLE public.payment_methods IS 'Stores user payment methods';
COMMENT ON TABLE public.notifications IS 'Stores user notifications';
COMMENT ON TABLE public.chat_messages IS 'Stores chat messages between users and doctors';
COMMENT ON TABLE public.favorites IS 'Stores user favorite doctors';
COMMENT ON TABLE public.faqs IS 'Stores FAQ entries';
COMMENT ON TABLE public.services IS 'Stores available medical services';
COMMENT ON TABLE public.doctor_schedule IS 'Stores doctor appointment time slots';

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fingerprint_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedule ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: USERS
-- Users can view and update only their own profile
-- =============================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    TO authenticated
    USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- =============================================
-- RLS POLICIES: FINGERPRINT_AUTH
-- Users can manage only their own fingerprint data
-- =============================================
DROP POLICY IF EXISTS "Users can view own fingerprint auth" ON public.fingerprint_auth;
CREATE POLICY "Users can view own fingerprint auth"
    ON public.fingerprint_auth FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own fingerprint auth" ON public.fingerprint_auth;
CREATE POLICY "Users can insert own fingerprint auth"
    ON public.fingerprint_auth FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own fingerprint auth" ON public.fingerprint_auth;
CREATE POLICY "Users can delete own fingerprint auth"
    ON public.fingerprint_auth FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES: DOCTORS
-- Public read access for all authenticated users (doctor directory)
-- No write access for regular users
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view doctors" ON public.doctors;
CREATE POLICY "Authenticated users can view doctors"
    ON public.doctors FOR SELECT
    TO authenticated
    USING (true);

-- =============================================
-- RLS POLICIES: APPOINTMENTS
-- Users can manage only their own appointments
-- =============================================
DROP POLICY IF EXISTS "Users can view own appointments" ON public.appointments;
CREATE POLICY "Users can view own appointments"
    ON public.appointments FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own appointments" ON public.appointments;
CREATE POLICY "Users can insert own appointments"
    ON public.appointments FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own appointments" ON public.appointments;
CREATE POLICY "Users can update own appointments"
    ON public.appointments FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own appointments" ON public.appointments;
CREATE POLICY "Users can delete own appointments"
    ON public.appointments FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES: REVIEWS
-- All authenticated users can view reviews
-- Users can manage reviews linked to their own appointments
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view reviews" ON public.reviews;
CREATE POLICY "Authenticated users can view reviews"
    ON public.reviews FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can insert reviews for own appointments" ON public.reviews;
CREATE POLICY "Users can insert reviews for own appointments"
    ON public.reviews FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.appointments
            WHERE appointments.id = appointment_id
            AND appointments.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update reviews for own appointments" ON public.reviews;
CREATE POLICY "Users can update reviews for own appointments"
    ON public.reviews FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.appointments
            WHERE appointments.id = appointment_id
            AND appointments.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.appointments
            WHERE appointments.id = appointment_id
            AND appointments.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete reviews for own appointments" ON public.reviews;
CREATE POLICY "Users can delete reviews for own appointments"
    ON public.reviews FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.appointments
            WHERE appointments.id = appointment_id
            AND appointments.user_id = auth.uid()
        )
    );

-- =============================================
-- RLS POLICIES: PAYMENT_METHODS
-- Users can manage only their own payment methods (strictest)
-- =============================================
DROP POLICY IF EXISTS "Users can view own payment methods" ON public.payment_methods;
CREATE POLICY "Users can view own payment methods"
    ON public.payment_methods FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own payment methods" ON public.payment_methods;
CREATE POLICY "Users can insert own payment methods"
    ON public.payment_methods FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own payment methods" ON public.payment_methods;
CREATE POLICY "Users can update own payment methods"
    ON public.payment_methods FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own payment methods" ON public.payment_methods;
CREATE POLICY "Users can delete own payment methods"
    ON public.payment_methods FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES: NOTIFICATIONS
-- Users can view and update only their own notifications
-- =============================================
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- =============================================
-- RLS POLICIES: CHAT_MESSAGES
-- Users can view and send messages where they are sender or receiver
-- =============================================
DROP POLICY IF EXISTS "Users can view own chat messages" ON public.chat_messages;
CREATE POLICY "Users can view own chat messages"
    ON public.chat_messages FOR SELECT
    TO authenticated
    USING (sender_id = auth.uid() OR receiver_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_messages;
CREATE POLICY "Users can insert own chat messages"
    ON public.chat_messages FOR INSERT
    TO authenticated
    WITH CHECK (sender_id = auth.uid());

-- =============================================
-- RLS POLICIES: FAVORITES
-- Users can manage only their own favorites
-- =============================================
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
CREATE POLICY "Users can view own favorites"
    ON public.favorites FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
CREATE POLICY "Users can insert own favorites"
    ON public.favorites FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
CREATE POLICY "Users can delete own favorites"
    ON public.favorites FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES: FAQS
-- Public read access for all authenticated users
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view faqs" ON public.faqs;
CREATE POLICY "Authenticated users can view faqs"
    ON public.faqs FOR SELECT
    TO authenticated
    USING (true);

-- =============================================
-- RLS POLICIES: SERVICES
-- Public read access for all authenticated users
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view services" ON public.services;
CREATE POLICY "Authenticated users can view services"
    ON public.services FOR SELECT
    TO authenticated
    USING (true);

-- =============================================
-- RLS POLICIES: DOCTOR_SCHEDULE
-- Public read access for all authenticated users (booking availability)
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view doctor schedule" ON public.doctor_schedule;
CREATE POLICY "Authenticated users can view doctor schedule"
    ON public.doctor_schedule FOR SELECT
    TO authenticated
    USING (true);
