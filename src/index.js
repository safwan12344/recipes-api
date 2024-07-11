import express from "express"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import cors from "cors"
import fileUpload from "express-fileupload"
//בשביל לטעון את הקובץ env
dotenv.config()

// routes
import userRoutes from "./routes/users"
import authRoutes from "./routes/auth"
import categoryRoutes from "./routes/category"
import recipesRoutes from "./routes/recipes"
import mongoose from "./utils/mongoose"
import booksRoute from "./routes/books"
import activityRoutes from "./routes/activities"
//coniction to DB
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("DB Connected!"))

const app = express()
const port = process.env.PORT

// enable cors
app.use(cors())

//allow to upload files to server
app.use(fileUpload())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())

app.use("/users", userRoutes)
app.use("/auth", authRoutes)
app.use("/categories", categoryRoutes)
app.use("/recipes", recipesRoutes)
app.use("/books", booksRoute)
app.use("/activities", activityRoutes)

// eslint-disable-next-line no-unused-vars
//נועד לטפל בשגיאות בשרת
app.use((err, req, res, next) => {
  let statusCode = err.code || 500
  if (err.code === 11000) {
    statusCode = 400
  }
  if (err.errors && (err.errors["value"] || err.errors["params"])) {
    delete err.errors["value"]
    delete err.errors["params"]
  }

  let message = err.message
  if (err.errors && Object.keys(err.errors).length) {
    message = err.errors.message
  }
  res.status(statusCode).json({
    ...err,
    message: message,
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
