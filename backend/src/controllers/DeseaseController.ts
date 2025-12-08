import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse, PaginatedResponse } from '../types';

const prisma = new PrismaClient();

export class DiseaseController {
  // Get all diseases with pagination + sorting
  async getAllDiseases(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const [diseases, total] = await Promise.all([
        prisma.disease.findMany({
          skip,
          take: Number(limit),
          orderBy: { [sortBy as string]: sortOrder }
        }),
        prisma.disease.count()
      ]);

      const totalPages = Math.ceil(total / Number(limit));

      const response: ApiResponse<PaginatedResponse<any>> = {
        success: true,
        message: "Diseases retrieved successfully",
        data: {
          data: diseases,
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
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Error retrieving diseases",
        error: error instanceof Error ? error.message : "Unknown error"
      };
      res.status(500).json(response);
    }
  }

  // Get a single disease
  async getDiseaseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const disease = await prisma.disease.findUnique({
        where: { id }
      });

      if (!disease) {
        const response: ApiResponse = {
          success: false,
          message: "Disease not found"
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<any> = {
        success: true,
        message: "Disease retrieved successfully",
        data: disease
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Error retrieving disease",
        error: error instanceof Error ? error.message : "Unknown error"
      };
      res.status(500).json(response);
    }
  }

  // Create a new disease
  async createDisease(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      const disease = await prisma.disease.create({
        data
      });

      const response: ApiResponse<any> = {
        success: true,
        message: "Disease created successfully",
        data: disease
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Error creating disease",
        error: error instanceof Error ? error.message : "Unknown error"
      };
      res.status(500).json(response);
    }
  }

  // Update disease
  async updateDisease(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const disease = await prisma.disease.update({
        where: { id },
        data: updateData
      });

      const response: ApiResponse<any> = {
        success: true,
        message: "Disease updated successfully",
        data: disease
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Error updating disease",
        error: error instanceof Error ? error.message : "Unknown error"
      };
      res.status(500).json(response);
    }
  }

  // Delete (hard delete — or soft delete if you later add isActive)
  async deleteDisease(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.disease.delete({
        where: { id }
      });

      const response: ApiResponse = {
        success: true,
        message: "Disease deleted successfully"
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Error deleting disease",
        error: error instanceof Error ? error.message : "Unknown error"
      };
      res.status(500).json(response);
    }
  }
}
