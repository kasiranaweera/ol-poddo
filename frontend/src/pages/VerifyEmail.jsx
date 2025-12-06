import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/auth.api'

export function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token')
        console.log('🔍 Token from URL:', token)

        if (!token) {
          console.log('❌ No token found')
          setError('Verification token not found. Please check your email link.')
          setIsLoading(false)
          return
        }

        // Call the verify-email endpoint
        console.log('📤 Calling verify-email endpoint with token:', token)
        const response = await authAPI.verifyEmail(token)
        console.log('✅ Verification response:', response)

        if (response && response.access_token && response.refresh_token) {
          console.log('✨ Token received, storing in localStorage')
          // Store tokens and user info
          localStorage.setItem('accessToken', response.access_token)
          localStorage.setItem('refreshToken', response.refresh_token)
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user))
          }

          setSuccess(true)
          setIsLoading(false)

          // Redirect to home after 2 seconds
          setTimeout(() => {
            console.log('🔄 Redirecting to home...')
            // Reload page to reinitialize AuthContext with new tokens
            window.location.href = '/'
          }, 2000)
        } else {
          console.log('⚠️ Incomplete response:', response)
          setError('Verification response incomplete. Please try again.')
          setIsLoading(false)
        }
      } catch (err) {
        console.error('❌ Verification error:', err)
        const errorMessage = err.response?.data?.detail || err.message || 'Email verification failed. Please try again or register again.'
        console.error('Error message:', errorMessage)
        setError(errorMessage)
        setIsLoading(false)
      }
    }

    verifyEmail()
  }, [searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          {isLoading ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verifying Email</h1>
              <p className="text-slate-600 dark:text-slate-400">Please wait while we verify your email address...</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-4">Check browser console for details...</p>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Email Verified!</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-4">Your email has been successfully verified. You're now logged in.</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">Redirecting you to the home page...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verification Failed</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
              <button
                onClick={() => navigate('/register')}
                className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to Register
              </button>
            </div>
          ) : (
            <div className="text-center text-slate-600 dark:text-slate-400">
              <p>No state set - this should not happen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
