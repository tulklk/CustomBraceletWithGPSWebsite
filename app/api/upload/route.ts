import { NextRequest, NextResponse } from "next/server"

/**
 * API Route for uploading images to Cloudinary
 * Uses fetch API directly with unsigned upload preset (no SDK needed)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const uploadPreset = formData.get("upload_preset") as string

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      )
    }

    // Get Cloudinary cloud name
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
    
    if (!cloudName) {
      return NextResponse.json(
        { error: "Cloudinary cloud name not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local" },
        { status: 500 }
      )
    }

    // Get upload preset
    const uploadPresetName = uploadPreset || process.env.CLOUDINARY_UPLOAD_PRESET || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    
    if (!uploadPresetName) {
      return NextResponse.json(
        { error: "Cloudinary upload preset not configured. Please set CLOUDINARY_UPLOAD_PRESET in .env.local" },
        { status: 500 }
      )
    }

    // Convert file to base64 data URI for Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const dataURI = `data:${file.type};base64,${base64}`

    // Create form data for Cloudinary upload
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append("file", dataURI)
    cloudinaryFormData.append("upload_preset", uploadPresetName)

    // Upload to Cloudinary using fetch API
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
    
    const cloudinaryResponse = await fetch(uploadUrl, {
      method: "POST",
      body: cloudinaryFormData,
    })

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || "Cloudinary upload failed" }
      }
      
      console.error("Cloudinary error:", errorData)
      return NextResponse.json(
        { error: errorData.message || `Failed to upload to Cloudinary: ${cloudinaryResponse.status}` },
        { status: cloudinaryResponse.status >= 400 && cloudinaryResponse.status < 500 ? cloudinaryResponse.status : 500 }
      )
    }

    const result = await cloudinaryResponse.json()

    return NextResponse.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

