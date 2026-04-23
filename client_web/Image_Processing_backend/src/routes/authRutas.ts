import { Router } from "express";
import { AuthControlador } from "../controllers/authControlador";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", AuthControlador.register);
router.post("/verify-register", AuthControlador.verifyRegister);
router.post("/login", AuthControlador.login);
router.post("/forgot-password", AuthControlador.forgotPassword);
router.post("/reset-password", AuthControlador.resetPassword);
router.post("/verify-login", AuthControlador.verifyLogin);
router.get("/me", AuthControlador.me);
router.post("/logout", AuthControlador.logout);
router.get("/profile", authMiddleware, AuthControlador.profile);
router.put("/profile", authMiddleware, AuthControlador.updateProfile);
router.put("/password", authMiddleware, AuthControlador.updatePassword);

export default router;
