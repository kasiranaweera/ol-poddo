import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'

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

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('email')
  const { loading, error, clearError, forgotPassword, resetPassword } = useAuth()
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [emailForm, setEmailForm] = useState({ email: '' })
  const [resetForm, setResetForm] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleEmailChange = (e) => {
    const { name, value } = e.target
    setEmailForm((prev) => ({ ...prev, [name]: value }))
    setFormError('')
    clearError()
  }

  const handleResetChange = (e) => {
    const { name, value } = e.target
    setResetForm((prev) => ({ ...prev, [name]: value }))
    setFormError('')
    clearError()
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSuccess('')

    if (!emailForm.email.trim()) {
      setFormError('Email is required')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.email)) {
      setFormError('Please enter a valid email address')
      return
    }

    const result = await forgotPassword(emailForm.email)
    if (result.success) {
      setSuccess(result.message || 'If an account exists with this email, you will receive password reset instructions')
      setResetForm((prev) => ({ ...prev, email: emailForm.email }))
      setTimeout(() => {
        setStep('reset')
        setSuccess('')
      }, 2000)
    } else {
      setFormError(result.error)
    }
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!resetForm.newPassword) {
      setFormError('New password is required')
      return
    }

    if (resetForm.newPassword.length < 8) {
      setFormError('Password must be at least 8 characters')
      return
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setFormError('Passwords do not match')
      return
    }

    const result = await resetPassword(resetForm.email, resetForm.newPassword)
    if (result.success) {
      setSuccess(result.message || 'Password reset successfully! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } else {
      setFormError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-500 bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-muted-foreground">
              {step === 'email' ? 'Enter your email to receive reset instructions' : 'Enter your new password'}
            </p>
          </div>

          {(formError || error) && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{formError || error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-lg flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={emailForm.email}
                onChange={handleEmailChange}
                placeholder="your@email.com"
                disabled={loading}
                required
              />
              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Instructions'
                )}
              </Button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={resetForm.email}
                disabled
              />
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                value={resetForm.newPassword}
                onChange={handleResetChange}
                placeholder="Enter new password (min 8 chars)"
                disabled={loading}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={resetForm.confirmPassword}
                onChange={handleResetChange}
                placeholder="Confirm password"
                disabled={loading}
                required
              />
              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          )}

          <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Link
              to="/login"
              className="flex items-center gap-1 text-muted-foreground font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
