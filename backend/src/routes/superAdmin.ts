// import express from "express";
// import { SuperAdminController } from "../controllers/SuperAdmin";
// import { authenticateToken, authorizeRoles } from "../middleware/auth";

// const router = express.Router();
// const controller = new SuperAdminController();

// // SUPER ADMIN ONLY ROUTES
// router.get(
//   "/doctors",
//   authenticateToken,
//   authorizeRoles("SUPER_ADMIN"),
//   controller.getAllDoctors.bind(controller)
// );

// router.get(
//   "/doctors/pending",
//   authenticateToken,
//   authorizeRoles("SUPER_ADMIN"),
//   controller.getPendingDoctors.bind(controller)
// );

// router.get(
//   "/doctors/:id",
//   authenticateToken,
//   authorizeRoles("SUPER_ADMIN"),
//   controller.getDoctorById.bind(controller)
// );

// router.post(
//   "/doctors/:id/approve",
//   authenticateToken,
//   authorizeRoles("SUPER_ADMIN"),
//   controller.approveDoctor.bind(controller)
// );

// router.post(
//   "/doctors/:id/reject",
//   authenticateToken,
//   authorizeRoles("SUPER_ADMIN"),
//   controller.rejectDoctor.bind(controller)
// );

// router.get(
//   "/stats",
//   authenticateToken,
//   authorizeRoles("SUPER_ADMIN"),
//   controller.getAdminDashboardStats.bind(controller)
// );

// export default router;
