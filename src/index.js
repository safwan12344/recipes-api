import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("DB Connected!"))

// routes
import userRoutes from "./routes/users"

const app = express()
const port = process.env.PORT

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use("/users", userRoutes)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
