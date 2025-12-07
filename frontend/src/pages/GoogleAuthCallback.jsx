import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/auth.api'
import { Card } from '../components/common/Card'

export default function GoogleAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, setError: setAuthError } = useAuth()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const callbackExecuted = useRef(false)

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent callback from running twice (React Strict Mode)
      if (callbackExecuted.current) return
      callbackExecuted.current = true

      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        
        // Check for OAuth errors
        const errorParam = searchParams.get('error')
        if (errorParam) {
          const errorDescription = searchParams.get('error_description') || errorParam
          setError(`Google OAuth error: ${errorDescription}`)
          setLoading(false)
          return
        }

        if (!code) {
          setError('No authorization code received from Google')
          setLoading(false)
          return
        }

        // Send code to backend
        const response = await authAPI.googleCallback(code)

        if (response.user && response.access_token) {
          // Store tokens and user info in localStorage
          localStorage.setItem('accessToken', response.access_token)
          localStorage.setItem('refreshToken', response.refresh_token)
          localStorage.setItem('user', JSON.stringify(response.user))
          
          // Redirect to home page
          // A small delay to ensure localStorage is synced
          setTimeout(() => {
            window.location.href = '/'
          }, 100)
        } else {
          setError('Failed to get authentication tokens from server')
        }
      } catch (err) {
        console.error('Google callback error:', err)
        console.error('Error details:', {
          status: err?.response?.status,
          data: err?.response?.data,
          message: err?.message,
        })
        setError(
          err?.response?.data?.detail || 
          err?.message ||
          'Failed to complete Google login. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8 text-center">
          {loading ? (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Completing Sign In
              </h2>
              <p className="text-muted-foreground">
                Please wait while we authenticate your Google account...
              </p>
            </>
          ) : error ? (
            <>
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Authentication Failed
              </h2>
              <p className="text-red-600 dark:text-red-400 mb-6">
                {error}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
              >
                Back to Login
              </button>
            </>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
