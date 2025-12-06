import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import Logo from '../components/Logo'

// Input component replacement
const Input = ({ label, error, ...props }) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>
    )}
    <input
      className={`
        w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600
        bg-white dark:bg-slate-800 text-slate-900 dark:text-white
        placeholder-slate-400 dark:placeholder-slate-500
        focus:outline-none focus:ring-2 focus:ring-amber-500
        focus:border-transparent transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error ? 'border-red-500' : ''}
      `}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
)

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading, error, clearError } = useAuth()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [validationError, setValidationError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setValidationError('')
    clearError()
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      setValidationError('Username or email is required')
      return false
    }
    if (!formData.password) {
      setValidationError('Password is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (!validateForm()) return

    const result = await login(formData.username, formData.password)

    if (result.success) {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-90 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8 flex flex-col items-center gap-1">

            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-500 bg-clip-text text-transparent">
              Sign In
            </h1>
            <p className="text-muted-foreground">
              Sign in to your account
            </p>
          </div>

          {/* Error Messages */}
          {(error || validationError) && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">
                {error || validationError}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username or Email"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username or email"
              disabled={loading}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={loading}
              required
            />

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-muted-foreground text-blue-500"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Register Link */}
          <p className="text-center text-muted-foreground mt-8">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-amber-500 font-medium"
            >
              Register here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
