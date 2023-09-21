import mongoose from "../utils/mongoose"

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unit: { type: String /*, required: true*/, default: null },
  amount: { type: Number /*required: true */, default: null },
})

const Ingredient = mongoose.model("ingredients", ingredientSchema)

export default Ingredient
