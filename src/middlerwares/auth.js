import jwt from "jsonwebtoken"
import User from "../models/user"
import { createError } from "../utils/create-error"
// (req)פונקצית ביניים הבודקת אם המשתמש מחובר במידה וכן המשתמש נשמר באוביקט הבקשה
export const authenticate = function (req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return next(createError(401, "no token"))
  }

  jwt.verify(token, process.env.TOKEN_SECRET, async (err, userToken) => {
    if (err) {
      return next(createError(403, "invalid token"))
    }

    const user = await User.findOne({
      _id: userToken._id,
      username: userToken.username,
    })

    req.user = user

    next()
  })
}
