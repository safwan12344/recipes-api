import express from "express"
import { authenticate } from "../middlerwares/auth"
import {
  createRecipe,
  updateRecipe,
  rating,
  userRecipes,
  deleteRecipe,
  addComment,
  addReplayToComment,
  getRecipe,
  searchRecipies,
  searchAuthRecipies,
} from "../controllers/recipes"
import validate from "../middlerwares/validate"
import recipeSchema from "../validations/recipe"
import { objectId } from "../middlerwares/object-id"
import Recipe from "../models/recipe"

const router = express.Router()

router.get("/test", async (req, res) => {
  const recepies = await Recipe.find()
    .populate("category")
    .populate("ingredients")
    .populate("user")
    .populate("comments")
  res.json(recepies)
})

router.post(
  "/:id/comments/:commentId",
  authenticate,
  objectId(["id", "commentId"]),
  addReplayToComment
)
router.post("/:id/comments", authenticate, objectId(["id"]), addComment)
router.post("/:id/rating", authenticate, objectId(["id"]), rating)
router.post("/", authenticate, validate(recipeSchema), createRecipe)
router.get("/my", authenticate, userRecipes)
router.get("/search", searchRecipies)
router.get("/auth/search", authenticate, searchAuthRecipies)
router.get("/:id", objectId(["id"]), getRecipe)

router.put("/:id", authenticate, objectId(["id"]), updateRecipe)
router.delete("/:id/", authenticate, objectId(["id"]), deleteRecipe)

//Endpoint start with: /recpies

export default router
