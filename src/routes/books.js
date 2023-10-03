import express from "express"
import {
  createBook,
  deleteBook,
  getAllBooks,
  getAllUserBooks,
  getUserBook,
  updateBook,
} from "../controllers/books"
import { authenticate } from "../middlerwares/auth"
import { objectId } from "../middlerwares/object-id"
import validate from "../middlerwares/validate"
import { bookSchema, updateBookSchema } from "../validations/book"

const router = express.Router()

// /books
router.post("/", authenticate, validate(bookSchema), createBook)
router.put(
  "/:id",
  authenticate,
  objectId(["id"]),
  validate(updateBookSchema),
  updateBook
)
router.get("/", getAllBooks)
router.get("/my", authenticate, getAllUserBooks)
router.get("/my/:id", authenticate, objectId(["id"]), getUserBook)
router.delete("/:id", authenticate, objectId(["id"]), deleteBook)

export default router
