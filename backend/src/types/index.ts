import { Request } from 'express';
import { UserRole, DoshaType, MealType, FoodCategory } from '@prisma/client';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: string;
  // Doctor specific
  specialization?: string;
  licenseNumber?: string;
  experience?: number;
  // Patient specific
  age?: number;
  gender?: string;
  doshaType?: DoshaType;
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  specialization: string | null;
  licenseNumber: string | null;
  experience: number | null;
  age: number | null;
  gender: string | null;
  doshaType: DoshaType | null;
  medicalHistory: string | null;
  allergies: string | null;
  medications: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodRequest {
  name: string;
  description?: string;
  category: FoodCategory;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  vitamins?: string;
  minerals?: string;
  doshaEffects?: string;
  benefits?: string;
  precautions?: string;
  imageUrl?: string;
}

export interface RecipeRequest {
  name: string;
  description?: string;
  instructions: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
  imageUrl?: string;
  items: RecipeItemRequest[];
}

export interface RecipeItemRequest {
  foodId: string;
  quantity: number;
  unit: string;
}

export interface DietPlanRequest {
  name: string;
  description?: string;
  patientId?: string;
  doshaType?: DoshaType;
  duration?: number;
  items: DietPlanItemRequest[];
}

export interface DietPlanItemRequest {
  foodId?: string;
  recipeId?: string;
  mealType: MealType;
  quantity?: number;
  unit?: string;
  notes?: string;
  dayOfWeek?: number;
  time?: string;
}

export interface AppointmentRequest {
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  duration?: number;
  notes?: string;
}

export interface ChatMessageRequest {
  receiverId?: string;
  patientId?: string;
  message: string;
}

export interface ReminderRequest {
  title: string;
  message: string;
  date: string;
  time: string;
}

export interface HealthRecordRequest {
  patientId: string;
  date: string;
  weight?: number;
  height?: number;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  symptoms?: string;
  diagnosis?: string;
  notes?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

