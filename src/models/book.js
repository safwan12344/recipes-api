import mongoose from "mongoose"

const bookSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Types.ObjectId, ref: "users" },
  imageURL: { type: String, required: true },
  orderLink: { type: String, required: true },
})

const Book = mongoose.model("books", bookSchema)
export default Book
