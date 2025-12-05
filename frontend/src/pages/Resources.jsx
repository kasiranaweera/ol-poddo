import React from 'react'
import { NavigationMenu } from '../components/common/NavigationMenu'

const subjects = [
  { id: 'sinh', name: 'Sinhala', slug: 'sinhala', resources: {
    pastPapers: [
      { label: 'Sinhala Past Paper 2024', href: '#' },
      { label: 'Sinhala Past Paper 2023', href: '#' }
    ],
    textbooks: [
      { label: 'Sinhala Textbook Grade 11', href: '#' }
    ],
    notes: [
      { label: 'Sinhala Revision Notes - Essay', href: '#' }
    ]
  }},
  { id: 'eng', name: 'English', slug: 'english', resources: {
    pastPapers: [
      { label: 'English Past Paper 2024', href: '#' }
    ],
    textbooks: [
      { label: 'English Textbook', href: '#' }
    ],
    notes: [
      { label: 'English Revision Notes', href: '#' }
    ]
  }},
  { id: 'math', name: 'Mathematics', slug: 'math', resources: {
    pastPapers: [
      { label: 'Math Past Paper 2024', href: '#' }
    ],
    textbooks: [
      { label: 'Mathematics Textbook', href: '#' }
    ],
    notes: [
      { label: 'Math Formula Sheet', href: '#' }
    ]
  }},
]

const resourceTypes = [
  { key: 'pastPapers', title: 'Past Papers', description: 'Official past papers with marking schemes.', examples: [{ label: 'Sample past paper', href: '#' }] },
  { key: 'textbooks', title: 'Textbooks', description: 'Curated textbooks and references.', examples: [{ label: 'Sample textbook', href: '#' }] },
  { key: 'notes', title: 'Revision Notes', description: 'Exam-focused revision notes and guides.', examples: [{ label: 'Sample notes', href: '#' }] },
]

export const Resources = () => {
  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Resources</h1>
        <NavigationMenu subjects={subjects} resourceTypes={resourceTypes} />
      </div>
    </div>
  )
}

export default Resources
