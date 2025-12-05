import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-8xl font-bold text-amber-600 dark:text-amber-500">
          404
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">
            Oops! The page you're looking for doesn't exist. Let's get you back on track.
          </p>
        </div>
        <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-white">
          <Link to="/">Go Back Home</Link>
        </Button>
      </div>
    </div>
  )
}
