import express from "express"
import userController from "../controllers/users"
import validate from "../middlerwares/validate"
import userSchema from "../validations/user"
import { objectId } from "../middlerwares/object-id"
const router = express.Router()

router.get("/", userController.getAllUsers)

router.post("/", validate(userSchema), userController.createUser)

router.delete("/:id", objectId(["id"]), userController.deleteUser)

export default router
