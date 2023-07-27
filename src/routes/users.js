import express from "express"
import userController from "../controllers/users"
const router = express.Router()

router.get("/", userController.getAllUsers)

router.post("/", userController.createUser)

router.delete("/:id", userController.deleteUser)

export default router
