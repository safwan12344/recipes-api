import express from "express"
import {
  createActivity,
  deleteActivity,
  editActivity,
  getActivity,
  getAllActivities,
  getBusinessActivities,
  getMonthlyActivities,
  getWeeklyActivities,
  toggleParticipent,
} from "../controllers/activities"
import { authenticate } from "../middlerwares/auth"
import { isBusiness } from "../middlerwares/is-business"
import validate from "../middlerwares/validate"
import { activitySchema, updateActivitySchema } from "../validations/activity"
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
router.get("/my", authenticate, isBusiness, getBusinessActivities)

router.get("/:id", objectId(["id"]), getActivity)
router.put(
  "/:id",
  authenticate,
  isBusiness,
  objectId(["id"]),
  validate(updateActivitySchema),
  editActivity
)
router.get(
  "/:id/toggle-participent",
  authenticate,
  objectId(["id"]),
  toggleParticipent
)

router.delete(
  "/:id",
  authenticate,
  isBusiness,
  objectId(["id"]),
  deleteActivity
)

export default router
