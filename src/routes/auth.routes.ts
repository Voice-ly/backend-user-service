import { Router } from "express";
import { loginUser, logoutUser, forgotPassword, resetPassword } from "../controllers/user.controller";

const router = Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
