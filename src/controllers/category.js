import Category from "../models/category"
import { deleteFile, uploadFile } from "../utils/aws"
import Recipe from "../models/recipe"
import { v4 as uuidv4 } from "uuid"

const createCategory = async (req, res) => {
  const data = req.body
  const uid = uuidv4()
  const key = `admin/categories/${data.name}/${uid}-${req.files.file.name}`

  try {
    const cat = await Category.findOne({ name: data.name })
    if (cat) {
      return res.status(400).json({
        message: `cannot create category becuase category ${data.name} exist`,
      })
    }
    const imageURL = await uploadFile(req, "file", key)

    const category = await Category.create({
      imageURL,
      name: data.name,
    })

    res.json(category)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: `failed to create category: category ${data.name} exist`,
      })
    }
    return res.status(500).json({
      message: `failed to create category: please try again later`,
    })
  }
}

const updateCategory = async (req, res) => {
  const categoryId = req.params.id
  try {
    const category = await Category.findOne({ _id: categoryId })
    if (!category) {
      return res.status(400).json({
        message: `can't update category ${categoryId} because is not exists`,
      })
    }

    const uid = uuidv4()

    const key = `admin/categories/${category.name}/${uid}-${req.files.file.name}`

    const imageURL = await uploadFile(req, "file", key)

    const oldImageURL = category.imageURL
    category.imageURL = imageURL
    const updatedCategory = await category.save()

    await deleteFile(oldImageURL)

    res.json(updatedCategory)
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: `failed to update category: please try again later`,
    })
  }
}

const getAllCategories = async (req, res) => {
  try {
    const allCategory = await Category.find({})
    res.json(allCategory)
  } catch (err) {
    return res.status(500).json({
      message: `failed to get all categories: please try again later`,
    })
  }
}

const getAllRecipesByCategory = async (req, res) => {
  let categoryName
  try {
    const categoryId = req.params.id
    const category = await Category.findOne({ _id: categoryId })
    categoryName = category.name
    const recipes = await Recipe.find({ category })
      .populate("category", "name")
      .select("-user")
    res.json(recipes)
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ message: `could not get recipes for category ${categoryName}` })
  }
}

export default {
  createCategory,
  updateCategory,
  getAllCategories,
  getAllRecipesByCategory,
}
