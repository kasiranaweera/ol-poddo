import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { Button } from './common/Button'
import { cn } from '../utils/cn'
import Logo from './Logo'

export const Header = () => {
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const { language, toggleLanguage } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="font-medium transition-colors hover:text-primary"
          >
            {language === 'si' ? <span className='' style={{ fontFamily: '"Noto Serif Sinhala", serif', fontWeight: 600,  }}>මුල් පිටුව</span> : 'Home'}
          </Link>
          <Link
            to="/about"
            className="font-medium transition-colors hover:text-primary"
          >
            {language === 'si' ? <span className='' style={{ fontFamily: '"Noto Serif Sinhala", serif', fontWeight: 600,  }}>අපි ගැන</span> : 'About'}
          </Link>
          <Link
            to="/demo"
            className="font-medium transition-colors hover:text-primary"
          >
            {language === 'si' ? <span className='' style={{ fontFamily: '"Noto Serif Sinhala", serif', fontWeight: 600,  }}>ඩෙමෝ</span> : 'Demo'}
          </Link>
        </nav>

        {/* Right Section: Theme, Auth, etc */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="rounded-full"
            aria-label="Toggle language"
          >
            <span className="text-sm font-semibold">
              {language === 'en' ? 'SI' : 'EN'}
            </span>
          </Button>

          {/* Auth Section */}
          {!user ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="hidden sm:inline-flex"
              >
                Login
              </Button>              
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-border"
                />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/demo"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Demo
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
