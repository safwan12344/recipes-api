export const createError = (code, message, data = null) => {
  const error = new Error(message)
  error.code = code
  error.errors = data
  return error
}
