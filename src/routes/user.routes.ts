import { Router } from "express";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser
} from "../controllers/user.controller";

import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

// Rutas protegidas
router.get("/profile", verifyToken, getUsers);
router.put("/profile", verifyToken, updateUser);
router.delete("/profile", verifyToken, deleteUser);

// Registro no requiere auth
router.post("/", createUser);

export default router;
