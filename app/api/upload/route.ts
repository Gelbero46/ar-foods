import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { auth } from '@clerk/nextjs/server'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: Request) {
  try {
     const { userId } = await auth()
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    
    const { fileName, fileType } = await req.json()
    console.log("fileName", fileName, "fileType",  fileType)
    if (!fileName || !fileType) {
      console.log("file error------")
      return NextResponse.json(
        { error: 'fileName and fileType are required' },
        { status: 400 }
      )
    }

    const allowedTypes = [
      'model/gltf-binary',      // .glb
      'model/vnd.usdz+zip',     // .usdz
      'image/jpeg',             // .jpg thumbnail
      'image/png',              // .png thumbnail
      'image/webp',             // .webp thumbnail
    ]

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      )
    }

    const key = `uploads/${Date.now()}-${fileName.replace(/\s+/g, '-')}`

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    })

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 })

    const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    return NextResponse.json({ signedUrl, publicUrl })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}