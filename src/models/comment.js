import mongoose from "../utils/mongoose"

const commentSchema = new mongoose.Schema({
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: "recipes" },
  username: { type: String, required: true },
  comment: { type: String, required: true },
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",
      autopopulate: true,
    },
  ],
})

const Comment = mongoose.model("comments", commentSchema)

export default Comment
