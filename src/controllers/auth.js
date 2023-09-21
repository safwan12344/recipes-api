import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/user"
import { authenticate } from "../middlerwares/auth"
import { createError } from "../utils/create-error"

const login = async function (req, res, next) {
  const data = { ...req.body }
  //data.password = data.password.replaceAll("\\", "")
  //data.password = data.password.replaceAll("\\\\", "\\")
  const user = await User.findOne({ username: data.username })
  if (!user) {
    return next(createError(401, "invalid credentials"))
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
      return next(createError(401, "invalid credentials"))
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
