import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ApiResponse } from "../types";

const prisma = new PrismaClient();

export class DietPlanController {
  // -------------------------------------------------------
  // GET ALL DIET PLANS
  // -------------------------------------------------------
  async getAllDietPlans(req: Request, res: Response): Promise<void> {
    try {
      const dietPlans = await prisma.dietPlan.findMany({
        where: { isActive: true },
        include: {
          doctor: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true } },
          items: {
            include: { food: true }, // ❗ recipe removed
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({
        success: true,
        message: "Diet plans retrieved successfully",
        data: dietPlans,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error retrieving diet plans",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return;
    }
  }

  // -------------------------------------------------------
    // -------------------------------------------------------
  // CREATE DIET PLAN
  // -------------------------------------------------------
  async createDietPlan(req: Request, res: Response): Promise<void> {
    try {
      const { items, ...dietPlanData } = req.body;

      // 1. Ensure required doctorId (references User.id)
      const doctorId = (req as any).user?.userId || dietPlanData.doctorId;

      // 2. Resolve patientId to User.id (since DietPlan.patientId references User.id!)
      let targetUserId: string | null = null;
      if (dietPlanData.patientId) {
        // Check if patientId is already a User.id
        const userExists = await prisma.user.findUnique({
          where: { id: dietPlanData.patientId },
        });

        if (userExists) {
          targetUserId = userExists.id;
        } else {
          // If it's a Patient profile id, get the associated userId
          const patientProfile = await prisma.patient.findUnique({
            where: { id: dietPlanData.patientId },
          });
          if (patientProfile) {
            targetUserId = patientProfile.userId;
          }
        }
      }

      // 3. Ensure each item has dayNumber
      const updatedItems = (items || []).map((item: any) => ({
        ...item,
        dayNumber: item.dayNumber ?? 1,
      }));

      const dietPlan = await prisma.dietPlan.create({
        data: {
          patientId: targetUserId, // 👈 Correctly links to User.id!
          doctorId,
          name: dietPlanData.name,
          description: dietPlanData.description,
          duration: dietPlanData.duration ?? 7,
          isActive: dietPlanData.isActive ?? true,
          items: {
            create: updatedItems,
          },
        },
        include: {
          doctor: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true } },
          items: { include: { food: true } },
        },
      });

      res.status(201).json({
        success: true,
        message: "Diet plan created successfully",
        data: dietPlan,
      });
    } catch (error) {
      console.error("Create diet plan error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating diet plan",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  // -------------------------------------------------------
  // GET DIET PLAN BY ID
  // -------------------------------------------------------
  async getDietPlanById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const dietPlan = await prisma.dietPlan.findUnique({
        where: { id },
        include: {
          doctor: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true } },
          items: { include: { food: true } },
        },
      });

      if (!dietPlan) {
        res.status(404).json({
          success: false,
          message: "Diet plan not found",
        });
        return;
      }

      res.json({
        success: true,
        message: "Diet plan retrieved successfully",
        data: dietPlan,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error retrieving diet plan",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // -------------------------------------------------------
  // UPDATE DIET PLAN
  // -------------------------------------------------------
  async updateDietPlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const dietPlan = await prisma.dietPlan.update({
        where: { id },
        data: req.body,
      });

      res.json({
        success: true,
        message: "Diet plan updated successfully",
        data: dietPlan,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating diet plan",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // -------------------------------------------------------
  // DELETE (SOFT DELETE)
  // -------------------------------------------------------
  async deleteDietPlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.dietPlan.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({
        success: true,
        message: "Diet plan deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting diet plan",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // -------------------------------------------------------
  // GET ITEMS OF A DIET PLAN
  // -------------------------------------------------------
  async getDietPlanItems(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const dietPlan = await prisma.dietPlan.findUnique({
        where: { id },
        include: {
          items: { include: { food: true } }, // ❗ no recipe now
        },
      });

      if (!dietPlan) {
        res.status(404).json({
          success: false,
          message: "Diet plan not found",
        });
        return;
      }

      res.json({
        success: true,
        message: "Diet plan items retrieved successfully",
        data: dietPlan.items,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error retrieving diet plan items",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  async getDietPlansForPatient(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;

      const plans = await prisma.dietPlan.findMany({
        where: {
          patientId,
          isActive: true,
        },
        include: {
          doctor: { select: { id: true, name: true } },
          items: {
            include: { food: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({
        success: true,
        message: "Diet plans for patient retrieved successfully",
        data: plans,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error retrieving patient diet plans",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getDietPlansByDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId } = req.params;

      const plans = await prisma.dietPlan.findMany({
        where: {
          doctorId,
          isActive: true,
        },
        include: {
          doctor: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true } },
          items: {
            include: { food: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({
        success: true,
        message: "Diet plans for patient retrieved successfully",
        data: plans,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error retrieving patient diet plans",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getDietPlanByDays(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const dietPlan = await prisma.dietPlan.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              food: true,
            },
            orderBy: [{ dayNumber: "asc" }, { mealType: "asc" }],
          },
        },
      });

      if (!dietPlan) {
        res.status(404).json({
          success: false,
          message: "Diet plan not found",
        });
        return;
      }

      // Group items by day
      const groupedByDay: Record<number, any> = {};

      dietPlan.items.forEach((item) => {
        if (!groupedByDay[item.dayNumber]) {
          groupedByDay[item.dayNumber] = {
            dayNumber: item.dayNumber,
            meals: {
              BREAKFAST: [],
              LUNCH: [],
              DINNER: [],
              SNACK: [],
            },
          };
        }

        groupedByDay[item.dayNumber].meals[item.mealType].push({
          id: item.id,
          mealType: item.mealType,
          time: item.time,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes,
          food: item.food,
        });
      });

      res.json({
        success: true,
        message: "Diet plan grouped by days",
        data: Object.values(groupedByDay),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error grouping diet plan by days",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async duplicateDietPlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const existing = await prisma.dietPlan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existing) {
        res
          .status(404)
          .json({ success: false, message: "Diet plan not found" });
        return;
      }

      const { items, id: _oldId, createdAt, updatedAt, ...base } = existing;

      const duplicated = await prisma.dietPlan.create({
        data: {
          ...base,
          name: base.name + " (Copy)", // ✔️ correct field
          items: {
            create: items.map((i) => ({
              mealType: i.mealType,
              dayNumber: i.dayNumber, // ✔️ correct field
              dayOfWeek: i.dayOfWeek, // keep if used
              foodId: i.foodId,
              quantity: i.quantity ?? 1,
              unit: i.unit,
              time: i.time,
              notes: i.notes,
            })),
          },
        },
        include: { items: true },
      });

      res.json({
        success: true,
        message: "Diet plan duplicated successfully",
        data: duplicated,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error duplicating diet plan",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async addDietPlanItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      const item = await prisma.dietPlanItem.create({
        data: {
          dietPlanId: id,
          ...data,
        },
        include: { food: true },
      });

      res.json({
        success: true,
        message: "Item added successfully",
        data: item,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error adding item",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async updateDietPlanItem(req: Request, res: Response): Promise<void> {
    try {
      const { itemId } = req.params;

      const item = await prisma.dietPlanItem.update({
        where: { id: itemId },
        data: req.body,
        include: { food: true },
      });

      res.json({
        success: true,
        message: "Item updated successfully",
        data: item,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating item",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deleteDietPlanItem(req: Request, res: Response): Promise<void> {
    try {
      const { itemId } = req.params;

      await prisma.dietPlanItem.delete({
        where: { id: itemId },
      });

      res.json({
        success: true,
        message: "Item deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting item",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getDietPlanByDay(req: Request, res: Response): Promise<void> {
    try {
      const { id, dayNumber } = req.params;

      const plan = await prisma.dietPlan.findUnique({
        where: { id },
        include: {
          items: {
            where: { dayNumber: Number(dayNumber) },
            include: { food: true },
          },
        },
      });

      if (!plan) {
        res
          .status(404)
          .json({ success: false, message: "Diet plan not found" });
        return;
      }

      res.json({
        success: true,
        message: "Diet plan day retrieved",
        data: plan.items,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error retrieving diet plan by day",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
