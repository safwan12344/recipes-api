import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import Activity from "../models/activities"
import { uploadFile } from "../utils/aws"
import { sendEmail } from "../utils/email"

export const getAllActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find()
    return res.status(200).json(activities)
  } catch (error) {
    next(error)
  }
}

export const getWeeklyActivities = async (req, res, next) => {
  try {
    const today = new Date()
    const firstDayWeekly = startOfWeek(today, { weekStartsOn: 0 })
    const lastDayWeekly = endOfWeek(today, { weekStartsOn: 0 })

    const activities = await Activity.aggregate([
      {
        $match: {
          $and: [
            {
              date: {
                $gte: firstDayWeekly,
              },
            },
            {
              date: {
                $lte: lastDayWeekly,
              },
            },
          ],
        },
      },
    ])

    return res.status(200).json(activities)
  } catch (error) {
    next(error)
  }
}
export const getMonthlyActivities = async (req, res, next) => {
  try {
    const today = new Date()
    const firstDayMonthly = startOfMonth(today)
    const lastDayMonthly = endOfMonth(today)

    const activities = await Activity.aggregate([
      {
        $match: {
          $and: [
            {
              date: {
                $gte: firstDayMonthly,
              },
            },
            {
              date: {
                $lte: lastDayMonthly,
              },
            },
          ],
        },
      },
    ])

    return res.status(200).json(activities)
  } catch (error) {
    next(error)
  }
}

export const createActivity = async (req, res, next) => {
  try {
    const newActivity = new Activity({
      name: req.body.name,
      location: req.body.location,
      maxOfParticipants: req.body.maxOfParticipants,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      user: req.user._id,
    })
    //upload image o aws
    if (req.files?.imageFile) {
      const file = req.files.imageFile
      const key = `${req.user.username}/activities/${newActivity._id}/${file.name}`
      const imageURL = await uploadFile(req, "imageFile", key)
      newActivity.imageURL = imageURL
    }
    const activity = await newActivity.save()
    res.status(201).json(activity)
  } catch (error) {
    next(error)
  }
}

export const getActivity = async (req, res, next) => {
  try {
    const id = req.params.id
    const activity = await Activity.findById(id)
    if (!activity) {
      return res.status(404).json({ message: "activity is not found" })
    }
    return res.status(200).json(activity)
  } catch (error) {
    next(error)
  }
}
//add or delete participent
export const toggleParticipent = async (req, res, next) => {
  try {
    const id = req.params.id
    const activity = await Activity.findById(id)
    if (!activity) {
      return res.status(404).json({ message: "activity is not found" })
    }
    const participentId = req.user._id
    const participents = []
    for (let i = 0; i < activity.participants.length; i++) {
      participents[i] = String(activity.participants[i])
    }
    const uniqueParticipents = new Set(participents)
    if (uniqueParticipents.delete(String(participentId))) {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: req.user.email,
        subject: `${activity.name} - ${activity.date} unsubscribed`,
        text: "You cancelled your participation in the event.",
      }
      await sendEmail(mailOptions)
      await Activity.findByIdAndUpdate(id, {
        participants: [...uniqueParticipents],
      })
      res.status(200).json({ message: "user has unsubscribed to event" })
    } else {
      if (activity.maxOfParticipants === activity.participants.length) {
        return res.stats(400).json({ message: "this event is currently full" })
      }
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: req.user.email,
        subject: `${activity.name} - ${activity.date} subscribed`,
        text: "You have approved your participation for the event.",
      }
      await sendEmail(mailOptions)
      await Activity.findByIdAndUpdate(id, {
        participants: [...activity.participants, String(participentId)],
      })
      res.status(200).json({ message: "user has subscribed to event" })
    }
  } catch (error) {
    next(error)
  }
}
