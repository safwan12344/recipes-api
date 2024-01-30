import {
  format,
  parse,
  isAfter,
  isValid,
  add,
  isBefore,
  differenceInHours,
  isEqual,
  differenceInMinutes,
} from "date-fns"
import * as yup from "yup"

function isAfterOrEqual(firstDate, secondDate) {
  if (isAfter(firstDate, secondDate)) {
    return true
  }
  if (isEqual(firstDate, secondDate)) {
    return true
  }
  return false
}

function isBeforeOrEqual(firstDate, secondDate) {
  if (isBefore(firstDate, secondDate)) {
    return true
  }
  if (isEqual(firstDate, secondDate)) {
    return true
  }
  return false
}

function getTime(date, startTime, endTime) {
  const dateFormat = format(date, "dd/MM/yyyy")
  const activityDate = parse(dateFormat, "dd/MM/yyyy", new Date())
  let startTimeDate = parse(startTime, "HH:mm", activityDate)
  let startTimePlus30Date = add(startTimeDate, { minutes: 30 })
  let endTimeDate = parse(endTime, "HH:mm", activityDate)
  const midnightActivity = parse("00:00", "HH:mm", activityDate)
  const sunriseActivity = parse("06:00", "HH:mm", activityDate)

  if (
    isAfterOrEqual(startTimeDate, midnightActivity) &&
    isBeforeOrEqual(startTimeDate, sunriseActivity)
  ) {
    startTimeDate = add(startTimeDate, { days: 1 })
    startTimePlus30Date = add(startTimePlus30Date, { days: 1 })
    if (isAfterOrEqual(endTimeDate, sunriseActivity)) {
      endTimeDate = add(endTimeDate, { days: 1 })
    }
  }
  if (
    isAfterOrEqual(endTimeDate, midnightActivity) &&
    isBeforeOrEqual(endTimeDate, sunriseActivity)
  ) {
    endTimeDate = add(endTimeDate, { days: 1 })
  }
  return { startTimeDate, endTimeDate, startTimePlus30Date, activityDate }
}

export const activitySchema = yup.object({
  name: yup.string().required(),
  imageFile: yup
    .mixed()
    .nullable()
    .test({
      message: "image URL should be of type PNG",
      test: (file) => {
        if (!file) {
          return true
        }
        const ext = file.name.split(".")[1]
        const isValid = ["png"].includes(ext)
        return isValid
      },
    })
    .test({
      message: `File too big, can't exceed 3MB`,
      test: (file) => {
        if (!file) {
          return true
        }
        const sizeLimit = 3
        const totalSizeInMB = file.size / 1000000
        const isValid = totalSizeInMB <= sizeLimit
        return isValid
      },
    }),
  date: yup
    .date()
    .test({
      message: "invalid date",
      test: (date) => {
        const activityDate = format(date, "dd/MM/yyyy")
        const tommrowFormat = format(new Date(), "dd/MM/yyyy")

        return isAfter(
          parse(activityDate, "dd/MM/yyyy", new Date()),
          parse(tommrowFormat, "dd/MM/yyyy", new Date())
        )
      },
    })
    .required(),
  startTime: yup
    .string()
    .test({
      message: "invalid start time format is HH:mm",
      test: (startTime) => {
        const startTimeDate = parse(startTime, "HH:mm", new Date())
        return isValid(startTimeDate)
      },
    })
    .required(),
  endTime: yup
    .string()
    .required()
    .test({
      message: "invalid end time format is HH:mm ",
      test: (endTime) => {
        const endTimeDate = parse(endTime, "HH:mm", new Date())
        return isValid(endTimeDate)
      },
    })
    .when(["startTime", "date"], ([startTime, date], schema) => {
      return schema
        .test({
          test: (endTime) => {
            const { startTimeDate, endTimeDate } = getTime(
              date,
              startTime,
              endTime
            )
            const t = Math.abs(differenceInHours(startTimeDate, endTimeDate))
            if (t >= 8) {
              return false
            }
            return true
          },
          message: "total of activity is 8 hours at most",
        })
        .test({
          test: (endTime) => {
            const { startTimeDate, endTimeDate } = getTime(
              date,
              startTime,
              endTime
            )
            const t = Math.abs(differenceInMinutes(endTimeDate, startTimeDate))
            if (t < 30) {
              return false
            }
            return true
          },
          message: "minimum of activity is 30 minutes at least",
        })
        .test({
          test: (endTime) => {
            const { startTimeDate, endTimeDate } = getTime(
              date,
              startTime,
              endTime
            )
            return isAfterOrEqual(endTimeDate, startTimeDate)
          },
          message: "end Time should be > start time",
        })
    }),
  location: yup.string().required(),
  maxOfParticipants: yup.number().min(0).required(),
})
