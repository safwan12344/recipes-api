import mongoose from "../utils/mongoose"

const recipesSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: "categories" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  name: { type: String, required: true },
  description: { type: String, required: true },
  time: { type: Number, required: true },
  preparation: [{ type: String, required: true }],
  rating: { type: Number, default: 0 },
  sumRating: { type: Number, default: 0 },
  numberOfVotes: { type: Number, default: 0 },
  imageURL: { type: String, required: true },
  ingredients: [{ type: mongoose.Types.ObjectId, ref: "ingredients" }],
  // TODO: change required to true
  orderLink: { type: String, required: false },
  comments: [{ type: mongoose.Types.ObjectId, ref: "comments" }],
})

const Recipe = mongoose.model("recipes", recipesSchema)

export default Recipe
