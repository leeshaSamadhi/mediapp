# MediApp - Medical Appointment Booking Application

A modern, responsive medical appointment booking application built with React, TypeScript, and Tailwind CSS.

## Features

- **User Authentication** - Secure login, signup, and password management
- **Doctor Discovery** - Browse and search for doctors by specialty
- **Appointment Booking** - Schedule appointments with preferred doctors
- **Calendar View** - Visual calendar for managing appointments
- **Chat System** - Real-time messaging with healthcare providers
- **Notifications** - Stay updated with appointment reminders and messages
- **Payment Management** - Secure payment processing and card management
- **User Profile** - Manage personal information and preferences
- **Favorites** - Save favorite doctors for quick access
- **Fingerprint Authentication** - Biometric login support

## Tech Stack

- **Frontend Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3
- **Routing:** React Router DOM 6

## Project Structure

```
mediapp/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # UI components
│   ├── data/            # Seed data and mock data
│   ├── hooks/           # Custom React hooks
│   ├── models/          # TypeScript type definitions
│   ├── pages/           # Application pages
│   ├── utils/           # Utility functions and constants
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML entry point
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mediapp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview the production build locally

## Pages

- **Welcome/Splash** - Landing page
- **Login/Signup** - User authentication
- **Home** - Dashboard with quick access
- **Doctors** - Browse available doctors
- **Doctor Detail** - View doctor profile and book appointments
- **Appointment Booking** - Schedule new appointments
- **Calendar** - View and manage appointments
- **Chats** - Message healthcare providers
- **Notifications** - View alerts and reminders
- **Payments** - Manage payment methods
- **Profile** - User profile management
- **Settings** - App configuration and preferences

## Custom Hooks

- `useAuth` - Authentication state management
- `useLocalStorage` - Persistent local storage
- `useChat` - Chat functionality
- `useNotifications` - Notification handling
- `useFingerprintAuth` - Biometric authentication

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact the development team.