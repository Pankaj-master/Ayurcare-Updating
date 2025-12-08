import { Request, Response } from "express";
import { PrismaClient, Verified } from "@prisma/client";
import { ApiResponse, AuthRequest } from "../types";
import { sendDoctorRejectionMail, sendDoctorVerificationMail } from "../services/mail.service";

const prisma = new PrismaClient();

export class SuperAdminController {

  // --------------------------------------------------
  // GET ALL DOCTORS
  // --------------------------------------------------
  async getAllDoctors(req: AuthRequest, res: Response) {
    try {
      const doctors = await prisma.user.findMany({
        where: { role: "DOCTOR" },
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
          is_verified: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json({
        success: true,
        message: "Doctors retrieved successfully",
        data: doctors,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ 
        success: false, 
        message: "Error retrieving doctors" 
      });
    }
  }


  // --------------------------------------------------
  // GET ONLY PENDING DOCTORS
  // --------------------------------------------------
  async getPendingDoctors(req: AuthRequest, res: Response) {
    try {
      const doctors = await prisma.user.findMany({
        where: { role: "DOCTOR", is_verified: "PENDING" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          licenseNumber: true,
          specialization: true,
          experience: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json({
        success: true,
        message: "Pending doctors retrieved successfully",
        data: doctors,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ 
        success: false, 
        message: "Error retrieving pending doctors" 
      });
    }
  }


  // --------------------------------------------------
  // GET DOCTOR BY ID
  // --------------------------------------------------
  async getDoctorById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const doctor = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          phone: true,
          address: true,
          specialization: true,
          licenseNumber: true,
          experience: true,
          is_verified: true,
          medicalHistory: true,
          allergies: true,
          medications: true,
          role: true,
          createdAt: true,
        },
      });

      if (!doctor || doctor.role !== "DOCTOR") {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      return res.json({
        success: true,
        message: "Doctor retrieved successfully",
        data: doctor,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ 
        success: false, 
        message: "Error retrieving doctor" 
      });
    }
  }


  // --------------------------------------------------
  // APPROVE DOCTOR  (set is_verified = VERIFIED)
  // --------------------------------------------------
  async approveDoctor(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const doctor = await prisma.user.update({
        where: { id },
        data: {
          is_verified: Verified.VERIFIED,
        },
      });
      await sendDoctorVerificationMail(doctor.email, doctor.name);

      return res.json({
        success: true,
        message: "Doctor approved successfully",
        data: doctor,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ 
        success: false, 
        message: "Error approving doctor" 
      });
    }
  }


  // --------------------------------------------------
  // REJECT DOCTOR  (set is_verified = REJECTED)
  // --------------------------------------------------
  async rejectDoctor(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const doctor = await prisma.user.update({
        where: { id },
        data: {
          is_verified: Verified.REJECTED,
        },
      });
      await sendDoctorRejectionMail(doctor.email, doctor.name, req.body.reason);

      return res.json({
        success: true,
        message: "Doctor rejected successfully",
        data: doctor,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ 
        success: false, 
        message: "Error rejecting doctor" 
      });
    }
  }


  // --------------------------------------------------
  // SUPER ADMIN DASHBOARD STATS
  // --------------------------------------------------
  async getAdminDashboardStats(req: AuthRequest, res: Response) {
    try {
      const [totalDoctors, pendingDoctors, totalPatients] = await Promise.all([
        prisma.user.count({ where: { role: "DOCTOR" } }),
        prisma.user.count({ where: { role: "DOCTOR", is_verified: "PENDING" } }),
        prisma.user.count({ where: { role: "PATIENT" } }),
      ]);

      return res.json({
        success: true,
        message: "Stats retrieved successfully",
        data: {
          totalDoctors,
          pendingDoctors,
          totalPatients,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Error loading admin stats",
      });
    }
  }
}
