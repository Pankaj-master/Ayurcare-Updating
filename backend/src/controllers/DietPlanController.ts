import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types';

const prisma = new PrismaClient();

export class DietPlanController {
  async getAllDietPlans(req: Request, res: Response): Promise<void> {
    try {
      const dietPlans = await prisma.dietPlan.findMany({
        where: { isActive: true },
        include: { 
          doctor: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true } },
          items: { include: { food: true, recipe: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Diet plans retrieved successfully',
        data: dietPlans
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving diet plans',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async createDietPlan(req: Request, res: Response): Promise<void> {
    try {
      const { items, ...dietPlanData } = req.body;
      
      const dietPlan = await prisma.dietPlan.create({
        data: {
          ...dietPlanData,
          items: {
            create: items
          }
        },
        include: { 
          doctor: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true } },
          items: { include: { food: true, recipe: true } }
        }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Diet plan created successfully',
        data: dietPlan
      };

      res.status(201).json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error creating diet plan',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async getDietPlanById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dietPlan = await prisma.dietPlan.findUnique({
        where: { id },
        include: { 
          doctor: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true } },
          items: { include: { food: true, recipe: true } }
        }
      });

      if (!dietPlan) {
        const response: ApiResponse = {
          success: false,
          message: 'Diet plan not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Diet plan retrieved successfully',
        data: dietPlan
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving diet plan',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async updateDietPlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dietPlan = await prisma.dietPlan.update({
        where: { id },
        data: req.body
      });

      const response: ApiResponse = {
        success: true,
        message: 'Diet plan updated successfully',
        data: dietPlan
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error updating diet plan',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async deleteDietPlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.dietPlan.update({
        where: { id },
        data: { isActive: false }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Diet plan deleted successfully'
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error deleting diet plan',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async getDietPlanItems(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const dietPlan = await prisma.dietPlan.findUnique({
        where: { id },
        include: { 
          items: { include: { food: true, recipe: true } }
        }
      });

      if (!dietPlan) {
        const response: ApiResponse = {
          success: false,
          message: 'Diet plan not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Diet plan items retrieved successfully',
        data: dietPlan.items
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving diet plan items',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }
}