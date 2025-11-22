import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, LoginRequest, RegisterRequest, UserResponse, ApiResponse } from '../types';

const prisma = new PrismaClient();

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role }: LoginRequest = req.body;

      // Find user by email and role
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user || user.role !== role) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid credentials'
        };
        res.status(401).json(response);
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid credentials'
        };
        res.status(401).json(response);
        return;
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      const response: ApiResponse<UserResponse & { accessToken: string; refreshToken: string }> = {
        success: true,
        message: 'Login successful',
        data: {
          ...userWithoutPassword,
          accessToken,
          refreshToken
        }
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error during login',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: RegisterRequest = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        const response: ApiResponse = {
          success: false,
          message: 'User with this email already exists'
        };
        res.status(409).json(response);
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword
        }
      });

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      const response: ApiResponse<UserResponse & { accessToken: string; refreshToken: string }> = {
        success: true,
        message: 'Registration successful',
        data: {
          ...userWithoutPassword,
          accessToken,
          refreshToken
        }
      };

      res.status(201).json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error during registration',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          phone: true,
          address: true,
          isActive: true,
          specialization: true,
          licenseNumber: true,
          experience: true,
          age: true,
          gender: true,
          doshaType: true,
          medicalHistory: true,
          allergies: true,
          medications: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: 'User profile retrieved successfully',
        data: user
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving user profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        const response: ApiResponse = {
          success: false,
          message: 'Refresh token required'
        };
        res.status(401).json(response);
        return;
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found'
        };
        res.status(401).json(response);
        return;
      }

      // Generate new access token
      const newAccessToken = this.generateAccessToken(user);

      const response: ApiResponse<{ accessToken: string }> = {
        success: true,
        message: 'Token refreshed successfully',
        data: { accessToken: newAccessToken }
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error refreshing token',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      // In a real application, you might want to blacklist the token
      // For now, we'll just return a success response
      const response: ApiResponse = {
        success: true,
        message: 'Logged out successfully'
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error during logout',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  private generateAccessToken(user: any): string {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '30m' }
    );
  }

  private generateRefreshToken(user: any): string {
    return jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
  }
}
