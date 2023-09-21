import User from "../models/user"
import bcrypt from "bcrypt"
import { createError } from "../utils/create-error"

const getAllUsers = async (rea, res, next) => {
  try {
    const users = await User.find({}).exec()
    res.json({ users })
  } catch (error) {
    next(createError(500, error.message))
  }
}

const createUser = async (req, res, next) => {
  const data = req.body
  const user = {
    username: data.username,
    email: data.email,
    role: data.role,
    firstName: data.firstName,
    lastName: data.lastName,
  }
  bcrypt.hash(data.password, 10, async function (err, hash) {
    if (err) {
      return next(createError(400, "please cheak your data"))
    }
    try {
      const newUser = await User.create({ ...user, password: hash })
      res.json({ message: "User successfuly created", user: newUser })
    } catch (error) {
      next(createError(400, `email or username are already exsits`))
    }
  })
}

const deleteUser = async (req, res, next) => {
  try {
    await User.deleteOne({ _id: req.params.id })

    res.json({ message: "User successfully deleted" })
  } catch (error) {
    next(createError(500, error.message))
  }
}

export default {
  getAllUsers,
  createUser,
  deleteUser,
}
