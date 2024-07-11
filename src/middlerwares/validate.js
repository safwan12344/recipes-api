import { createError } from "../utils/create-error"
//פונקצית ביניים שעושה ולידציה לנתונים שנשלחים על ידי הלקוח
const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validate({ ...req.body, ...req.files })
    return next()
  } catch (err) {
    next(createError(400, "ValidationError", err))
  }
}

export default validate
