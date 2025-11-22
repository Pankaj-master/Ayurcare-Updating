import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { FoodRequest, ApiResponse, PaginatedResponse } from '../types';

const prisma = new PrismaClient();

export class FoodController {
  async getAllFoods(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', category } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const whereClause = category ? { category: category as any, isActive: true } : { isActive: true };

      const [foods, total] = await Promise.all([
        prisma.food.findMany({
          where: whereClause,
          skip,
          take: Number(limit),
          orderBy: { [sortBy as string]: sortOrder }
        }),
        prisma.food.count({ where: whereClause })
      ]);

      const totalPages = Math.ceil(total / Number(limit));

      const response: ApiResponse<PaginatedResponse<any>> = {
        success: true,
        message: 'Foods retrieved successfully',
        data: {
          data: foods,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages,
            hasNext: Number(page) < totalPages,
            hasPrev: Number(page) > 1
          }
        }
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving foods',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async getFoodById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const food = await prisma.food.findUnique({
        where: { id }
      });

      if (!food) {
        const response: ApiResponse = {
          success: false,
          message: 'Food not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<any> = {
        success: true,
        message: 'Food retrieved successfully',
        data: food
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving food',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async createFood(req: Request, res: Response): Promise<void> {
    try {
      const foodData: FoodRequest = req.body;

      const food = await prisma.food.create({
        data: foodData
      });

      const response: ApiResponse<any> = {
        success: true,
        message: 'Food created successfully',
        data: food
      };

      res.status(201).json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error creating food',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async updateFood(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: Partial<FoodRequest> = req.body;

      const food = await prisma.food.update({
        where: { id },
        data: updateData
      });

      const response: ApiResponse<any> = {
        success: true,
        message: 'Food updated successfully',
        data: food
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error updating food',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async deleteFood(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.food.update({
        where: { id },
        data: { isActive: false }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Food deleted successfully'
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error deleting food',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async getFoodsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [foods, total] = await Promise.all([
        prisma.food.findMany({
          where: { category: category as any, isActive: true },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.food.count({ where: { category: category as any, isActive: true } })
      ]);

      const totalPages = Math.ceil(total / Number(limit));

      const response: ApiResponse<PaginatedResponse<any>> = {
        success: true,
        message: 'Foods retrieved successfully',
        data: {
          data: foods,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages,
            hasNext: Number(page) < totalPages,
            hasPrev: Number(page) > 1
          }
        }
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving foods by category',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }
}