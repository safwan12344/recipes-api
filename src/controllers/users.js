import User from "../models/user"

const getAllUsers = async (rea, res) => {
  const mUsers = await User.find({}).exec()
  res.json({ mUsers })
}

const createUser = async (req, res) => {
  const data = req.body
  const user = {
    username: data.username,
    password: data.password,
    email: data.email,
    role: data.role,
    firstName: data.firstName,
    lastName: data.lastName,
  }
  const newUser = await User.create(user)
  res.json({ message: "User successfuly created", user: newUser })
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
