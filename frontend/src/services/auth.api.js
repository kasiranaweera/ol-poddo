/**
 * Authentication API Service
 * Handles user registration, login, verification, and password reset
 */
import { publicClient, privateClient } from './common/clients'

export const authAPI = {
  /**
   * Register new user
   */
  register: async (username, email, password, fullName) => {
    try {
      const response = await publicClient.post('/auth/register', {
        username,
        email,
        password,
        full_name: fullName,
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token) => {
    try {
      const response = await publicClient.post(`/auth/verify-email?token=${token}`, {})
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Login user with username or email
   */
  login: async (usernameOrEmail, password) => {
    try {
      const response = await publicClient.post('/auth/login', {
        username_or_email: usernameOrEmail,
        password,
      })
      
      // Store tokens and user data
      if (response.access_token && response.refresh_token) {
        privateClient.setTokens(response.access_token, response.refresh_token)
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user))
        }
      }
      
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    try {
      const refreshToken = privateClient.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await publicClient.post('/auth/refresh', {
        refresh_token: refreshToken,
      })

      // Update tokens
      if (response.access_token && response.refresh_token) {
        privateClient.setTokens(response.access_token, response.refresh_token)
      }

      return response
    } catch (error) {
      // Clear auth data on refresh failure
      privateClient.clearTokens()
      throw error
    }
  },

  /**
   * Get current logged-in user
   */
  getCurrentUser: async () => {
    try {
      const response = await privateClient.get('/auth/me')
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (email) => {
    try {
      const response = await publicClient.post('/auth/forgot-password', {
        email,
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (email, newPassword) => {
    try {
      const response = await publicClient.post('/auth/reset-password', {
        email,
        new_password: newPassword,
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await privateClient.post('/auth/logout', {})
    } catch (error) {
      console.warn('Logout API call failed:', error)
    } finally {
      // Always clear tokens locally
      privateClient.clearTokens()
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return privateClient.isAuthenticated()
  },
}

export default authAPI
