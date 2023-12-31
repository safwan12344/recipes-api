import Book from "../models/book"
import { deleteFile, uploadFile } from "../utils/aws"
import { createError } from "../utils/create-error"

export const createBook = async (req, res, next) => {
  //check bussiness user
  if (req.user.role !== "business") {
    return next(createError(403, "you not alowed to access this feature"))
  }
  try {
    //build the request data to save in db
    const data = {
      name: req.body.name,
      user: req.user._id,
      orderLink: req.body.orderLink,
    }
    const book = new Book(data)

    //upload image o aws
    const file = req.files.imageFile

    const key = `${req.user.username}/books/${book._id}/${file.name}`

    const imageURL = await uploadFile(req, "imageFile", key)
    book.imageURL = imageURL

    //use model Book to save in db
    const newBook = await book.save()
    //return response
    res.status(201).json(newBook)
  } catch (error) {
    next(
      createError(500, "server could not procees the request please try later")
    )
  }
}

export const updateBook = async (req, res, next) => {
  //check bussiness user
  if (req.user.role !== "business") {
    return next(createError(403, "you not alowed to access this feature"))
  }
  try {
    const book = await Book.findOne({ user: req.user._id, _id: req.params.id })
    //build the request data to save in db
    if (!book) {
      return next(createError(404, "book is not exist"))
    }

    book.name = req.body.name || book.name
    book.orderLink = req.body.orderLink || book.orderLink

    //upload image o aws
    if (req.files?.imageFile) {
      const file = req.files.imageFile
      const key = `${req.user.username}/books/${book._id}/${file.name}`
      const imageURL = await uploadFile(req, "imageFile", key)
      const oldImageURL = book.imageURL
      await deleteFile(oldImageURL)
      book.imageURL = imageURL
    }

    //use model Book to save in db
    const newBook = await book.save()
    //return response
    res.status(201).json(newBook)
  } catch (error) {
    next(
      createError(500, "server could not procees the request please try later")
    )
  }
}

export const getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find({})
    res.status(200).json(books)
  } catch (error) {
    next(
      createError(500, "server could not procees the request please try later")
    )
  }
}

export const getAllUserBooks = async (req, res, next) => {
  try {
    if (req.user.role !== "business") {
      return next(createError(403, "you not alowed to access this feature"))
    }
    const books = await Book.find({ user: req.user._id })
    res.status(200).json(books)
  } catch (error) {
    next(
      createError(500, "server could not procees the request please try later")
    )
  }
}

export const getUserBook = async (req, res, next) => {
  try {
    if (req.user.role !== "business") {
      return next(createError(403, "you not alowed to access this feature"))
    }

    const book = await Book.findOne({ user: req.user._id, _id: req.params.id })
    res.status(200).json(book)
  } catch (error) {
    next(
      createError(500, "server could not procees the request please try later")
    )
  }
}

export const deleteBook = async (req, res, next) => {
  try {
    if (req.user.role !== "business") {
      return next(createError(403, "you not alowed to access this feature"))
    }
    const book = await Book.findById(req.params.id)
    if (String(req.user._id) !== String(book.user)) {
      return next(
        createError(403, "you can't delete books that dosent belong to you")
      )
    }
    const imageURL = book.imageURL
    await book.deleteOne()
    await deleteFile(imageURL)
    res.status(200).json({ message: "book deleted successefully" })
  } catch (error) {
    next(
      createError(500, "server could not procees the request please try later")
    )
  }
}
