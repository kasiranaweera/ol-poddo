/**
 * User API Service
 * Handles user profile management, password changes, and account operations
 */
import { privateClient } from './common/clients'

export const userAPI = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    try {
      const response = await privateClient.get('/users/profile')
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get user profile by username
   */
  getProfileByUsername: async (username) => {
    try {
      const response = await privateClient.get(`/users/profile/${username}`)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (email, fullName) => {
    try {
      const response = await privateClient.put('/users/profile', {
        email,
        full_name: fullName,
      })
      // Update stored user data
      if (response) {
        localStorage.setItem('user', JSON.stringify(response))
      }
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await privateClient.post('/users/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Deactivate account
   */
  deactivateAccount: async () => {
    try {
      const response = await privateClient.post('/users/deactivate', {})
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Delete account
   */
  deleteAccount: async () => {
    try {
      const response = await privateClient.delete('/users')
      return response
    } catch (error) {
      throw error
    }
  },
}

export default userAPI
