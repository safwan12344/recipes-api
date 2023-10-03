import * as yup from "yup"

const recipeSchema = yup.object({
  name: yup
    .string()
    .required()
    .matches(/^[a-zA-Z\s\W]+$/, {
      message:
        "The name should contain either letters and special characters together or only letters",
    })
    .trim(),
  description: yup.string().required(),
  category: yup.string().required(),
  time: yup.number().required(),
  preparation: yup.string().required(),
  orderLink: yup.string().required(),
  file: yup
    .mixed()
    .test({
      message: "filed file is missing",
      test: (file) => {
        return !!file
      },
    })
    .test({
      message: "image URL should be of type image",
      test: (file) => {
        if (!file) {
          return false
        }
        const ext = file.name.split(".")[1]
        const isValid = ["png", "jpg", "jpeg"].includes(ext)
        return isValid
      },
    })
    .test({
      message: `File too big, can't exceed 1MB`,
      test: (file) => {
        if (!file) {
          return false
        }
        const sizeLimit = 1
        const totalSizeInMB = file.size / 1000000
        const isValid = totalSizeInMB <= sizeLimit
        return isValid
      },
    }),
  ingredients: yup
    .mixed()
    .test({
      message: "Ingredients is required",
      test: (arr) => {
        return arr.length > 0
      },
    })
    .test({
      message: "Ingredients array object should be name, unit, and ,amount",
      test: (arr) => {
        return arr.every(
          (item) => "name" in item && "unit" in item && "amount" in item
        )
      },
    })
    .transform((value) => {
      return JSON.parse(value)
    }),
})
export default recipeSchema
