import React, { createContext, useContext, useState, useEffect } from 'react'
import authAPI from '../services/auth.api'
import { userAPI } from '../services/user.api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(true)

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authAPI.isAuthenticated()) {
          const response = await authAPI.getCurrentUser()
          setUser(response)
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        // Clear tokens on failure
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      } finally {
        setIsVerifying(false)
      }
    }

    checkAuth()
  }, [])

  const clearError = () => {
    setError('')
  }

  // Register new user
  const register = async (username, email, password, fullName) => {
    try {
      setLoading(true)
      setError('')

      const response = await authAPI.register(username, email, password, fullName)

      return {
        success: true,
        message: response.message || 'Registration successful. Please verify your email.',
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  // Verify email
  const verifyEmail = async (token) => {
    try {
      setLoading(true)
      setError('')

      const response = await authAPI.verifyEmail(token)
      
      // Auto login user after verification
      if (response.access_token && response.user) {
        setUser(response.user)
      }

      return {
        success: true,
        message: response.message || 'Email verified successfully!',
      }
    } catch (err) {
      const errorMessage = err.message || 'Email verification failed'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  // Login user
  const login = async (usernameOrEmail, password) => {
    try {
      setLoading(true)
      setError('')

      const response = await authAPI.login(usernameOrEmail, password)
      setUser(response.user)

      return {
        success: true,
        user: response.user,
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  // Logout user
  const logout = async () => {
    try {
      setLoading(true)
      await authAPI.logout()
    } catch (err) {
      console.warn('Logout error:', err)
    } finally {
      setUser(null)
      setError('')
      setLoading(false)
    }
  }

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setLoading(true)
      setError('')

      const response = await authAPI.forgotPassword(email)

      return {
        success: true,
        message: response.message || 'Password reset email sent',
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to send password reset email'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  // Reset password
  const resetPassword = async (email, newPassword) => {
    try {
      setLoading(true)
      setError('')

      const response = await authAPI.resetPassword(email, newPassword)

      return {
        success: true,
        message: response.message || 'Password reset successfully',
      }
    } catch (err) {
      const errorMessage = err.message || 'Password reset failed'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  // Update profile
  const updateProfile = async (email, fullName) => {
    try {
      setLoading(true)
      setError('')

      const response = await userAPI.updateProfile(email, fullName)
      setUser(response)

      return {
        success: true,
        user: response,
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true)
      setError('')

      const response = await userAPI.changePassword(currentPassword, newPassword)

      return {
        success: true,
        message: response.message || 'Password changed successfully',
      }
    } catch (err) {
      const errorMessage = err.message || 'Password change failed'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  // Deactivate account
  const deactivateAccount = async () => {
    try {
      setLoading(true)
      setError('')

      await userAPI.deactivateAccount()
      setUser(null)

      return {
        success: true,
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to deactivate account'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  // Delete account
  const deleteAccount = async () => {
    try {
      setLoading(true)
      setError('')

      await userAPI.deleteAccount()
      setUser(null)

      return {
        success: true,
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete account'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    isVerifying,
    clearError,
    register,
    verifyEmail,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    deactivateAccount,
    deleteAccount,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
