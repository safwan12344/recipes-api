import { add, format } from "date-fns"
import Activity from "../models/activities"
import { sendEmail } from "../utils/email"
import mongoose from "../utils/mongoose"
import dotenv from "dotenv"

dotenv.config()
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("DB Connected!"))

async function getActivities() {
  const today = new Date()
  const tomorrow = add(today, { days: 1 })
  const activities = await Activity.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        as: "participants",
      },
    },
    {
      $addFields: {
        dateOnly: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$date",
          },
        },
      },
    },
    {
      $match: {
        dateOnly: {
          $eq: format(tomorrow, "yyyy-MM-dd"),
        },
      },
    },
  ])

  return activities
}

async function sendActivitiesEmail() {
  const activities = await getActivities()
  let mailOptions = {}
  activities.forEach((activity) => {
    activity.participants.forEach(async (participant) => {
      if (participant.canReciveEmail) {
        mailOptions.from = process.env.GMAIL_USER
        mailOptions.to = participant.email
        mailOptions.subject = activity.name
        mailOptions.text = `
                ${activity.name} - the activity takes place tomorrow
                We will be happy to see you
                
                Event Details:
                Date: ${activity.dateOnly}
                Start: ${activity.startTime}
                End: ${activity.endTime}
                Location: ${activity.location}
                `
        await sendEmail(mailOptions)
      }
    })
  })
  console.log("Finsished ")
}
sendActivitiesEmail()
