import express from "express"
import authController from "../controllers/auth"
const router = express.Router()

router.post("/login", authController.login)
router.post("/forgot-password", authController.forgotPassword)
router.post("/reset-password/:token", authController.resetPassword)
router.get("/me", authController.me)

export default router
