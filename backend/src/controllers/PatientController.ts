import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ApiResponse, AuthRequest } from "../types";
import bcrypt from "bcryptjs";
import { sendTempPasswordMail } from "../services/mail.service"; // (create this file)

const prisma = new PrismaClient();

export class PatientController {
  async getAllPatients(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [patients, total] = await Promise.all([
        prisma.patient.findMany({
          skip,
          take: Number(limit),
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                age: true,
                gender: true,
                doshaType: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.patient.count(),
      ]);

      const response: ApiResponse = {
        success: true,
        message: "Patients retrieved successfully",
        data: { patients, total },
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  }

  async createPatient(req: Request, res: Response) {
    try {
      const {
        email,
        name,
        doctorId,
        patientCode,
        age,
        gender,
        doshaType,
        medicalHistory,
        allergies,
        medications,
        height,
        weight,
        sleepPattern,
        bowelMovement,
        phone,
        address,
        diseaseId,
      } = req.body;

      // 1. Generate temp password
      const tempPassword = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // 2. Hash password
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // 3. Create User + Patient in a single transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create User
        const newUser = await tx.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
            role: "PATIENT",
            phone,
            address,
            age,
            gender,
            doshaType,
            medicalHistory,
            allergies,
            medications,
          },
        });

        // Create Patient
        const newPatient = await tx.patient.create({
          data: {
            userId: newUser.id,
            doctorId,
            patientCode,
            height,
            weight,
            sleepPattern,
            bowelMovement,
          },
        });

        return { newUser, newPatient };
      });

      // 4. Send email with temporary password
      await sendTempPasswordMail(email, tempPassword);

      // 5. Fetch the complete patient with user relation for response
      const patientWithUser = await prisma.patient.findUnique({
        where: { id: result.newPatient.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              age: true,
              gender: true,
              doshaType: true,
              address: true,
            },
          },
        },
      });

      // 6. Response (DO NOT send password back)
      const response: ApiResponse = {
        success: true,
        message: "Patient created successfully. Temporary password emailed.",
        data: patientWithUser,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error creating patient",
        error,
      });
    }
  }

  async getPatientById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const patient = await prisma.patient.findUnique({
        where: { id },
        include: {
          user: true,
          doctor: true,
        },
      });

      if (!patient) {
        const response: ApiResponse = {
          success: false,
          message: "Patient not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: "Patient retrieved successfully",
        data: patient,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  }

  async updatePatient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const patient = await prisma.patient.update({
        where: { id },
        data: updateData,
      });

      const response: ApiResponse = {
        success: true,
        message: "Patient updated successfully",
        data: patient,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  }

  async deletePatient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.patient.delete({ where: { id } });

      const response: ApiResponse = {
        success: true,
        message: "Patient deleted successfully",
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  }

  async getPatientDietPlans(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // First get the patient to find the userId
      const patient = await prisma.patient.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!patient) {
        const response: ApiResponse = {
          success: false,
          message: "Patient not found",
        };
        res.status(404).json(response);
        return;
      }

      const dietPlans = await prisma.dietPlan.findMany({
        where: { patientId: patient.userId },
        include: { items: { include: { food: true } } },
      });

      const response: ApiResponse = {
        success: true,
        message: "Diet plans retrieved successfully",
        data: dietPlans,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  }

  async getPatientHealthRecords(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // First get the patient to find the userId
      const patient = await prisma.patient.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!patient) {
        const response: ApiResponse = {
          success: false,
          message: "Patient not found",
        };
        res.status(404).json(response);
        return;
      }

      const healthRecords = await prisma.healthRecord.findMany({
        where: { patientId: patient.userId },
        orderBy: { date: "desc" },
      });

      const response: ApiResponse = {
        success: true,
        message: "Health records retrieved successfully",
        data: healthRecords,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  }

  async getPatientsByDoctor(req: Request, res: Response) {
    try {
      const { user } = req as any;
      const doctorId = user!.userId; // coming from authenticateToken middleware

      const patients = await prisma.patient.findMany({
        where: { doctorId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              email: true,
              disease: {
                select: {
                  id: true,
                  name: true,
                  vata: true,
                  pitta: true,
                  kapha: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formatted = patients.map((p) => ({
        patientId: p.id,
        userId: p.user.id,
        name: p.user.name,
        avatar: p.user.avatar,
        email: p.user.email,

        // ⭐ Include disease
        disease: p.user.disease
          ? {
              id: p.user.disease.id,
              name: p.user.disease.name,
              vata: p.user.disease.vata,
              pitta: p.user.disease.pitta,
              kapha: p.user.disease.kapha,
            }
          : null,
      }));

      return res.json({
        success: true,
        message: "Patients retrieved successfully",
        data: formatted,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching patients",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getMyDoctor(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      // Find the patient record connected to this user
      const patient = await prisma.patient.findUnique({
        where: { userId },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              specialization: true,
              role: true,
            },
          },
        },
      });

      if (!patient || !patient.doctor) {
        return res.status(404).json({
          success: false,
          message: "Assigned doctor not found",
        });
      }

      return res.json({
        success: true,
        message: "Doctor retrieved successfully",
        data: patient.doctor,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Error retrieving doctor's profile",
      });
    }
  }

  async getPatientCount(req: AuthRequest, res: Response) {
    try {
      const doctorId = req.user!.userId;

      const total = await prisma.patient.count({
        where: { doctorId },
      });

      return res.json({
        success: true,
        message: "Patient count retrieved successfully",
        data: { total },
      });
    } catch (error) {
      throw error;
    }
  }
}
