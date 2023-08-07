import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/user"
import { authenticate } from "../middlerwares/auth"

const login = async function (req, res) {
  const data = req.body
  const user = await User.findOne({ username: data.username })
  if (!user) {
    return res.status(401).json({ message: "invalid credentials" })
  }

  bcrypt.compare(data.password, user.password, function (err, result) {
    if (result == true) {
      //generate jwt token
      const token = jwt.sign(
        { _id: user._id, username: user.username },
        process.env.TOKEN_SECRET,
        { expiresIn: "7d" }
      )
      res.json({ token })
    } else {
      res.status(401).json({ message: "invalid credentials" })
    }
  })
}

const me = [
  authenticate,
  function (req, res) {
    res.json({ user: req.user })
  },
]

export default {
  login,
  me,
}
