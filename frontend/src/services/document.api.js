/**
 * Document/Resource API Service
 * Handles Papers, Textbooks, and Study Notes with Google Drive integration
 */
import { privateClient, publicClient } from './common/clients'

// Grade and Subject endpoints
export const gradeAPI = {
  /**
   * Get all grades
   */
  getAll: async () => {
    try {
      const response = await publicClient.get('/grades')
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get subjects for a specific grade
   */
  getSubjects: async (gradeId) => {
    try {
      const response = await publicClient.get(`/grades/${gradeId}/subjects`)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Create a new grade
   */
  create: async (gradeData) => {
    try {
      const response = await publicClient.post('/grades', gradeData)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Create a new subject for a grade
   */
  createSubject: async (subjectData) => {
    try {
      const response = await publicClient.post('/subjects', subjectData)
      return response
    } catch (error) {
      throw error
    }
  },
}

// Paper endpoints
export const paperAPI = {
  /**
   * Upload a new paper
   */
  upload: async (formData) => {
    try {
      const response = await privateClient.post('/papers/upload', formData)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get all papers with optional filtering
   */
  getAll: async (gradeId = null, subjectId = null, paperType = null, skip = 0, limit = 20) => {
    try {
      const params = new URLSearchParams()
      if (gradeId) params.append('grade_id', gradeId)
      if (subjectId) params.append('subject_id', subjectId)
      if (paperType) params.append('paper_type', paperType)
      params.append('skip', skip)
      params.append('limit', limit)

      const endpoint = `/papers?${params.toString()}`
      const response = await publicClient.get(endpoint)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get single paper by ID
   */
  getById: async (id) => {
    try {
      const response = await publicClient.get(`/papers/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Delete paper
   */
  delete: async (id) => {
    try {
      const response = await privateClient.delete(`/papers/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get user's papers (uploaded by current user)
   */
  getUserPapers: async (skip = 0, limit = 20) => {
    try {
      const params = new URLSearchParams()
      params.append('skip', skip)
      params.append('limit', limit)

      const endpoint = `/papers/my?${params.toString()}`
      const response = await privateClient.get(endpoint)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get paper types
   */
  getTypes: () => {
    return [
      { value: 'past_paper', label: 'Past Paper' },
      { value: 'provisional_paper', label: 'Provisional Paper' },
      { value: 'school_paper', label: 'School Paper' },
      { value: 'model_paper', label: 'Model Paper' },
      { value: 'other', label: 'Other' },
    ]
  },
}

// Textbook endpoints
export const textbookAPI = {
  /**
   * Upload a new textbook
   */
  upload: async (formData) => {
    try {
      const response = await privateClient.post('/textbooks/upload', formData)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get all textbooks with optional filtering
   */
  getAll: async (gradeId = null, subjectId = null, skip = 0, limit = 20) => {
    try {
      const params = new URLSearchParams()
      if (gradeId) params.append('grade_id', gradeId)
      if (subjectId) params.append('subject_id', subjectId)
      params.append('skip', skip)
      params.append('limit', limit)

      const endpoint = `/textbooks?${params.toString()}`
      const response = await publicClient.get(endpoint)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get single textbook by ID
   */
  getById: async (id) => {
    try {
      const response = await publicClient.get(`/textbooks/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Delete textbook
   */
  delete: async (id) => {
    try {
      const response = await privateClient.delete(`/textbooks/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get user's textbooks (uploaded by current user)
   */
  getUserTextbooks: async (skip = 0, limit = 20) => {
    try {
      const params = new URLSearchParams()
      params.append('skip', skip)
      params.append('limit', limit)

      const endpoint = `/textbooks/my?${params.toString()}`
      const response = await privateClient.get(endpoint)
      return response
    } catch (error) {
      throw error
    }
  },
}

// Study Notes endpoints
export const studyNoteAPI = {
  /**
   * Upload new study notes
   */
  upload: async (formData) => {
    try {
      const response = await privateClient.post('/study-notes/upload', formData)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get all study notes with optional filtering
   */
  getAll: async (gradeId = null, subjectId = null, skip = 0, limit = 20) => {
    try {
      const params = new URLSearchParams()
      if (gradeId) params.append('grade_id', gradeId)
      if (subjectId) params.append('subject_id', subjectId)
      params.append('skip', skip)
      params.append('limit', limit)

      const endpoint = `/study-notes?${params.toString()}`
      const response = await publicClient.get(endpoint)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get single study note by ID
   */
  getById: async (id) => {
    try {
      const response = await publicClient.get(`/study-notes/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Delete study notes
   */
  delete: async (id) => {
    try {
      const response = await privateClient.delete(`/study-notes/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get user's study notes (uploaded by current user)
   */
  getUserStudyNotes: async (skip = 0, limit = 20) => {
    try {
      const params = new URLSearchParams()
      params.append('skip', skip)
      params.append('limit', limit)

      const endpoint = `/study-notes/my?${params.toString()}`
      const response = await privateClient.get(endpoint)
      return response
    } catch (error) {
      throw error
    }
  },
}

export default { gradeAPI, paperAPI, textbookAPI, studyNoteAPI }
