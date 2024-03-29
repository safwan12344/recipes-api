import validator from "validator"
import mongoose from "../utils/mongoose"

const Schema = mongoose.Schema

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: true,
    validate: [validator.isEmail, "invalid email"],
  },
  password: { type: String, required: true },
  username: { type: String, lowercase: true, unique: true, required: true },
  role: {
    type: String,
    enum: ["user", "business"],
    default: "user",
  },
  canReciveEmail: {
    type: Boolean,
    default: false,
  },
})

UserSchema.methods.toJSON = function () {
  var obj = this.toObject()
  delete obj.__v
  delete obj.password
  return obj
}

const User = mongoose.model("users", UserSchema)

export default User
