# MediApp - Medical Appointment Booking System

A full-stack medical appointment booking application with a React frontend and FastAPI backend.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL (via Supabase)
- **Routing**: React Router DOM v6
- **Deployment**: Vercel (frontend + serverless API)

## Features

### Authentication
- User signup with email, mobile, and password
- Login with email/mobile and password
- Fingerprint authentication support
- JWT token-based authentication
- Forgot password and reset password flows
- Profile management

### Doctors
- Browse doctors by specialty
- Search doctors by name or specialty
- View doctor details, experience, and availability
- View doctor appointment schedule
- Add/remove doctors from favorites

### Appointments
- Book appointments with doctors
- Select appointment date and time slots
- View upcoming and past appointments
- Appointment summary after booking
- Cancel appointments with reason
- Appointment status tracking (upcoming, completed, cancelled)
- Calendar view for appointments

### Reviews
- Review completed appointments
- Rating system (1-5 stars)
- Doctor rating aggregation

### Payments
- Add/manage payment methods
- Support for credit/debit cards, Apple Pay, PayPal, Google Pay
- Default payment method selection
- Secure payment details entry

### Notifications
- Appointment reminders
- System notifications
- Notification settings management
- Mark as read functionality

### Chat
- Message doctors
- View conversation history
- Read/unread status

### Settings
- Profile editing
- Password manager
- Notification preferences
- Privacy policy

### Additional Features
- Splash and welcome screens
- Favorites management
- FAQs
- Medical services listing
- Help centre
- Protected routes (authentication-gated)

## Project Structure

```
mediapp/
├── README.md
├── .gitignore
├── vercel.json                       # Vercel deployment configuration
├── requirements.txt                  # Root-level Python deps (for Vercel serverless)
├── api/
│   └── index.py                      # Vercel serverless function entry point
├── backend/
│   ├── app/                          # Vercel bridge module (__init__.py, main.py)
│   ├── main.py                       # FastAPI application with all endpoints
│   ├── database.py                   # Database connection and operations
│   ├── schema.sql                    # Database schema definition
│   ├── seed_data.py                  # Sample data population
│   ├── requirements.txt              # Python dependencies
│   ├── .env.example                  # Example environment variables
│   ├── check_tables.py               # Database table inspection utility
│   └── test_*.py                     # API & database tests
├── frontend/
│   ├── index.html / package.json     # Entry point & dependencies
│   ├── vite.config.ts                # Vite bundler configuration
│   ├── tsconfig.json / tsconfig.node.json
│   ├── tailwind.config.js / postcss.config.js
│   ├── .env / .env.production        # Environment configuration
│   ├── public/                       # Static assets
│   └── src/
│       ├── main.tsx / App.tsx / index.css
│       ├── components/
│       │   ├── ProtectedRoute.tsx    # Auth-guarded route wrapper
│       │   ├── layout/               # CardLayout, CenterContainer
│       │   └── ui/                   # Avatar, Button, Card, Icon, Input, Navbar, Toggle, etc.
│       ├── pages/                    # 20+ pages: auth, doctors, appointments, payments, chat, settings
│       ├── hooks/                    # useAuth, useChat, useFingerprintAuth, useLocalStorage, useNotifications
│       ├── services/api.ts           # API service layer
│       ├── models/types.ts           # TypeScript type definitions
│       ├── data/seed.ts              # Seed/initial data
│       └── utils/constants.ts        # Application constants
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm
- PostgreSQL database (via Supabase)

### Backend Setup

1. Navigate to the backend directory:
   ```powershell
   cd backend
   ```

2. Create a virtual environment (if not already created):
   ```powershell
   python -m venv venv
   ```

3. Activate the virtual environment:
   ```powershell
   venv\Scripts\Activate.ps1
   ```

4. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

5. Configure environment variables by copying `.env.example` to `.env` and updating the values:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   DATABASE_URL=postgresql://username:password@host:5432/postgres
   ```

6. Initialize the database:
   ```powershell
   python database.py
   ```

7. Seed the database with sample data:
   ```powershell
   python seed_data.py
   ```

8. Start the backend server:
   ```powershell
   python main.py
   ```
   
   The backend will run at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```powershell
   cd frontend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   VITE_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```powershell
   npm run dev
   ```
   
   The frontend will run at `http://localhost:5173`

## API Endpoints

### Health & Root
- `GET /` - Welcome endpoint with API version
- `GET /health` - Health check endpoint

### Authentication
- `POST /signup` - Create new user account
- `POST /login` - Login with email/mobile and password
- `POST /login/fingerprint` - Login with fingerprint data

### Profile
- `GET /profile/{user_id}` - Get user profile
- `PUT /profile/{user_id}` - Update user profile
- `PUT /profile/{user_id}/password` - Change user password

### Doctors
- `GET /doctors` - List all doctors (with optional filters: specialty, search, user_id)
- `GET /doctors/{doctor_id}` - Get doctor details with schedule
- `POST /doctors/{doctor_id}/favorite` - Toggle favorite status

### Appointments
- `GET /appointments` - List user appointments (with optional status filter)
- `POST /appointments` - Create new appointment
- `PUT /appointments/{appointment_id}` - Update appointment (status, cancel reason)

### Reviews
- `GET /reviews` - List reviews (with optional doctor/appointment filter)
- `POST /reviews` - Create review

### Payment Methods
- `GET /payment-methods` - List payment methods
- `POST /payment-methods` - Add payment method
- `PUT /payment-methods/{method_id}` - Update payment method
- `DELETE /payment-methods/{method_id}` - Delete payment method

### Notifications
- `GET /notifications` - List notifications
- `PUT /notifications/{notification_id}` - Mark as read
- `PUT /notifications/mark-all-read` - Mark all as read

### Chat
- `GET /messages` - List messages
- `POST /messages` - Send message
- `PUT /messages/{message_id}/read` - Mark message as read

### Favorites
- `GET /favorites` - List favorite doctors
- `POST /favorites/{doctor_id}` - Add to favorites
- `DELETE /favorites/{doctor_id}` - Remove from favorites

### FAQs
- `GET /faqs` - List FAQs

### Services
- `GET /services` - List services

## Security Notes

**Important**: This is a learning backend with minimal security implementation.

- JWT tokens are simplified and should be properly verified in production
- Password hashing uses bcrypt
- CORS is configured for localhost development
- In production, implement:
  - Proper JWT signature verification with JWKS
  - Rate limiting
  - Input validation and sanitization
  - HTTPS only
  - Secure session management

## Database Schema

The database includes the following tables:
- `users` - User accounts and profiles
- `fingerprint_auth` - Fingerprint authentication data
- `doctors` - Doctor information and availability
- `doctor_schedule` - Doctor appointment time slots
- `appointments` - Appointment bookings
- `reviews` - Doctor reviews
- `payment_methods` - User payment methods
- `notifications` - User notifications
- `chat_messages` - Chat messages between users and doctors
- `favorites` - User favorite doctors
- `faqs` - FAQ entries
- `services` - Medical services

## Development

### Running Tests
```powershell
# Backend tests
cd backend
python -m pytest

# Frontend build verification
cd frontend
npm run build
```

### Building for Production (Vercel)

This project is configured for deployment on Vercel with:
- **Frontend**: React static build served by Vercel's CDN
- **Backend**: FastAPI running as a Vercel serverless function at `/api/*`

#### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set the following environment variables in the Vercel dashboard:
   - `DATABASE_URL` — PostgreSQL connection string (via Supabase)
   - `SUPABASE_URL` — Your Supabase project URL
   - `SUPABASE_ANON_KEY` — Your Supabase anonymous key
3. Vercel will automatically:
   - Install Python dependencies from `requirements.txt`
   - Install frontend dependencies and build the React app
   - Deploy the serverless function from `api/index.py`

#### How the API Routing Works

```
Browser → /api/* → Vercel rewrites → api/index.py (serverless)
  → StripApiPrefix middleware → FastAPI routes in backend/main.py
```

The `vercel.json` configuration handles:
- Frontend build (`cd frontend && npm run build`)
- API path rewriting (`/api/*` → serverless function)
- Output directory (`frontend/dist`)

#### Local Development

```powershell
# Terminal 1: Start backend
cd backend
python main.py

# Terminal 2: Start frontend
cd frontend
npm run dev
```

The frontend `.env` file should have `VITE_API_URL=http://localhost:8000` for local development.
The `.env.production` file has `VITE_API_URL=/api` for Vercel deployment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes.