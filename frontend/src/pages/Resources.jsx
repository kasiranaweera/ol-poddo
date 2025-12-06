import React, { useState, useEffect } from 'react'
import { Button } from '../components/common/Button'
import { gradeAPI, paperAPI, textbookAPI, studyNoteAPI } from '../services/document.api'

export const Resources = () => {
  const [activeTab, setActiveTab] = useState('papers')
  const [activeView, setActiveView] = useState('list') // list or filter
  const [grades, setGrades] = useState([])
  const [subjects, setSubjects] = useState([])
  const [papers, setPapers] = useState([])
  const [textbooks, setTextbooks] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Filter states
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedPaperType, setSelectedPaperType] = useState('')

  // Load grades on mount
  useEffect(() => {
    loadGrades()
  }, [])

  // Load data when tab or filters change
  useEffect(() => {
    if (activeTab === 'papers') {
      loadPapers()
    } else if (activeTab === 'textbooks') {
      loadTextbooks()
    } else {
      loadNotes()
    }
  }, [activeTab, selectedGrade, selectedSubject, selectedPaperType])

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
      setGrades(response.data || [])
    } catch (err) {
      setError('Failed to load grades')
      console.error(err)
    }
  }

  const loadSubjects = async (gradeId) => {
    try {
      const response = await gradeAPI.getSubjects(gradeId)
      setSubjects(response.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const loadPapers = async () => {
    setLoading(true)
    try {
      const response = await paperAPI.getAll(
        selectedGrade || null,
        selectedSubject || null,
        selectedPaperType || null
      )
      setPapers(response.data || [])
    } catch (err) {
      setError('Failed to load papers')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadTextbooks = async () => {
    setLoading(true)
    try {
      const response = await textbookAPI.getAll(
        selectedGrade || null,
        selectedSubject || null
      )
      setTextbooks(response.data || [])
    } catch (err) {
      setError('Failed to load textbooks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadNotes = async () => {
    setLoading(true)
    try {
      const response = await studyNoteAPI.getAll(
        selectedGrade || null,
        selectedSubject || null
      )
      setNotes(response.data || [])
    } catch (err) {
      setError('Failed to load notes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSelectedGrade('')
    setSelectedSubject('')
    setSelectedPaperType('')
  }

  const openGoogleDriveLink = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const paperTypes = [
    { value: 'past_paper', label: '📜 Past Papers' },
    { value: 'provisional_paper', label: '📋 Provisional Papers' },
    { value: 'school_paper', label: '🏫 School Papers' },
    { value: 'model_paper', label: '⭐ Model Papers' },
    { value: 'other', label: '📄 Other' },
  ]

  const DocumentCard = ({ item, type }) => (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground line-clamp-2">{item.title}</h3>
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{item.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {type === 'paper' && item.paper_type && (
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-xs font-medium">
              {paperTypes.find(pt => pt.value === item.paper_type)?.label}
            </span>
          )}
          {item.exam_year && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
              {item.exam_year}
            </span>
          )}
          {item.part && (
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium">
              {item.part}
            </span>
          )}
          {item.lesson && (
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
              {item.lesson}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            {new Date(item.created_at).toLocaleDateString()}
          </div>
          <Button
            onClick={() => openGoogleDriveLink(item.google_drive_url)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-sm"
          >
            📖 View
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Learning <span className="text-amber-600 dark:text-amber-500">Resources</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Access curated study materials for your grade and subjects
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-border overflow-x-auto">
          {[
            { id: 'papers', label: 'Papers', icon: '📄', count: papers.length },
            { id: 'textbooks', label: 'Textbooks', icon: '📚', count: textbooks.length },
            { id: 'notes', label: 'Study Notes', icon: '📝', count: notes.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-amber-600 text-amber-600 dark:text-amber-500'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon} {tab.label} <span className="text-xs ml-2">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Filter and View Toggle */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setActiveView(activeView === 'list' ? 'filter' : 'list')}
            variant={activeView === 'filter' ? 'default' : 'outline'}
            className={activeView === 'filter' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}
          >
            🔍 {activeView === 'list' ? 'Show' : 'Hide'} Filters
          </Button>
          {(selectedGrade || selectedSubject || selectedPaperType) && (
            <Button onClick={clearFilters} variant="outline">
              ✕ Clear Filters
            </Button>
          )}
        </div>

        {/* Filters */}
        {activeView === 'filter' && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Grade Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Grade</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All Grades</option>
                  {grades.map(grade => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={!selectedGrade}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Paper Type Filter */}
              {activeTab === 'papers' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Paper Type</label>
                  <select
                    value={selectedPaperType}
                    onChange={(e) => setSelectedPaperType(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">All Types</option>
                    {paperTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading resources...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && ((activeTab === 'papers' && papers.length === 0) ||
          (activeTab === 'textbooks' && textbooks.length === 0) ||
          (activeTab === 'notes' && notes.length === 0)) && (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-lg font-medium mb-2">No resources found</p>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back later for new materials
            </p>
          </div>
        )}

        {/* Document Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'papers' && papers.map(paper => (
              <DocumentCard key={paper.id} item={paper} type="paper" />
            ))}
            {activeTab === 'textbooks' && textbooks.map(textbook => (
              <DocumentCard key={textbook.id} item={textbook} type="textbook" />
            ))}
            {activeTab === 'notes' && notes.map(note => (
              <DocumentCard key={note.id} item={note} type="note" />
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-3 text-amber-900 dark:text-amber-100">
            Want to contribute?
          </h3>
          <p className="text-amber-800 dark:text-amber-200 mb-6">
            Share your study materials and help other students succeed
          </p>
          <Button
            onClick={() => window.location.href = '/donate'}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            📤 Upload Your Materials
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Resources
