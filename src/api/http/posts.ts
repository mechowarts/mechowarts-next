import { apiRequest } from '@/api/http/client'
import type { Post } from '@/types'

export async function listPosts() {
  return apiRequest<Post[]>('/api/posts')
}

export async function getPostById(postId: string) {
  return apiRequest<null | Post>(`/api/posts/${postId}`)
}

export async function createPostDocument(data: {
  caption: string
  imageUrl?: string
  location?: string
}) {
  return apiRequest<Post>('/api/posts', {
    method: 'POST',
    json: data,
  })
}

export async function updatePostDocument(
  postId: string,
  data: { caption: string; imageUrl?: string; location?: string }
) {
  return apiRequest<null | Post>(`/api/posts/${postId}`, {
    method: 'PATCH',
    json: data,
  })
}
