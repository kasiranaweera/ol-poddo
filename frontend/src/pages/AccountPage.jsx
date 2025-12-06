import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, CheckCircle, LogOut, Trash2 } from 'lucide-react'
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
        focus:outline-none focus:ring-2 focus:ring-indigo-500
        focus:border-transparent transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error ? 'border-red-500' : ''}
      `}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
)

export default function AccountPage() {
  const navigate = useNavigate()
  const {
    user,
    loading,
    error,
    clearError,
    logout,
    updateProfile,
    changePassword,
    deactivateAccount,
    deleteAccount,
  } = useAuth()

  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    email: user?.email || '',
    fullName: user?.full_name || '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    clearError()
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
    clearError()
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setMessage('')

    const result = await updateProfile(formData.email, formData.fullName)
    if (result.success) {
      setMessage('Profile updated successfully')
      setMessageType('success')
    } else {
      setMessage(result.error)
      setMessageType('error')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setMessage('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Passwords do not match')
      setMessageType('error')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage('New password must be at least 8 characters')
      setMessageType('error')
      return
    }

    const result = await changePassword(
      passwordData.currentPassword,
      passwordData.newPassword
    )

    if (result.success) {
      setMessage('Password changed successfully')
      setMessageType('success')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } else {
      setMessage(result.error)
      setMessageType('error')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleDeactivate = async () => {
    const result = await deactivateAccount()
    if (result.success) {
      navigate('/login')
    }
  }

  const handleDelete = async () => {
    const result = await deleteAccount()
    if (result.success) {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Account Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your profile and security settings
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => {
              setActiveTab('profile')
              setMessage('')
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => {
              setActiveTab('password')
              setMessage('')
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'password'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => {
              setActiveTab('danger')
              setMessage('')
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'danger'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Danger Zone
          </button>
        </div>

        {activeTab === 'profile' && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Profile Information
              </h2>

              {message && messageType === 'success' && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-lg flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {message}
                  </p>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Username
                  </p>
                  <p className="text-lg font-medium text-slate-900 dark:text-white">
                    {user?.username}
                  </p>
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  disabled={loading}
                  required
                />

                <Input
                  label="Full Name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleProfileChange}
                  disabled={loading}
                  required
                />

                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </form>
            </div>
          </Card>
        )}

        {activeTab === 'password' && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Change Password
              </h2>

              {message && messageType === 'success' && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-lg flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {message}
                  </p>
                </div>
              )}

              {message && messageType === 'error' && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {message}
                  </p>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  required
                />

                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </form>
            </div>
          </Card>
        )}

        {activeTab === 'danger' && (
          <div className="space-y-4">
            <Card className="border-orange-200 dark:border-orange-900/50">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Log Out
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Sign out from your current session
                </p>
                <Button
                  onClick={handleLogout}
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </Card>

            <Card className="border-red-200 dark:border-red-900/50">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Deactivate Account
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Temporarily deactivate your account. You can reactivate it later.
                </p>
                <Button
                  onClick={handleDeactivate}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Deactivate Account
                </Button>
              </div>
            </Card>

            <Card className="border-red-300 dark:border-red-900">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                  Delete Account
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>

                {showDeleteConfirm ? (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg mb-4">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-4">
                      Are you sure? This will permanently delete your account and cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Yes, Delete My Account'
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={loading}
                        className="bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white hover:bg-slate-400 dark:hover:bg-slate-500"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
