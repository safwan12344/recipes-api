import User from "../models/user"
import bcrypt from "bcrypt"

const getAllUsers = async (rea, res) => {
  const users = await User.find({}).exec()
  res.json({ users })
}

const createUser = async (req, res) => {
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
      return res.status(400).json({ message: "please cheak your data" })
    }
    const newUser = await User.create({ ...user, password: hash })
    res.json({ message: "User successfuly created", user: newUser })
  })
}

const deleteUser = async (req, res) => {
  await User.deleteOne({ _id: req.params.id })

  res.json({ message: "User successfully deleted" })
}

export default {
  getAllUsers,
  createUser,
  deleteUser,
}
