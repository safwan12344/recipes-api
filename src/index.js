import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import fileUpload from "express-fileupload"

dotenv.config()

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("DB Connected!"))

// routes
import userRoutes from "./routes/users"
import authRoutes from "./routes/auth"
import categoryRoutes from "./routes/category"
import recipesRoutes from "./routes/recipes"

const app = express()
const port = process.env.PORT

// enable cors
app.use(cors())

//allow to upload files to server
app.use(fileUpload())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use("/users", userRoutes)
app.use("/auth", authRoutes)
app.use("/categories", categoryRoutes)
app.use("/recipes", recipesRoutes)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
