import express from "express"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import cors from "cors"
import fileUpload from "express-fileupload"

dotenv.config()

// routes
import userRoutes from "./routes/users"
import authRoutes from "./routes/auth"
import categoryRoutes from "./routes/category"
import recipesRoutes from "./routes/recipes"
import mongoose from "./utils/mongoose"
import booksRoute from "./routes/books"

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

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  let statusCode = err.code || 500
  if (err.code === 11000) {
    statusCode = 400
  }

  res.status(statusCode).json({ ...err, message: err.message })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
