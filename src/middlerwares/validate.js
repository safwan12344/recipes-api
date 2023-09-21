import { createError } from "../utils/create-error"

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validate({ ...req.body, files: req.files })
    return next()
  } catch (err) {
    next(createError(400, "ValidationError", err))
  }
}

export default validate
