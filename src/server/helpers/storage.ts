import { serverEnv } from '@/env.server'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

let storageClient: null | S3Client = null

function getStorageClient() {
  if (storageClient) {
    return storageClient
  }

  storageClient = new S3Client({
    endpoint: `https://${serverEnv.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: serverEnv.R2_ACCESS_KEY_ID,
      secretAccessKey: serverEnv.R2_SECRET_ACCESS_KEY,
    },
  })

  return storageClient
}

function getExtension(file: File) {
  const extensionFromName = file.name.split('.').pop()

  if (extensionFromName && extensionFromName !== file.name) {
    return extensionFromName.toLowerCase()
  }

  if (file.type === 'image/png') {
    return 'png'
  }

  if (file.type === 'image/webp') {
    return 'webp'
  }

  if (file.type === 'image/gif') {
    return 'gif'
  }

  return 'jpg'
}

async function uploadFile(file: File, keyPrefix: string, userId: string) {
  const extension = getExtension(file)
  const key = `${keyPrefix}/${userId}/${crypto.randomUUID()}.${extension}`
  const body = Buffer.from(await file.arrayBuffer())

  try {
    await getStorageClient().send(
      new PutObjectCommand({
        Bucket: serverEnv.R2_BUCKET,
        Key: key,
        Body: body,
        ContentType: file.type || 'application/octet-stream',
      })
    )
  } catch (error) {
    console.error('R2 upload failed', {
      error,
      bucket: serverEnv.R2_BUCKET,
      contentType: file.type || 'application/octet-stream',
      fileName: file.name,
      fileSize: file.size,
      key,
      keyPrefix,
      publicUrl: serverEnv.R2_PUBLIC_URL,
      userId,
    })
    throw new Error('Failed to upload file to R2.')
  }

  return `${serverEnv.R2_PUBLIC_URL}/${key}`
}

export async function uploadAvatar(file: File, userId: string) {
  return uploadFile(file, 'avatars', userId)
}
