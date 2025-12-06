import React, { useState, useEffect } from 'react'
import { Button } from '../components/common/Button'
import { gradeAPI, paperAPI, textbookAPI, studyNoteAPI } from '../services/document.api'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export const Donate = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('papers') // papers, textbooks, notes
  const [grades, setGrades] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // New grade/subject creation states
  const [showCreateGrade, setShowCreateGrade] = useState(false)
  const [showCreateSubject, setShowCreateSubject] = useState(false)
  const [newGradeData, setNewGradeData] = useState({ name: '', level: '' })
  const [newSubjectData, setNewSubjectData] = useState({ name: '', code: '' })

  // Form states
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [file, setFile] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    paperType: 'past_paper',
    examYear: new Date().getFullYear(),
    part: '',
    lesson: '',
    isPublic: false,
  })

  // Load grades on mount
  useEffect(() => {
    loadGrades()
  }, [])

  // Load subjects when grade changes
  useEffect(() => {
    if (selectedGrade) {
      loadSubjects(selectedGrade)
    } else {
      setSubjects([])
    }
  }, [selectedGrade])

  const loadGrades = async () => {
    try {
      const response = await gradeAPI.getAll()
      // Response is directly an array, not wrapped in { data: [...] }
      const gradesData = Array.isArray(response) ? response : response.data || []
      setGrades(gradesData)
      console.log('Grades loaded:', gradesData)
    } catch (err) {
      setError('Failed to load grades')
      console.error(err)
    }
  }

  const loadSubjects = async (gradeId) => {
    try {
      const response = await gradeAPI.getSubjects(gradeId)
      // Response is directly an array, not wrapped in { data: [...] }
      const subjectsData = Array.isArray(response) ? response : response.data || []
      setSubjects(subjectsData)
      console.log('Subjects loaded:', subjectsData)
    } catch (err) {
      setError('Failed to load subjects')
      console.error(err)
    }
  }

  const handleCreateGrade = async (e) => {
    e.preventDefault()
    if (!newGradeData.name.trim() || !newGradeData.level) {
      setError('Please fill in all grade fields')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await gradeAPI.create({
        name: newGradeData.name,
        level: parseInt(newGradeData.level),
        description: null,
      })
      setSuccess(`Grade '${newGradeData.name}' created successfully!`)
      setNewGradeData({ name: '', level: '' })
      setShowCreateGrade(false)
      await loadGrades()
    } catch (err) {
      const errorMsg = err.message || err.response?.data?.detail || 'Failed to create grade'
      setError(errorMsg)
      console.error('Grade creation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubject = async (e) => {
    e.preventDefault()
    if (!selectedGrade) {
      setError('Please select a grade first')
      return
    }
    if (!newSubjectData.name.trim()) {
      setError('Please enter a subject name')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await gradeAPI.createSubject({
        grade_id: parseInt(selectedGrade),
        name: newSubjectData.name,
        code: newSubjectData.code || null,
        description: null,
      })
      setSuccess(`Subject '${newSubjectData.name}' created successfully!`)
      setNewSubjectData({ name: '', code: '' })
      setShowCreateSubject(false)
      await loadSubjects(selectedGrade)
    } catch (err) {
      const errorMsg = err.message || err.response?.data?.detail || 'Failed to create subject'
      setError(errorMsg)
      console.error('Subject creation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleUploadPaper = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const data = new FormData()
      data.append('file', file)
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('grade_id', selectedGrade)
      data.append('subject_id', selectedSubject)
      data.append('paper_type', formData.paperType)
      data.append('exam_year', formData.examYear)
      data.append('is_public', formData.isPublic)

      const response = await paperAPI.upload(data)
      setSuccess('Paper uploaded successfully!')
      resetForm()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload paper')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadTextbook = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const data = new FormData()
      data.append('file', file)
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('grade_id', selectedGrade)
      data.append('subject_id', selectedSubject)
      data.append('part', formData.part)
      data.append('is_public', formData.isPublic)

      const response = await textbookAPI.upload(data)
      setSuccess('Textbook uploaded successfully!')
      resetForm()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload textbook')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadNotes = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const data = new FormData()
      data.append('file', file)
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('grade_id', selectedGrade)
      data.append('subject_id', selectedSubject)
      data.append('lesson', formData.lesson)
      data.append('is_public', formData.isPublic)

      const response = await studyNoteAPI.upload(data)
      setSuccess('Study notes uploaded successfully!')
      resetForm()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload study notes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    if (!selectedGrade) {
      setError('Please select a grade')
      return false
    }
    if (!selectedSubject) {
      setError('Please select a subject')
      return false
    }
    if (!file) {
      setError('Please select a file')
      return false
    }
    if (!formData.title.trim()) {
      setError('Please enter a title')
      return false
    }
    return true
  }

  const resetForm = () => {
    setFile(null)
    setFormData({
      title: '',
      description: '',
      paperType: 'past_paper',
      examYear: new Date().getFullYear(),
      part: '',
      lesson: '',
      isPublic: false,
    })
    setSelectedGrade('')
    setSelectedSubject('')
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Donate <span className="text-amber-600 dark:text-amber-500">Learning Materials</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Help other students by sharing your study materials, papers, and notes
          </p>
        </div>

        {/* Login Required Message */}
        {!user && (
          <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
            <p className="text-blue-900 dark:text-blue-100 mb-4">
              You need to be logged in to donate learning materials.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/login">
                <Button>Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline">Create Account</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
            ✓ {success}
          </div>
        )}

        {/* Tab Navigation and Upload Form - Only show if logged in */}
        {user && (
          <>
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8 border-b border-border">
              {[
                { id: 'papers', label: 'Papers', icon: '📄' },
                { id: 'textbooks', label: 'Textbooks', icon: '📚' },
                { id: 'notes', label: 'Study Notes', icon: '📝' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-amber-600 text-amber-600 dark:text-amber-500'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Upload Form */}
        <div className="bg-card border border-border rounded-lg p-8">
          <form onSubmit={
            activeTab === 'papers' ? handleUploadPaper :
            activeTab === 'textbooks' ? handleUploadTextbook :
            handleUploadNotes
          } className="space-y-6">

            {/* Grade and Subject Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Grade Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Grade *</label>
                  <button
                    type="button"
                    onClick={() => setShowCreateGrade(!showCreateGrade)}
                    className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
                  >
                    {showCreateGrade ? '✕ Cancel' : '+ New Grade'}
                  </button>
                </div>

                {showCreateGrade ? (
                  <form onSubmit={handleCreateGrade} className="space-y-2">
                    <input
                      type="text"
                      placeholder="Grade name (e.g., Grade 12)"
                      value={newGradeData.name}
                      onChange={(e) => setNewGradeData({ ...newGradeData, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Level (e.g., 12)"
                      value={newGradeData.level}
                      onChange={(e) => setNewGradeData({ ...newGradeData, level: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                      min="1"
                      max="100"
                      required
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-3 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-50"
                    >
                      Create Grade
                    </button>
                  </form>
                ) : (
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="">Select a grade</option>
                    {grades.map(grade => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Subject Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Subject *</label>
                  {selectedGrade && (
                    <button
                      type="button"
                      onClick={() => setShowCreateSubject(!showCreateSubject)}
                      className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
                    >
                      {showCreateSubject ? '✕ Cancel' : '+ New Subject'}
                    </button>
                  )}
                </div>

                {showCreateSubject ? (
                  <form onSubmit={handleCreateSubject} className="space-y-2">
                    <input
                      type="text"
                      placeholder="Subject name (e.g., Physics)"
                      value={newSubjectData.name}
                      onChange={(e) => setNewSubjectData({ ...newSubjectData, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Subject code (optional, e.g., PHY)"
                      value={newSubjectData.code}
                      onChange={(e) => setNewSubjectData({ ...newSubjectData, code: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-3 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-50"
                    >
                      Create Subject
                    </button>
                  </form>
                ) : (
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    disabled={!selectedGrade}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select a subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder={
                  activeTab === 'papers' ? 'e.g., O-Level Mathematics 2024' :
                  activeTab === 'textbooks' ? 'e.g., Advanced Mathematics Textbook' :
                  'e.g., Calculus Chapter 5 - Derivatives'
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Add details about this material..."
                rows="4"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Paper Type / Part / Lesson */}
            {activeTab === 'papers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Paper Type</label>
                  <select
                    name="paperType"
                    value={formData.paperType}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="past_paper">Past Paper</option>
                    <option value="provisional_paper">Provisional Paper</option>
                    <option value="school_paper">School Paper</option>
                    <option value="model_paper">Model Paper</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Exam Year</label>
                  <input
                    type="number"
                    name="examYear"
                    value={formData.examYear}
                    onChange={handleFormChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'textbooks' && (
              <div>
                <label className="block text-sm font-medium mb-2">Part (optional)</label>
                <input
                  type="text"
                  name="part"
                  value={formData.part}
                  onChange={handleFormChange}
                  placeholder="e.g., Part 1, Part 2, Volume A"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                <label className="block text-sm font-medium mb-2">Lesson/Chapter (optional)</label>
                <input
                  type="text"
                  name="lesson"
                  value={formData.lesson}
                  onChange={handleFormChange}
                  placeholder="e.g., Chapter 5, Lesson 3, Topic: Photosynthesis"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Upload File (PDF, DOC, DOCX) *</label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('fileInput').click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  required
                />
                {file ? (
                  <div>
                    <p className="text-lg font-medium text-amber-600">📎 {file.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium">📁 Click or drag file here</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Supported formats: PDF, DOC, DOCX, TXT (Max 50MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Public/Private Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleFormChange}
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="isPublic" className="text-sm font-medium cursor-pointer">
                Make this material public (visible to all students)
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                {loading ? 'Uploading...' : `Upload ${
                  activeTab === 'papers' ? 'Paper' :
                  activeTab === 'textbooks' ? 'Textbook' :
                  'Study Notes'
                }`}
              </Button>
            </div>
          </form>

          {/* Guidelines */}
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold mb-4">📋 Guidelines for Uploading</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>✓ Ensure your material is accurate and well-organized</li>
              <li>✓ Include clear titles and descriptions</li>
              <li>✓ Check copyright before uploading published materials</li>
              <li>✓ Poor quality or misleading materials may be removed</li>
              <li>✓ Your name will be credited as the contributor</li>
              <li>✓ Help your fellow students learn better!</li>
            </ul>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Donate
