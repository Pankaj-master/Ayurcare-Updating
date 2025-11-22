import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types';

const prisma = new PrismaClient();

export class HealthRecordController {
  async getAllHealthRecords(req: Request, res: Response): Promise<void> {
    try {
      const healthRecords = await prisma.healthRecord.findMany({
        include: {
          patient: { select: { id: true, name: true } }
        },
        orderBy: { date: 'desc' }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Health records retrieved successfully',
        data: healthRecords
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving health records',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async createHealthRecord(req: Request, res: Response): Promise<void> {
    try {
      const healthRecord = await prisma.healthRecord.create({
        data: req.body,
        include: {
          patient: { select: { id: true, name: true } }
        }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Health record created successfully',
        data: healthRecord
      };

      res.status(201).json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error creating health record',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async getHealthRecordById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const healthRecord = await prisma.healthRecord.findUnique({
        where: { id },
        include: {
          patient: { select: { id: true, name: true } }
        }
      });

      if (!healthRecord) {
        const response: ApiResponse = {
          success: false,
          message: 'Health record not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Health record retrieved successfully',
        data: healthRecord
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving health record',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async updateHealthRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const healthRecord = await prisma.healthRecord.update({
        where: { id },
        data: req.body
      });

      const response: ApiResponse = {
        success: true,
        message: 'Health record updated successfully',
        data: healthRecord
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error updating health record',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async deleteHealthRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.healthRecord.delete({ where: { id } });

      const response: ApiResponse = {
        success: true,
        message: 'Health record deleted successfully'
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error deleting health record',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }
}