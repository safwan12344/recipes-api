import express from "express"
import { createBook, deleteBook, getAllBooks } from "../controllers/books"
import { authenticate } from "../middlerwares/auth"
import { objectId } from "../middlerwares/object-id"

const router = express.Router()

// /books
router.post("/", authenticate, createBook)
router.get("/", getAllBooks)
router.delete("/:id", authenticate, objectId(["id"]), deleteBook)

export default router
