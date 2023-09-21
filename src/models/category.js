import mongoose from "../utils/mongoose"

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  imageURL: { type: String, required: true },
})

CategorySchema.index({ name: 1 }, { unique: true })

const Category = mongoose.model("categories", CategorySchema)

export default Category
