# MediApp - Medical Appointment Booking System

A full-stack medical appointment booking application with a React frontend and FastAPI backend.

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL (via Supabase)

## Features

### Authentication
- User signup with email, mobile, and password
- Login with email/mobile and password
- Fingerprint authentication support
- JWT token-based authentication
- Profile management

### Doctors
- Browse doctors by specialty
- Search doctors by name or specialty
- View doctor details and availability
- Add/remove doctors from favorites

### Appointments
- Book appointments with doctors
- View upcoming and past appointments
- Cancel appointments with reason
- Appointment status tracking

### Reviews
- Review completed appointments
- Rating system (1-5 stars)
- Doctor rating aggregation

### Payments
- Add/manage payment methods
- Support for credit/debit cards, Apple Pay, PayPal, Google Pay
- Default payment method selection

### Notifications
- Appointment reminders
- System notifications
- Mark as read functionality

### Chat
- Message doctors
- View conversation history
- Read/unread status

### Additional Features
- Favorites management
- FAQs
- Medical services listing
- Help center

## Project Structure

```
mediapp/
├── backend/
│   ├── main.py              # FastAPI application with all endpoints
│   ├── database.py          # Database connection and operations
│   ├── schema.sql           # Database schema definition
│   ├── seed_data.py         # Sample data population
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables
│   └── venv/                # Python virtual environment
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.ts       # API service layer
│   │   ├── hooks/
│   │   │   └── useAuth.ts   # Authentication hook
│   │   ├── pages/           # React page components
│   │   ├── components/      # Reusable components
│   │   └── models/          # TypeScript types
│   ├── .env                 # Frontend environment variables
│   └── package.json         # Node dependencies
└── README.md
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
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

5. Configure environment variables in `.env`:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   DATABASE_URL=postgresql://username:password@host:5432/postgres
   SECRET_KEY=your-secret-key
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

### Authentication
- `POST /signup` - Create new user account
- `POST /login` - Login with email/mobile and password
- `POST /login/fingerprint` - Login with fingerprint data

### Profile
- `GET /profile/{user_id}` - Get user profile
- `PUT /profile/{user_id}` - Update user profile

### Doctors
- `GET /doctors` - List all doctors (with optional filters)
- `GET /doctors/{doctor_id}` - Get doctor details
- `POST /doctors/{doctor_id}/favorite` - Toggle favorite status

### Appointments
- `GET /appointments` - List user appointments
- `POST /appointments` - Create new appointment
- `PUT /appointments/{appointment_id}` - Update appointment

### Reviews
- `GET /reviews` - List reviews
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
- `doctors` - Doctor information
- `doctor_schedule` - Doctor availability slots
- `appointments` - Appointment bookings
- `reviews` - Doctor reviews
- `payment_methods` - User payment methods
- `notifications` - User notifications
- `chat_messages` - Chat messages
- `favorites` - User favorite doctors
- `faqs` - FAQ entries
- `services` - Medical services

## Development

### Running Tests
```powershell
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

### Building for Production
```powershell
# Frontend build
cd frontend
npm run build

# Backend - use a production WSGI server like Gunicorn
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes.