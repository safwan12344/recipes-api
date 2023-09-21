import mongoose from "mongoose"

mongoose.plugin(require("mongoose-autopopulate"))

export const isObjectId = (param) => {
  if (!mongoose.Types.ObjectId.isValid(param)) {
    return false
  }
  return true
}

export default mongoose
