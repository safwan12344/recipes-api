import express from "express"
import categoryController from "../controllers/category"
import { authenticate } from "../middlerwares/auth"

const router = express.Router()

router.post("/", authenticate, categoryController.createCategory)
router.patch("/:id", authenticate, categoryController.updateCategory)
router.get("/", authenticate, categoryController.getAllCategories)

router.get("/:id/recipes", categoryController.getAllRecipesByCategory)

export default router
