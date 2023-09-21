import express from "express"
import categoryController from "../controllers/category"
import { authenticate } from "../middlerwares/auth"
import { objectId } from "../middlerwares/object-id"

const router = express.Router()

router.post("/", authenticate, categoryController.createCategory)
router.patch(
  "/:id",
  authenticate,
  objectId(["id"]),
  categoryController.updateCategory
)
router.get("/", categoryController.getAllCategories)

router.get(
  "/:id/recipes",
  objectId(["id"]),
  categoryController.getAllRecipesByCategory
)

export default router
