import React from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Logo />
            <p className="text-sm text-muted-foreground mt-3">
This platform is dedicated to providing free, quality educational resources to all O/L students in Sri Lanka. We believe every student deserves equal access to learning materials regardless of their location or economic background.            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-muted-foreground hover:text-primary transition-colors">
                  Resources
                </Link>
              </li>
               <li>
                <Link to="/donate" className="text-muted-foreground hover:text-primary transition-colors">
                  Donate
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Subjects</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Mathematics
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Science
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Sinhala
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  All Subjects
                </a>
              </li>
            </ul>
          </div>
          

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/40 pt-8">
          <div className="flex flex-col justify-between items-center text-sm text-muted-foreground">
            <p>&copy; {currentYear} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; OL-Poddo &nbsp;&nbsp;&nbsp;| &nbsp;&nbsp;&nbsp;All rights reserved.</p>
            <p>Powered by Knowingz</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
