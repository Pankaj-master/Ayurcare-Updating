import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  AuthRequest,
  UserResponse,
  ApiResponse,
  PaginatedResponse,
} from "../types";

const prisma = new PrismaClient();

export class UserController {
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: Number(limit),
          orderBy: { [sortBy as string]: sortOrder },
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
            updatedAt: true,
          },
        }),
        prisma.user.count(),
      ]);

      const totalPages = Math.ceil(total / Number(limit));

      const response: ApiResponse<PaginatedResponse<UserResponse>> = {
        success: true,
        message: "Users retrieved successfully",
        data: {
          data: users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages,
            hasNext: Number(page) < totalPages,
            hasPrev: Number(page) > 1,
          },
        },
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Error retrieving users",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
      return;
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
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
          updatedAt: true,
        },
      });

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: "User not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: "User retrieved successfully",
        data: user,
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Error retrieving user",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
      return;
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
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
          updatedAt: true,
        },
      });

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: "User updated successfully",
        data: user,
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Error updating user",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
      return;
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      const response: ApiResponse = {
        success: true,
        message: "User deleted successfully",
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Error deleting user",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
      return;
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
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
          updatedAt: true,
        },
      });

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: "User not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: "Profile retrieved successfully",
        data: user,
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Error retrieving profile",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
      return;
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const updateData = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
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
          updatedAt: true,
        },
      });

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: "Profile updated successfully",
        data: user,
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Error updating profile",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
      return;
    }
  }
}
