import { v2 as cloudinary } from 'cloudinary'

interface CloudinaryResponse {
  url: string
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
})

export function createImageUrl(
  path: string,
): Promise<CloudinaryResponse> | null {
  const res: Promise<CloudinaryResponse> | null = cloudinary.uploader
    .upload(path, {
      resource_type: 'image',
    })
    .then((result) => result)
    .catch((error) => error)

  return res
}
