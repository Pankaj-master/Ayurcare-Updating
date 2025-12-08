import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { JWTPayload, AuthRequest, ApiResponse } from '../types';

const prisma = new PrismaClient();

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'Access token required'
      };
      res.status(401).json(response);
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true }
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found'
      };
      res.status(401).json(response);
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Invalid or expired token'
    };
    res.status(401).json(response);
    return;
  }
};

export const authorizeRoles = (...roles: string[]): RequestHandler => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required'
      };
      res.status(401).json(response);
      return;
    }

    if (!roles.includes(req.user.role)) {
      const response: ApiResponse = {
        success: false,
        message: 'Insufficient permissions'
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
};

