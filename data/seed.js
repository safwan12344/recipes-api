const User = require("../src/models/user").default
const { default: mongoose } = require("mongoose")
import dotenv from "dotenv"
import Category from "../src/models/category"
const users = require("./users.json")
import categories from "./categories.json"
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

const main = async () => {
  await Category.deleteMany()
  await User.deleteMany()

  const promises = users.map(async (item) => {
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
  await Promise.all(promises)

  const promisesCategory = categories.map(async (category) => {
    return await Category.create({
      name: category.name,
      imageURL: category.imageURL,
    })
  })
  await Promise.all(promisesCategory)
}

main().then(() => {
  console.log("Database Genreated...")
  process.exit()
})
