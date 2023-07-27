import mongoose from "mongoose"
import validator from "validator"

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
  username: { type: String, unique: true, required: true },
  role: {
    type: String,
    enum: ["user", "business"],
    default: "user",
  },
})

const User = mongoose.model("users", UserSchema)

export default User
