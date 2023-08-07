import jwt from "jsonwebtoken"
import User from "../models/user"

export const authenticate = function (req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) return res.status(401).json({ message: "no token" })

  jwt.verify(token, process.env.TOKEN_SECRET, async (err, userToken) => {
    if (err) return res.status(403).json({ message: "invalid token" })

    const user = await User.findOne({
      _id: userToken._id,
      username: userToken.username,
    })

    req.user = user

    next()
  })
}
