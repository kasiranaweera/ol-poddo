import React from 'react'
import { Button } from '../components/common/Button'

export const Demo = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-16">
          <h1 className="text-5xl md:text-6xl font-bold">
            Component{' '}
            <span className="text-amber-600 dark:text-amber-500">
              Showcase
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore shadcn-styled components with solid amber colors
          </p>
        </div>

        {/* Buttons Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Button Variants</h2>
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Button Sizes</h3>
            <div className="flex flex-wrap gap-3">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">🎨</Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Solid Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                Amber 500
              </Button>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                Amber 600
              </Button>
            </div>
          </div>
        </section>

        {/* Color Showcase */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Solid Amber Palette</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-500 rounded-lg p-12 text-white flex items-center justify-center h-48 font-semibold">
                Amber 500
              </div>
              <div className="bg-amber-600 rounded-lg p-12 text-white flex items-center justify-center h-48 font-semibold">
                Amber 600
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Text Colors</h3>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-500">
                Professional Solid Text
              </p>
              <p className="text-muted-foreground">
                Using solid amber colors instead of gradients for clean design
              </p>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Card Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-border rounded-lg p-6 bg-card hover:shadow-lg transition-shadow"
              >
                <div className="w-10 h-10 bg-amber-500 rounded-lg mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Card {i}</h3>
                <p className="text-muted-foreground mb-4">
                  This is a responsive card component using shadcn styling.
                </p>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Amber Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { name: '400', color: '#fbbf24' },
              { name: '500', color: '#f59e0b' },
              { name: '600', color: '#d97706' },
              { name: '700', color: '#b45309' },
              { name: '800', color: '#92400e' },
            ].map((shade) => (
              <div
                key={shade.name}
                className="rounded-lg overflow-hidden border border-border"
              >
                <div
                  className="h-24 w-full"
                  style={{ backgroundColor: shade.color }}
                ></div>
                <div className="p-3 bg-card">
                  <p className="text-sm font-semibold">Amber {shade.name}</p>
                  <p className="text-xs text-muted-foreground">{shade.color}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Typography</h2>
          <div className="space-y-4 border border-border rounded-lg p-8 bg-card">
            <h1 className="text-4xl font-bold">Heading 1</h1>
            <h2 className="text-3xl font-bold">Heading 2</h2>
            <h3 className="text-2xl font-bold">Heading 3</h3>
            <p className="text-base">Regular paragraph text with standard font size.</p>
            <p className="text-sm text-muted-foreground">Muted text for secondary information.</p>
          </div>
        </section>

        {/* Light Mode Note */}
        <section className="border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10 rounded-lg p-6">
          <p className="text-center text-sm text-amber-900 dark:text-amber-100">
            💡 Light mode is the primary experience. All components are optimized for light mode first with beautiful dark mode support.
          </p>
        </section>
      </div>
    </div>
  )
}
