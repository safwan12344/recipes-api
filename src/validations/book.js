import * as yup from "yup"

export const bookSchema = yup.object({
  name: yup.string().required(),
  orderLink: yup.string().required(),
  imageFile: yup
    .mixed()
    .nullable()
    .required()
    .test({
      message: "image URL is required",
      test: (file) => {
        if (!file) {
          return false
        }
        return true
      },
    })
    .test({
      message: "image URL should be of type PNG",
      test: (file) => {
        if (!file) {
          return false
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
          return false
        }
        const sizeLimit = 3
        const totalSizeInMB = file.size / 1000000
        const isValid = totalSizeInMB <= sizeLimit
        return isValid
      },
    }),
})

export const updateBookSchema = yup.object({
  name: yup.string().required(),
  orderLink: yup.string().required(),
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
})
