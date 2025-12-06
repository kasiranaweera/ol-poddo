/**
 * Document/Resource API Service
 * Handles study resources, documents, and learning materials
 */
import { privateClient, publicClient } from './common/clients'

export const documentAPI = {
  /**
   * Create new resource/document
   */
  create: async (title, content, category, tags = []) => {
    try {
      const response = await privateClient.post('/resources', {
        title,
        content,
        category,
        tags,
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get all resources with optional filtering
   */
  getAll: async (category = null, skip = 0, limit = 20) => {
    try {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      params.append('skip', skip)
      params.append('limit', limit)

      const endpoint = `/resources?${params.toString()}`
      const response = await publicClient.get(endpoint)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get single resource by ID
   */
  getById: async (id) => {
    try {
      const response = await publicClient.get(`/resources/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Like a resource
   */
  like: async (id) => {
    try {
      const response = await privateClient.post(`/resources/${id}/like`, {})
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Unlike a resource
   */
  unlike: async (id) => {
    try {
      const response = await privateClient.delete(`/resources/${id}/like`)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Add comment to resource
   */
  addComment: async (id, content) => {
    try {
      const response = await privateClient.post(`/resources/${id}/comment`, {
        content,
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Delete resource
   */
  delete: async (id) => {
    try {
      const response = await privateClient.delete(`/resources/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get categories
   */
  getCategories: async () => {
    try {
      const response = await publicClient.get('/resources/categories')
      return response
    } catch (error) {
      throw error
    }
  },
}

export default documentAPI
