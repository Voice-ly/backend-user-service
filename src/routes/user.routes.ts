import { Router } from "express";
import { createUser,updateUser, deleteUser, getUsers, loginUser } from "../controllers/user.controller";
import { verifyToken } from "../middlewares/auth.middleware";

/**
 * User Routes
 *
 * This router defines all routes related to user management.
 * It includes user creation, retrieval, updating, and deletion.
 *
 * Authentication middleware (`verifyToken`) is applied to protected routes
 * to ensure that only authenticated users can access or modify user data.
 */

const router = Router();

// Public routes
router.post("/", createUser);
router.post("/login", loginUser);

// Protected routes
router.get("/", verifyToken, getUsers);
router.put("/profile", verifyToken, updateUser);
router.delete("/", verifyToken, deleteUser);

export default router;