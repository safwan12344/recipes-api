import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import Activity from "../models/activities"
import { deleteFile, uploadFile } from "../utils/aws"
import { sendEmail } from "../utils/email"
import { createError } from "../utils/create-error"

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
                $gte: today,
              },
            },
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
      {
        $sort: {
          date: 1,
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
      details: req.body.details,
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

const getMappedActivity = (activity) => {
  return {
    _id: activity._id,
    name: activity.name,
    date: activity.date,
    startTime: activity.startTime,
    endTime: activity.endTime,
    location: activity.location,
    participants: activity.participants.map((p) => p.username),
    maxOfParticipants: activity.maxOfParticipants,
    imageURL: activity.imageURL,
    details: activity.details,
  }
}

export const getActivity = async (req, res, next) => {
  try {
    const id = req.params.id
    const activity = await Activity.findById(id)
    if (!activity) {
      return res.status(404).json({ message: "activity is not found" })
    }
    return res.status(200).json(getMappedActivity(activity))
  } catch (error) {
    next(error)
  }
}

export const editActivity = async (req, res, next) => {
  try {
    const id = req.params.id
    const activity = await Activity.findOne({ _id: id, user: req.user.id })
    if (!activity) {
      return res.status(404).json({ message: "activity is not found" })
    }
    activity.name = req.body.name
    activity.date = new Date(req.body.date)
    activity.startTime = req.body.startTime
    activity.endTime = req.body.endTime
    activity.location = req.body.location
    activity.maxOfParticipants = req.body.maxOfParticipants
    activity.details = req.body.details

    if (req.files?.imageFile) {
      const file = req.files.imageFile
      const key = `${req.user.username}/activities/${activity._id}/${file.name}`
      const imageURL = await uploadFile(req, "imageFile", key)
      const oldImageURL = activity.imageURL
      await deleteFile(oldImageURL)
      activity.imageURL = imageURL
    }

    const updatedActivity = await activity.save()
    res.status(200).json(updatedActivity)
  } catch (error) {
    next(createError(500, "unkown error please try later"))
  }
}

export const deleteActivity = async (req, res, next) => {
  try {
    const id = req.params.id
    const activity = await Activity.findOne({ _id: id, user: req.user.id })

    const mailOptions = {}
    activity.participants.forEach(async (participant) => {
      if (participant.canReciveEmail) {
        mailOptions.from = process.env.GMAIL_USER
        mailOptions.to = participant.email
        mailOptions.subject = activity.name
        mailOptions.text = `
            ${activity.name} - Event cancelled
            
            Event Details:
            Date: ${activity.dateOnly}
            Start: ${activity.startTime}
            End: ${activity.endTime}
            Location: ${activity.location}

            The user hase decided to delete the event
            `
        await sendEmail(mailOptions)
      }
    })
    const imageURL = activity.imageURL
    await activity.deleteOne()
    await deleteFile(imageURL)
    res.status(204).json({ message: "activity deleted" })
  } catch (error) {
    next(createError(500, "unknown error please try later"))
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
      participents[i] = String(activity.participants[i]._id)
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

export const getBusinessActivities = async (req, res, next) => {
  try {
    const id = req.user._id
    let activities = await Activity.find({ user: id })
    activities = activities.map((acitivty) => getMappedActivity(acitivty))
    res.status(200).json(activities)
  } catch (error) {
    next(error)
  }
}
