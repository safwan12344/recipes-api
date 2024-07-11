import Category from "../models/category"
import { deleteFile, uploadFile } from "../utils/aws"
import Recipe from "../models/recipe"
import { v4 as uuidv4 } from "uuid"
import { createError } from "../utils/create-error"

const createCategory = async (req, res, next) => {
  const data = req.body
  const uid = uuidv4()
  //מפתח לשמירת התמונה באמזון
  const key = `admin/categories/${data.name}/${uid}-${req.files.file.name}`

  try {
    const cat = await Category.findOne({ name: data.name })
    if (cat) {
      return next(
        createError(
          400,
          `cannot create category becuase category ${data.name} exist`
        )
      )
    }
    const imageURL = await uploadFile(req, "file", key)

    const category = await Category.create({
      imageURL,
      name: data.name,
    })

    res.json(category)
  } catch (err) {
    if (err.code === 11000) {
      return next(
        createError(
          400,
          `failed to create category: category ${data.name} exist`
        )
      )
    }
    next(createError(500, `failed to create category: please try again later`))
  }
}

const updateCategory = async (req, res, next) => {
  const categoryId = req.params.id
  try {
    const category = await Category.findOne({ _id: categoryId })
    if (!category) {
      return next(
        createError(
          400,
          `can't update category ${categoryId} because is not exists`
        )
      )
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
    next(createError(500, `failed to update category: please try again later`))
  }
}

const getAllCategories = async (req, res, next) => {
  try {
    const allCategory = await Category.find({})
    res.json(allCategory)
  } catch (err) {
    next(
      createError(500, `failed to get all categories: please try again later`)
    )
  }
}

const getAllRecipesByCategory = async (req, res, next) => {
  let categoryName
  try {
    const categoryId = req.params.id
    const category = await Category.findOne({ _id: categoryId })
    categoryName = category.name
    const recipes = await Recipe.find({ category })
      .populate("category", "name")
      .populate("ingredients")
      .populate("comments")
      .select("-user")
    res.json(recipes)
  } catch (err) {
    next(createError(500, `could not get recipes for category ${categoryName}`))
  }
}

export default {
  createCategory,
  updateCategory,
  getAllCategories,
  getAllRecipesByCategory,
}
