import mongoose from "mongoose"

const recipesSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: "categories" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  name: { type: String, required: true },
  description: { type: String, required: true },
  time: { type: Number, required: true },
  preparation: [{ type: String, required: true }],
  rating: { type: Number, default: 0 },
  imageURL: { type: String, required: true },
})

const Recipe = mongoose.model("recipes", recipesSchema)

export default Recipe
