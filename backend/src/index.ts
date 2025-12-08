import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from "socket.io";

import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import patientRoutes from './routes/patients';
import foodRoutes from './routes/foods';
import recipeRoutes from './routes/recipes';
import dietPlanRoutes from './routes/dietPlans';
import chatRoutes from './routes/chat';
import reminderRoutes from './routes/reminders';
import healthRecordRoutes from './routes/healthRecords';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server and bind express to it
const server = http.createServer(app); // 👈 REPLACED app.listen()

// SOCKET.IO INSTANCE 🚀
export const io = new Server(server, {   // 👈 Socket.io initialized here
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }
});

// SOCKET.IO EVENTS 👇
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`📌 Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
if (process.env.NODE_ENV === 'production') {  //either remove the if statement in deployment and add keep app.use limiter outsideor set NODE_ENV to production
  app.use(limiter);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/diet-plans', dietPlanRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/health-records', healthRecordRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
// Start server
server.listen(5000, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});


export default app;

