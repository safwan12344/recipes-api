import nodemailer from "nodemailer"

export const sendEmail = (mailOptions) => {
  return new Promise((resolve) => {
    try {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD,
        },
      })

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error("Error sending email: ", error)
          resolve(false)
        } else {
          resolve(true)
        }
      })
    } catch (error) {
      console.error("Error sending email: ", error)
      resolve(false)
    }
  })
}
