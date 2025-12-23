/**
 * Cloudinary upload utility
 * Uploads images to Cloudinary and returns the secure URL
 */

export interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
  width: number
  height: number
  format: string
  resource_type: string
}

/**
 * Upload image to Cloudinary via Next.js API route
 */
export async function uploadImageToCloudinary(
  file: File
): Promise<CloudinaryUploadResponse> {
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size must be less than 5MB")
  }

  // Check file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image")
  }

  // Create form data
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "")

  // Upload to Next.js API route
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Upload failed" }))
    throw new Error(error.message || "Failed to upload image")
  }

  const data = await response.json()
  return data
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  files: File[]
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImageToCloudinary(file))
  const results = await Promise.all(uploadPromises)
  return results.map((result) => result.secure_url)
}

