import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse, AuthRequest } from '../types';

const prisma = new PrismaClient();

export class ReminderController {
  async getAllReminders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const reminders = await prisma.reminder.findMany({
        where: { userId, isActive: true },
        orderBy: { date: 'asc' }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Reminders retrieved successfully',
        data: reminders
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving reminders',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async createReminder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const reminder = await prisma.reminder.create({
        data: { ...req.body, userId }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Reminder created successfully',
        data: reminder
      };

      res.status(201).json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error creating reminder',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async getReminderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reminder = await prisma.reminder.findUnique({
        where: { id }
      });

      if (!reminder) {
        const response: ApiResponse = {
          success: false,
          message: 'Reminder not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Reminder retrieved successfully',
        data: reminder
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving reminder',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async updateReminder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reminder = await prisma.reminder.update({
        where: { id },
        data: req.body
      });

      const response: ApiResponse = {
        success: true,
        message: 'Reminder updated successfully',
        data: reminder
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error updating reminder',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async deleteReminder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.reminder.update({
        where: { id },
        data: { isActive: false }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Reminder deleted successfully'
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error deleting reminder',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }
}