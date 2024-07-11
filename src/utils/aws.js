import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"

const IMAGE_URL_AWS = "https://safwan-recipes.s3.eu-central-1.amazonaws.com"

export const getAWSClient = () => {
  const s3Config = {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_ACCESS_SECRET,
    },
    region: "eu-central-1",
  }

  return new S3Client(s3Config)
}
//העלאת תמונה לאמזון הפרמטרים שצריך לקבל זה אובייקט הבקשה , שם השדה של התמונה , המפתח שאיפה אנחנו רוצים לשמור את התמונה
export const uploadFile = async (req, fieldName, key) => {
  const file = req.files[fieldName]

  const bucketParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: file.data,
    Region: "eu-central-1",
  }

  const s3Client = getAWSClient()

  await s3Client.send(
    new PutObjectCommand({
      ...bucketParams,
      ContentType: file.mimetype,
    })
  )
  const imageURL = `${IMAGE_URL_AWS}/${bucketParams.Key}`
  return imageURL
}

export const deleteFile = async (imageURL) => {
  const input = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: imageURL.replace(IMAGE_URL_AWS + "/", ""),
  }
  const s3Client = getAWSClient()

  await s3Client.send(new DeleteObjectCommand(input))
}
