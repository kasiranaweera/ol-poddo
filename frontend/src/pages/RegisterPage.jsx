import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import Logo from '../components/Logo'

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

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading, error, clearError } = useAuth()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  })
  const [validationError, setValidationError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setValidationError('')
    clearError()

    if (name === 'password') {
      calculatePasswordStrength(value)
    }
  }

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    setPasswordStrength(strength)
  }

  const validateForm = () => {
    const { username, email, fullName, password, confirmPassword } = formData

    if (!username.trim()) {
      setValidationError('Username is required')
      return false
    }
    if (username.length < 3) {
      setValidationError('Username must be at least 3 characters')
      return false
    }

    if (!email.trim()) {
      setValidationError('Email is required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Please enter a valid email address')
      return false
    }

    if (!fullName.trim()) {
      setValidationError('Full name is required')
      return false
    }

    if (!password) {
      setValidationError('Password is required')
      return false
    }
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters')
      return false
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (!validateForm()) return

    const result = await register(
      formData.username,
      formData.email,
      formData.password,
      formData.fullName
    )

    if (result.success) {
      alert('Please check your email to verify your account. You can log in after verification.')
      navigate('/login')
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-slate-300'
    if (passwordStrength === 1) return 'bg-red-500'
    if (passwordStrength === 2) return 'bg-yellow-500'
    if (passwordStrength === 3) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return ''
    if (passwordStrength === 1) return 'Weak'
    if (passwordStrength === 2) return 'Fair'
    if (passwordStrength === 3) return 'Good'
    return 'Strong'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-90 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="p-8">
          <div className="text-center mb-8 flex flex-col items-center gap-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-500 bg-clip-text text-transparent">
              Sign Up
            </h1>
            <p className="text-muted-foreground">
              Join OL-Poddo today
            </p>
          </div>

          {(error || validationError) && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">
                {error || validationError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              disabled={loading}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              disabled={loading}
              required
            />

            <Input
              label="Full Name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              disabled={loading}
              required
            />

            <div>
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                disabled={loading}
                required
              />
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrengthColor()} transition-all`}
                        style={{
                          width: `${(passwordStrength / 4) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 min-w-12">
                      {getPasswordStrengthLabel()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Use uppercase, lowercase, numbers, and symbols
                  </p>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              disabled={loading}
              required
            />

            {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-lg flex gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  Passwords match
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-amber-500 font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
