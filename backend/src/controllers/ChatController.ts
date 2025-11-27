import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ApiResponse, AuthRequest } from "../types";
import { io } from "../index";


const prisma = new PrismaClient();

export class ChatController {
  async getAllMessages(req: Request, res: Response): Promise<void> {
    try {
      const messages = await prisma.chatMessage.findMany({
        include: {
          sender: { select: { id: true, name: true, role: true } },
          receiver: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const response: ApiResponse = {
        success: true,
        message: "Messages retrieved successfully",
        data: messages,
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Error retrieving messages",
        error: error instanceof Error ? error.message : "Unknown error",
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
          message,
        },
        include: {
          sender: { select: { id: true, name: true, role: true } },
          receiver: { select: { id: true, name: true, role: true } },
        },
      });

      io.to(receiverId).emit("newMessage", chatMessage);

      const response: ApiResponse = {
        success: true,
        message: "Message sent successfully",
        data: chatMessage,
      };

      res.status(201).json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Error sending message",
        error: error instanceof Error ? error.message : "Unknown error",
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
          receiver: { select: { id: true, name: true, role: true } },
        },
      });

      if (!message) {
        const response: ApiResponse = {
          success: false,
          message: "Message not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: "Message retrieved successfully",
        data: message,
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Error retrieving message",
        error: error instanceof Error ? error.message : "Unknown error",
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
            { senderId: currentUserId, receiverId: userId },
          ],
        },
        include: {
          sender: { select: { id: true, name: true, role: true } },
          receiver: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      });

      const response: ApiResponse = {
        success: true,
        message: "Conversation retrieved successfully",
        data: messages,
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Error retrieving conversation",
        error: error instanceof Error ? error.message : "Unknown error",
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
        data: { isRead: true },
      });

      const response: ApiResponse = {
        success: true,
        message: "Message marked as read",
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Error marking message as read",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
      return;
    }
  }

  async getChatSummary(req: Request, res: Response) {
    try {
      const { user } = req as any;
      const doctorId = user.id;

      // Find patients assigned to doctor
      const patients = await prisma.patient.findMany({
        where: { doctorId },
        select: { id: true },
      });

      const patientIds = patients.map((p) => p.id);
      if (!patientIds.length) {
        return res.json({ success: true, data: [] });
      }

      const summaries = await Promise.all(
        patientIds.map(async (patientId) => {
          const lastMessage = await prisma.chatMessage.findFirst({
            where: { patientId },
            orderBy: { createdAt: "desc" },
          });

          const unreadCount = await prisma.chatMessage.count({
            where: {
              patientId,
              receiverId: doctorId,
              isRead: false,
            },
          });

          return {
            patientId,
            lastMessage: lastMessage?.message || null,
            lastMessageTime: lastMessage?.createdAt || null,
            unreadCount,
          };
        })
      );

      return res.json({
        success: true,
        message: "Chat summary retrieved successfully",
        data: summaries,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to get chat summary",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
