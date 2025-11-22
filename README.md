# Ayurvedic Diet Management System

A comprehensive full-stack application for managing Ayurvedic diet plans, patient records, and doctor-patient interactions. Built with modern web technologies and following Ayurvedic principles.

## 🚀 Features

### For Doctors
- **Patient Management**: Add, view, and manage patient records
- **Diet Plan Creation**: Create personalized Ayurvedic diet plans based on dosha types
- **Food Database**: Comprehensive database of Ayurvedic foods with nutritional information
- **Recipe Management**: Create and manage Ayurvedic recipes
- **Auto Diet Generation**: AI-powered diet plan generation based on patient profiles
- **Appointment Scheduling**: Manage patient appointments
- **Health Records**: Track patient health metrics and progress
- **Chat System**: Communicate with patients

### For Patients
- **Diet History**: View assigned diet plans and track progress
- **Chat with Doctor**: Direct communication with assigned doctor
- **Reminders**: Set and manage diet and medication reminders
- **Health Reports**: View personal health reports and progress

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **shadcn/ui** for UI components
- **React Query** for data fetching and caching
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** for database operations
- **PostgreSQL** for data storage
- **JWT** for authentication
- **Joi** for request validation
- **bcryptjs** for password hashing

### Database
- **PostgreSQL** with comprehensive schema for:
  - Users (Doctors & Patients)
  - Foods & Recipes
  - Diet Plans & Items
  - Appointments & Health Records
  - Chat Messages & Reminders

## 📁 Project Structure

```
ayurvedic-diet-management/
├── UI/                          # Frontend React application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── contexts/          # React contexts (Auth)
│   │   ├── services/          # API service layer
│   │   ├── styles/            # Global styles
│   │   └── main.tsx           # App entry point
│   ├── package.json
│   └── Dockerfile
├── backend/                    # Backend Express application
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   ├── validators/        # Request validation schemas
│   │   └── index.ts           # Server entry point
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml          # Docker orchestration
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ayurvedic-diet-management
   ```

2. **Start the services**
   ```bash
   docker-compose up -d
   ```

3. **Initialize the database**
   ```bash
   # Access the backend container
   docker exec -it ayurvedic_backend bash
   
   # Generate Prisma client and run migrations
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Database: localhost:5432

### Option 2: Manual Setup

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment file
   cp env.example .env
   
   # Update .env with your database credentials
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:push
   
   # Seed the database
   npm run db:seed
   
   # Start the backend server
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd UI
   npm install
   
   # Create .env file
   echo "VITE_API_URL=http://localhost:5000/api" > .env
   
   # Start the frontend server
   npm run dev
   ```

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/ayurvedic_diet_db?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with the following main entities:

- **Users**: Doctors and patients with role-based access
- **Foods**: Ayurvedic foods with nutritional and dosha information
- **Recipes**: Recipe collections with ingredients
- **Diet Plans**: Personalized diet plans for patients
- **Appointments**: Doctor-patient appointment scheduling
- **Health Records**: Patient health metrics and history
- **Chat Messages**: Doctor-patient communication
- **Reminders**: Patient reminders for diet and medication

## 🔐 Authentication & Authorization

- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (Doctor vs Patient)
- **Protected routes** with middleware validation
- **Automatic token refresh** on the frontend

## 🎨 UI/UX Features

- **Responsive design** with TailwindCSS
- **Modern component library** with shadcn/ui
- **Dark/Light theme support**
- **Loading states** and error handling
- **Toast notifications** for user feedback
- **Form validation** with React Hook Form

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users (Doctor only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (Doctor only)

### Patients
- `GET /api/patients` - Get all patients (Doctor only)
- `POST /api/patients` - Create new patient (Doctor only)
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient (Doctor only)
- `DELETE /api/patients/:id` - Delete patient (Doctor only)

### Foods & Recipes
- `GET /api/foods` - Get all foods
- `POST /api/foods` - Create food (Doctor only)
- `GET /api/recipes` - Get all recipes
- `POST /api/recipes` - Create recipe (Doctor only)

### Diet Plans
- `GET /api/diet-plans` - Get all diet plans
- `POST /api/diet-plans` - Create diet plan (Doctor only)
- `GET /api/diet-plans/:id` - Get diet plan details
- `PUT /api/diet-plans/:id` - Update diet plan (Doctor only)

### Appointments & Health Records
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment (Doctor only)
- `GET /api/health-records` - Get all health records
- `POST /api/health-records` - Create health record (Doctor only)

### Chat & Reminders
- `GET /api/chat` - Get all messages
- `POST /api/chat` - Send message
- `GET /api/reminders` - Get user reminders
- `POST /api/reminders` - Create reminder

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd UI
npm test
```

## 🚀 Deployment

### Production Build

1. **Backend**
   ```bash
   cd backend
   npm run build
   npm start
   ```

2. **Frontend**
   ```bash
   cd UI
   npm run build
   # Serve the dist folder with a web server
   ```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- Ayurvedic principles and traditional knowledge
- Modern web development best practices
- Open source community contributions

---

**Built with ❤️ for better health through Ayurvedic principles**


