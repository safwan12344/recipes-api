import express from "express"
import {
  createActivity,
  getActivity,
  getAllActivities,
  getMonthlyActivities,
  getWeeklyActivities,
  toggleParticipent,
} from "../controllers/activities"
import { authenticate } from "../middlerwares/auth"
import { isBusiness } from "../middlerwares/is-business"
import validate from "../middlerwares/validate"
import { activitySchema } from "../validations/activity"
import { objectId } from "../middlerwares/object-id"

const router = express.Router()

router.post(
  "/",
  authenticate,
  isBusiness,
  validate(activitySchema),
  createActivity
)

router.get("/", getAllActivities)
router.get("/weekly", getWeeklyActivities)
router.get("/monthly", getMonthlyActivities)

router.get("/:id", objectId(["id"]), getActivity)
router.get(
  "/:id/toggle-participent",
  authenticate,
  objectId(["id"]),
  toggleParticipent
)

export default router
