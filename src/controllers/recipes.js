import Comment from "../models/comment"
import Ingredient from "../models/ingredient"
import Recipe from "../models/recipe"
import { deleteFile, uploadFile } from "../utils/aws"
import { isObjectId } from "../utils/mongoose"
import { createError } from "../utils/create-error"

export const createRecipe = async (req, res, next) => {
  const data = req.body

  if (req.user.role != "business") {
    return next(
      createError(403, "you canot create recipe, need business account")
    )
  }

  const recipe = {
    category: data.category,
    user: req.user._id,
    name: data.name,
    description: data.description,
    time: data.time,
    preparation: data.preparation.split("\r\n").filter((t) => !!t),
    orderLink: req.body.orderLink,
  }

  const newrecipe = new Recipe(recipe)

  const key = `${req.user.username}/recipes/${newrecipe._id}/${req.files.file.name}`

  try {
    const imageURL = await uploadFile(req, "file", key)
    newrecipe.imageURL = imageURL
    data.ingredients = JSON.parse(data.ingredients)
    const ingredients = await Promise.all(
      data.ingredients.map(async (ingredeint) => {
        const newIngredient = await Ingredient.create({
          name: ingredeint.name,
          unit: ingredeint.unit,
          amount: ingredeint.amount,
        })
        return newIngredient._id
      })
    )
    newrecipe.ingredients = ingredients
    const savedRecipe = await newrecipe.save()
    const r = await savedRecipe.populate("ingredients")

    return res.json({
      message: "create recipe successfuly",
      recipe: r,
    })
  } catch (err) {
    next(createError(500, `can't create recipe please try again later`))
  }
}

export const updateRecipe = async (req, res, next) => {
  const recipeId = req.params.id

  if (req.user.role != "business") {
    return next(
      createError(403, "you canot update recipe, need business account")
    )
  }

  const recipe = await Recipe.findOne({ _id: recipeId })

  if (String(req.user._id) != String(recipe.user)) {
    return next(createError(403, `cannot update recipe: user dont own recipe`))
  }

  const data = {
    category: req.body.category,
    name: req.body.name,
    description: req.body.description,
    time: req.body.time,
    preparation: req.body.preparation.split("\r\n").filter((t) => !!t),
    orderLink: req.body.orderLink,
  }

  try {
    if (req.files && req.files.file) {
      const key = `${req.user.username}/recipes/${recipe._id}/${req.files.file.name}`
      const imageURL = await uploadFile(req, "file", key)
      data.imageURL = imageURL
      const oldImageURL = recipe.imageURL
      await deleteFile(oldImageURL)
    }

    req.body.ingredients = JSON.parse(req.body.ingredients)
    let ingereditsIds = req.body.ingredients.filter((item) => {
      return item._id
    })

    ingereditsIds = ingereditsIds.map((item) => {
      return item.id
    })

    const ingredientsToDelete = recipe.ingredients
      .filter((item) => {
        return !ingereditsIds.includes(String(item._id))
      })
      .map(async (item) => {
        const itemId = String(item._id)
        return await Ingredient.findByIdAndDelete(itemId)
      })

    await Promise.all(ingredientsToDelete)

    const ingredientsToUpdate = req.body.ingredients.map(async (item) => {
      if (item._id) {
        return await Ingredient.findOneAndUpdate(
          { _id: item._id },
          {
            $set: {
              name: item.name,
              unit: item.unit,
              amount: item.amount,
            },
          }
        )
      } else {
        return await Ingredient.create({
          name: item.name,
          unit: item.unit,
          amount: item.amount,
        })
      }
    })
    const result = await Promise.all(ingredientsToUpdate)

    await Recipe.findOneAndUpdate(
      { _id: recipeId },
      { $set: { ...data, ingredients: result } }
    )
    res.json({ message: `recipe updated` })
  } catch (error) {
    next(createError(500, `can't update recipe please try again later`))
  }
}

export const rating = async (req, res, next) => {
  const recipeId = req.params.id
  try {
    const recipe = await Recipe.findById(recipeId).populate("user")
    if (recipe.user._id === req.user._id) {
      return next(
        createError(403, `user is not allowed to rate his own recipe`)
      )
    }
    const userRating = req.body.userRating
    recipe.sumRating += userRating
    recipe.numberOfVotes++
    recipe.rating = recipe.sumRating / recipe.numberOfVotes
    await recipe.save()
    res.status(200).json({ message: `rating update` })
  } catch (error) {
    next(createError(500, error.message))
  }
}

export const userRecipes = async (req, res, next) => {
  if (req.user.role != "business") {
    return next(createError(403, "user is a not allowed to view recipes"))
  }

  const recipes = await Recipe.find({
    user: req.user._id,
  })
    .populate("ingredients")
    .populate("comments")

  res.json({ recipes })
}
export const deleteRecipe = async (req, res, next) => {
  const recipeId = req.params.id
  try {
    if (req.user.role != "business") {
      return next(createError(403, "only business user can delete recipe"))
    }

    const recipe = await Recipe.findById(recipeId)

    if (String(req.user._id) != String(recipe.user)) {
      return next(
        createError(403, "you can't delete recipe that dosent belong to you")
      )
    }

    await recipe.deleteOne()
    res.status(200).json({ message: "recipe deleted" })
  } catch (error) {
    next(createError(500, error.message))
  }
}

export const addComment = async (req, res, next) => {
  const recipeId = req.params.id

  try {
    const recipe = await Recipe.findById(recipeId)
    const data = {
      username: req.user.username,
      comment: req.body.comment,
    }
    const comment = await Comment.create({
      username: data.username,
      comment: data.comment,
      recipe: recipeId,
    })

    recipe.comments.push(comment)
    await recipe.save()
    res.status(200).json({ message: "comment added" })
  } catch (error) {
    next(createError(500, error.message))
  }
}

export const addReplayToComment = async (req, res, next) => {
  const recipeId = req.params.id
  const commentId = req.params.commentId
  try {
    const comment = await Comment.findOne({ _id: commentId, recipe: recipeId })
    const reply = await Comment.create({
      username: req.user.username,
      comment: req.body.comment,
      recipe: recipeId,
    })
    comment.replies.push(reply._id)
    await comment.save()
    res.status(200).json({ message: "comment reply added" })
  } catch (error) {
    next(createError(500, error.message))
  }
}

export const getRecipe = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      return next(new Error(`parma ${req.params.id} is not an objectId`))
    }
    const recpie = await Recipe.findById(req.params.id)
      .populate("ingredients")
      .populate("comments")

    res.json(recpie)
  } catch (error) {
    next(createError(500, error.message))
  }
}

export const searchRecipies = async (req, res, next) => {
  try {
    const query = req.query
    const regex = new RegExp(query.q, "i")
    const recipies = await Recipe.find({
      $or: [
        {
          name: { $regex: regex },
        },
        { description: { $regex: regex } },
      ],
    }).populate("ingredients")
    res.json(recipies)
  } catch (error) {
    next(error)
  }
}

export const searchAuthRecipies = async (req, res, next) => {
  try {
    const query = req.query
    const regex = new RegExp(query.q, "i")
    const recipies = await Recipe.find({
      user: req.user._id,
      $or: [
        {
          name: { $regex: regex },
        },
        { description: { $regex: regex } },
      ],
    }).populate("ingredients")
    res.json(recipies)
  } catch (error) {
    next(error)
  }
}
