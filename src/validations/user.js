import * as yup from "yup"

const userSchema = yup
  .object({
    firstName: yup
      .string()
      .matches(/^[a-zA-Z]*$/, {
        message: "You must enter only English letters",
      })
      .required()
      .trim(),
    lastName: yup
      .string()
      .matches(/^[a-zA-Z]*$/, {
        message: "You must enter only English letters",
      })
      .required()
      .trim(),
    email: yup.string().email().required().trim().lowercase(),
    username: yup
      .string()
      .min(5, "Must be at least 5 in length")
      .required()
      .trim()
      .lowercase(),
    password: yup
      .string()
      .required("Required")
      .min(8, "Must be 8 characters or more")
      .matches(/[a-z]+/, "One lowercase character")
      .matches(/[A-Z]+/, "One uppercase character")
      .matches(/[@$!%*#?&]+/, "One special character")
      .matches(/\d+/, "One number"),
    role: yup
      .string()
      .required()
      .matches(/(user|business)/, "you must choose user or business"),
  })
  .required()

export default userSchema
