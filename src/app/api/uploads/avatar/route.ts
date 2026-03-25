import { ApiError, fail, ok } from '@/server/http'
import { requireSession } from '@/server/session'
import { uploadAvatar } from '@/server/storage'

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    const formData = await request.formData()
    const file = formData.get('file')

    if (typeof File === 'undefined' || !(file instanceof File)) {
      throw new ApiError(400, 'A file upload is required.')
    }

    if (!file.type.startsWith('image/')) {
      throw new ApiError(400, 'Please upload an image file.')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new ApiError(400, 'Avatar image must be 5 MB or smaller.')
    }

    const url = await uploadAvatar(file, session.user.id)

    return ok({ url })
  } catch (error) {
    return fail(error)
  }
}
