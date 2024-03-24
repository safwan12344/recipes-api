import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/user"
import { authenticate } from "../middlerwares/auth"
import { createError } from "../utils/create-error"
import { sendEmail } from "../utils/email"

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

const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email
    const user = await User.findOne({ email: email })
    if (!user) {
      return res.status(200).json()
    }
    const forgotPasswordToken = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.TOKEN_SECRET,
      { expiresIn: "5m" }
    )
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: `Reset Password`,
      text: `Hi ${user.firstName},

      We noticed you're having trouble accessing your account. No worries, we're here to help!
      
      To reset your password, simply click the link below:
      
      ${process.env.CLIENT_URL}/reset-password/${forgotPasswordToken}
      
      If you didn't request this, please ignore this email — your account is safe and sound.
      
      Thanks,
      RecipeWorldWide Team`,
    }
    await sendEmail(mailOptions)
    res.status(204).json()
  } catch (error) {
    next(error)
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const token = req.params.token
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, userToken) => {
      if (err) {
        return next(createError(400, "invalid token"))
      }

      const user = await User.findOne({
        _id: userToken._id,
        email: userToken.email,
      })

      bcrypt.hash(req.body.password, 10, async function (err, hash) {
        if (err) {
          return next(
            createError(400, "failed to update password. please try later!")
          )
        }
        user.password = hash
        await user.save()
        res.status(200).json({ message: "password changed" })
      })
    })
  } catch (error) {
    next(error)
  }
}

export default {
  login,
  me,
  forgotPassword,
  resetPassword,
}
