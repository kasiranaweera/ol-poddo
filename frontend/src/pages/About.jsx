import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'

export const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              About{' '}
              <span className="text-amber-600 dark:text-amber-500">
                OL-Poddo
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              A modern full-stack web application demonstrating best practices in frontend development.
            </p>
          </div>

          {/* Project Overview */}
          <section className="border border-border rounded-lg p-8 bg-card">
            <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                OL-Poddo is a modern full-stack web application demonstrating best practices in frontend development.
              </p>
              <p>
                This project showcases the integration of Vite, React, Tailwind CSS, and React Router with a beautiful, 
                responsive theme system that supports both light and dark modes. Light mode is the primary experience with zinc-based text colors.
              </p>
            </div>
          </section>

          {/* Tech Stack */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="border border-border rounded-lg p-8 bg-card">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🎯</span> Technologies
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  Vite 5.2.0
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  React 18.3.1
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  React Router 6.24.0
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  Tailwind CSS 3.4.1
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  Shadcn/UI Components
                </li>
              </ul>
            </section>

            <section className="border border-border rounded-lg p-8 bg-card">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🎨</span> Design System
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-primary mb-1">Light Mode (Primary)</p>
                  <p className="text-sm text-muted-foreground">White background with amber accents and zinc typography</p>
                </div>
                <div>
                  <p className="font-semibold text-primary mb-1">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Zinc-900 background with amber accents and light text</p>
                </div>
                <div className="pt-2">
                  <p className="font-semibold text-primary mb-1">Gradients</p>
                  <p className="text-sm text-muted-foreground">Amber 400-500 and 500-600 for vibrant accents</p>
                </div>
              </div>
            </section>
          </div>

          {/* CTA */}
          <div className="flex gap-4 pt-8">
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/demo">View Demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
