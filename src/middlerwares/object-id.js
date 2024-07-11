import { createError } from "../utils/create-error"
import { isObjectId } from "../utils/mongoose"

// פןנקצית ביניים שבודקת שהפרמטר שנשלח בכתות הוא אובייקט
//ID
// של מונגו
export const objectId = (parmas) => {
  return (req, res, next) => {
    const errors = []
    parmas.forEach((param) => {
      const value = req.params[param]
      if (!isObjectId(value)) {
        errors.push({
          parma: param,
          message: `${req.params[param]} - Failed to cast to ObjectId`,
        })
      }
    })
    if (errors.length > 0) {
      return next(createError(400, "Object ID", errors))
    }
    next()
  }
}
