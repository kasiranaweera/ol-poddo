import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Button } from '../components/common/Button'

export const Home = () => {
  const { isDark } = useTheme()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold">
              Your Complete O/L <br /> Success Platform
             
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              A modern web application built with Vite, React, Tailwind CSS, and React Router with theme mode support.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white">
                Get Started
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Features</h2>
            <p className="text-muted-foreground">Everything you need to build amazing web applications</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 px-4">
        <div className="container mx-auto px-4">
          <div className="bg-card border border-border rounded-lg p-12 text-center space-y-4">
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of developers building amazing applications with our platform.
            </p>
            <div className="pt-4">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white">
                Explore Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    id: 1,
    icon: '⚡',
    title: 'Fast & Modern',
    description: 'Built with Vite for lightning-fast development and optimized production builds.'
  },
  {
    id: 2,
    icon: '🎨',
    title: 'Beautiful UI',
    description: 'Stunning components with shadcn/ui and Tailwind CSS for amazing designs.'
  },
  {
    id: 3,
    icon: '🛣️',
    title: 'Smart Routing',
    description: 'Powered by React Router for seamless navigation and dynamic routing.'
  },
  {
    id: 4,
    icon: '🌓',
    title: 'Theme Support',
    description: 'Light and dark modes with beautiful amber gradients and zinc colors.'
  },
  {
    id: 5,
    icon: '👤',
    title: 'User Auth',
    description: 'Built-in authentication with user profiles and avatars.'
  },
  {
    id: 6,
    icon: '📱',
    title: 'Responsive',
    description: 'Mobile-first design that looks great on all devices.'
  },
]
