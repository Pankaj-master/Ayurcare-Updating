import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse, AuthRequest } from '../types';

const prisma = new PrismaClient();

export class ChatController {
  async getAllMessages(req: Request, res: Response): Promise<void> {
    try {
      const messages = await prisma.chatMessage.findMany({
        include: {
          sender: { select: { id: true, name: true, role: true } },
          receiver: { select: { id: true, name: true, role: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Messages retrieved successfully',
        data: messages
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving messages',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { receiverId, patientId, message } = req.body;
      const senderId = req.user!.userId;

      const chatMessage = await prisma.chatMessage.create({
        data: {
          senderId,
          receiverId,
          patientId,
          message
        },
        include: {
          sender: { select: { id: true, name: true, role: true } },
          receiver: { select: { id: true, name: true, role: true } }
        }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Message sent successfully',
        data: chatMessage
      };

      res.status(201).json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error sending message',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async getMessageById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const message = await prisma.chatMessage.findUnique({
        where: { id },
        include: {
          sender: { select: { id: true, name: true, role: true } },
          receiver: { select: { id: true, name: true, role: true } }
        }
      });

      if (!message) {
        const response: ApiResponse = {
          success: false,
          message: 'Message not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Message retrieved successfully',
        data: message
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving message',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async getConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const currentUserId = req.user!.userId;

      const messages = await prisma.chatMessage.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: currentUserId },
            { senderId: currentUserId, receiverId: userId }
          ]
        },
        include: {
          sender: { select: { id: true, name: true, role: true } },
          receiver: { select: { id: true, name: true, role: true } }
        },
        orderBy: { createdAt: 'asc' }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Conversation retrieved successfully',
        data: messages
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving conversation',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.chatMessage.update({
        where: { id },
        data: { isRead: true }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Message marked as read'
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error marking message as read',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }
}