import express from "express"
import Recipe from "../models/recipe"
import { authenticate } from "../middlerwares/auth"
import { deleteFile, uploadFile } from "../utils/aws"

const router = express.Router()

router.post("/", authenticate, async (req, res) => {
  const data = req.body

  if (req.user.role != "business") {
    return res
      .status(403)
      .json({ message: "you canot create recipe, need business account" })
  }

  const recipe = {
    category: data.category,
    user: req.user._id,
    name: data.name,
    description: data.description,
    time: data.time,
    preparation: data.preparation,
  }

  const newrecipe = new Recipe(recipe)

  const key = `${req.user.username}/recipes/${newrecipe._id}/${req.files.file.name}`

  try {
    const imageURL = await uploadFile(req, "file", key)
    newrecipe.imageURL = imageURL
    const savedRecipe = await newrecipe.save()
    return res.json({
      message: "create recipe successfuly",
      recipe: savedRecipe,
    })
  } catch (err) {
    console.log(err)
    res
      .status(500)
      .json({ message: `can't create recipe please try again later` })
  }
})

router.put("/:id", authenticate, async (req, res) => {
  const recipeId = req.params.id

  if (req.user.role != "business") {
    return res
      .status(403)
      .json({ message: "you canot update recipe, need business account" })
  }

  const recipe = await Recipe.findOne({ _id: recipeId })
  console.log(recipe)

  if (String(req.user._id) != String(recipe.user)) {
    return res
      .status(403)
      .json({ message: `cannot update recipe: user dont own recipe` })
  }

  const data = {
    category: req.body.category,
    name: req.body.name,
    description: req.body.description,
    time: req.body.time,
    preparation: req.body.preparation,
  }

  const key = `${req.user.username}/recipes/${recipe._id}/${req.files.file.name}`

  try {
    const imageURL = await uploadFile(req, "file", key)
    data.imageURL = imageURL
    const oldImageURL = recipe.imageURL
    await recipe.updateOne(data)
    await deleteFile(oldImageURL)
    res.json({ message: `recipe updated` })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: `can't update recipe please try again later` })
  }
})

export default router
