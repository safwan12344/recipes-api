import mongoose from "mongoose"
import dotenv from "dotenv"
import Unit from "./models/unit"
import Ingredient from "./models/ingredient"

dotenv.config()

const loadToData = async () => {
  await Unit.create({ name: "קילו" })
  await Unit.create({ name: "גרם" })
  await Unit.create({ name: "כפית" })
  await Unit.create({ name: "כף" })
  await Unit.create({ name: "חצי כפית" })
  await Unit.create({ name: "חופן" })

  await Ingredient.create({ name: "פסטה" })
  await Ingredient.create({ name: "בצל" })
  await Ingredient.create({ name: "ביצים" })
  await Ingredient.create({ name: "פפריקה" })
}

mongoose.connect(process.env.DATABASE_URL).then(() => {
  console.log("DB Connected!")
  loadToData()
})
