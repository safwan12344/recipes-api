import { createError } from "../utils/create-error"

export const isBusiness = (req, res, next) => {
  //check bussiness user
  if (req.user.role !== "business") {
    return next(createError(403, "you not alowed to access this feature"))
  }
  next()
}
