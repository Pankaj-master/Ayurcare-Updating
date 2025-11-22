import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types';

const prisma = new PrismaClient();

export class AppointmentController {
  async getAllAppointments(req: Request, res: Response): Promise<void> {
    try {
      const appointments = await prisma.appointment.findMany({
        include: {
          doctor: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true } }
        },
        orderBy: { date: 'desc' }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Appointments retrieved successfully',
        data: appointments
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving appointments',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async createAppointment(req: Request, res: Response): Promise<void> {
    try {
      const appointment = await prisma.appointment.create({
        data: req.body,
        include: {
          doctor: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true } }
        }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Appointment created successfully',
        data: appointment
      };

      res.status(201).json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error creating appointment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async getAppointmentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          doctor: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true } }
        }
      });

      if (!appointment) {
        const response: ApiResponse = {
          success: false,
          message: 'Appointment not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Appointment retrieved successfully',
        data: appointment
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving appointment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async updateAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const appointment = await prisma.appointment.update({
        where: { id },
        data: req.body
      });

      const response: ApiResponse = {
        success: true,
        message: 'Appointment updated successfully',
        data: appointment
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error updating appointment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async deleteAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.appointment.delete({ where: { id } });

      const response: ApiResponse = {
        success: true,
        message: 'Appointment deleted successfully'
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error deleting appointment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }
}