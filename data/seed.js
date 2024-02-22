const User = require("../src/models/user").default
const { default: mongoose } = require("mongoose")
import dotenv from "dotenv"
import Category from "../src/models/category"
const users = require("./users.json")
import recipes from "./recipes.json"
import categories from "./categories.json"
import books from "./books.json"
import activities from "./activities.json"
import Recipe from "../src/models/recipe"
import Comment from "../src/models/comment"
import Ingredient from "../src/models/ingredient"
import Book from "../src/models/book"
import Activity from "../src/models/activities"
import { add } from "date-fns"
const bcrypt = require("bcrypt")

dotenv.config()

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("DB Connected!"))

const generateUserPassword = async (password, genSalt = 10) => {
  const salt = await bcrypt.genSalt(genSalt)
  const hashPassword = await bcrypt.hash(password, salt)
  return hashPassword
}

function getDates() {
  const days = []
  const today = new Date()
  for (let index = 1; index <= 7; index++) {
    days.push(add(today, { days: index }))
  }
  return days
}

const createReplies = async (comment, recipeId) => {
  if (comment.replies.length === 0) {
    return []
  }
  const repliesPromise = comment.replies.map(async (reply) => {
    const replyReplies = await createReplies(reply, recipeId)
    return await Comment.create({
      comment: reply.comment,
      username: reply.username,
      recipe: recipeId,
      replies: replyReplies,
    })
  })
  const replies = await Promise.all(repliesPromise)
  return replies.map((r) => r._id)
}

const main = async () => {
  await Category.deleteMany()
  await User.deleteMany()
  await Comment.deleteMany()
  await Ingredient.deleteMany()
  await Recipe.deleteMany()
  await Book.deleteMany()
  await Activity.deleteMany()

  const userPromises = users.map(async (item) => {
    const user = {
      username: item.username,
      email: item.email,
      role: item.role,
      firstName: item.firstName,
      lastName: item.lastName,
    }
    const hashPassword = await generateUserPassword(item.password)

    return await User.create({ ...user, password: hashPassword })
  })
  await Promise.all(userPromises)

  const promisesCategory = categories.map(async (category) => {
    return await Category.create({
      name: category.name,
      imageURL: category.imageURL,
    })
  })
  await Promise.all(promisesCategory)

  const recipiesPromise = recipes.map(async (recipe) => {
    const user = await User.findOne({ username: recipe.user.username })
    const category = await Category.findOne({ name: recipe.category.name })
    const ingredentsPromise = recipe.ingredients.map(async (i) => {
      return await Ingredient.create({
        amount: i.amount,
        name: i.name,
        unit: i.unit,
      })
    })
    const ingredents = await Promise.all(ingredentsPromise)
    const ingredentsIds = ingredents.map((i) => i._id)
    const newRecipe = Recipe({
      name: recipe.name,
      user: user._id,
      category: category._id,
      description: recipe.description,
      time: recipe.time,
      preparation: recipe.preparation,
      rating: recipe.rating,
      sumRating: recipe.sumRating,
      numberOfVotes: recipe.numberOfVotes,
      orderLink: recipe.orderLink,
      imageURL: recipe.imageURL,
      ingredients: ingredentsIds,
    })
    const commentsPromise = recipe.comments.map(async (comment) => {
      const replies = await createReplies(comment, newRecipe._id)

      return Comment.create({
        comment: comment.comment,
        recipe: newRecipe._id,
        username: comment.username,
        replies: replies,
      })
    })
    const comments = await Promise.all(commentsPromise)
    const commentsIds = comments.map((c) => c._id)
    newRecipe.comments = commentsIds
    return await newRecipe.save()
  })

  await Promise.all(recipiesPromise)

  const booksPromise = books.map(async (book) => {
    const user = await User.findOne({ username: "etop0" })
    return Book.create({
      user: user._id,
      name: book.name,
      orderLink: book.orderLink,
      imageURL: book.imageURL,
    })
  })

  await Promise.all(booksPromise)

  const days = getDates()
  const activitiesPromise = activities.map(async (activity) => {
    const user = await User.findOne({ username: "etop0" })
    return Activity.create({
      user: user._id,
      name: activity.name,
      date: days[Math.floor(Math.random() * days.length)],
      startTime: activity.startTime,
      endTime: activity.endTime,
      location: activity.location,
      maxOfParticipants: activity.maxOfParticipants,
      imageURL: activity.imageURL,
      details: activity.details,
    })
  })

  await Promise.all(activitiesPromise)
}

main().then(() => {
  console.log("Database Genreated....")
  process.exit()
})
