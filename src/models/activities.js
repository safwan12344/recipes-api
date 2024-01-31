import mongoose from "../utils/mongoose"

const activitiesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Types.ObjectId, ref: "users", autopopulate: true },
  imageURL: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, required: true },
  participants: [
    { type: mongoose.Types.ObjectId, ref: "users", autopopulate: true },
  ],
  maxOfParticipants: { type: Number, default: 0 },
})

const Activity = mongoose.model("activities", activitiesSchema)
export default Activity
