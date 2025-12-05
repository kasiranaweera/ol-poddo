import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import * as HoverCard from "@radix-ui/react-hover-card";
import { NavigationMenu } from "./common/NavigationMenu";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "./common/Button";
import { cn } from "../utils/cn";
import Logo from "./Logo";

export const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openNavMenu, setOpenNavMenu] = useState(true);

  const handleLogout = () => {
    logout();
  };

  const subjects = [
    {
      id: "sinh",
      name: "Sinhala",
      slug: "sinhala",
      resources: {
        pastPapers: [
          { label: "Sinhala Past Paper 2024", href: "#" },
          { label: "Sinhala Past Paper 2023", href: "#" },
        ],
        textbooks: [{ label: "Sinhala Textbook Grade 11", href: "#" }],
        notes: [{ label: "Sinhala Revision Notes - Essay", href: "#" }],
      },
    },
    {
      id: "eng",
      name: "English",
      slug: "english",
      resources: {
        pastPapers: [{ label: "English Past Paper 2024", href: "#" }],
        textbooks: [{ label: "English Textbook", href: "#" }],
        notes: [{ label: "English Revision Notes", href: "#" }],
      },
    },
    {
      id: "math",
      name: "Mathematics",
      slug: "math",
      resources: {
        pastPapers: [{ label: "Math Past Paper 2024", href: "#" }],
        textbooks: [{ label: "Mathematics Textbook", href: "#" }],
        notes: [{ label: "Math Formula Sheet", href: "#" }],
      },
    },
  ];

  const resourceTypes = [
    {
      key: "pastPapers",
      title: "Past Papers",
      description: "Official past papers with marking schemes.",
      examples: [{ label: "Sample past paper", href: "#" }],
    },
    {
      key: "textbooks",
      title: "Textbooks",
      description: "Curated textbooks and references.",
      examples: [{ label: "Sample textbook", href: "#" }],
    },
    {
      key: "notes",
      title: "Revision Notes",
      description: "Exam-focused revision notes and guides.",
      examples: [{ label: "Sample notes", href: "#" }],
    },
  ];

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
            {language === "si" ? (
              <span
                className=""
                style={{
                  fontFamily: '"Noto Serif Sinhala", serif',
                  fontWeight: 600,
                }}
              >
                මුල් පිටුව
              </span>
            ) : (
              "Home"
            )}
          </Link>
          <Link
            to="/about"
            className="font-medium transition-colors hover:text-primary"
          >
            {language === "si" ? (
              <span
                className=""
                style={{
                  fontFamily: '"Noto Serif Sinhala", serif',
                  fontWeight: 600,
                }}
              >
                අපි ගැන
              </span>
            ) : (
              "About"
            )}
          </Link>

          {/* Resources with hover card (desktop only) */}
          <HoverCard.Root>
            <HoverCard.Trigger asChild>
              <Link
                to="/resources"
                className="font-medium transition-colors hover:text-primary"
              >
                {language === "si" ? (
                  <span
                    className=""
                    style={{
                      fontFamily: '"Noto Serif Sinhala", serif',
                      fontWeight: 600,
                    }}
                  >
                    සම්පත්
                  </span>
                ) : (
                  "Resources"
                )}
              </Link>
            </HoverCard.Trigger>

            <HoverCard.Portal>
              <HoverCard.Content
                sideOffset={8}
                align="center"
                className="z-50 p-4 rounded-lg shadow-lg bg-card border border-border"
              >
                <NavigationMenu
                  subjects={[
                    {
                      id: "math",
                      name: "Mathematics",
                      slug: "math",
                      resources: {
                        pastPapers: [
                          { label: "Math Past Paper 2024", href: "#" },
                        ],
                        textbooks: [{ label: "Math Textbook", href: "#" }],
                        notes: [{ label: "Math Notes", href: "#" }],
                      },
                    },
                    {
                      id: "sinh",
                      name: "Sinhala",
                      slug: "sinhala",
                      resources: {
                        pastPapers: [
                          { label: "Sinhala Past Paper 2024", href: "#" },
                        ],
                        textbooks: [{ label: "Sinhala Textbook", href: "#" }],
                        notes: [{ label: "Sinhala Notes", href: "#" }],
                      },
                    },
                    {
                      id: "eng",
                      name: "English",
                      slug: "english",
                      resources: {
                        pastPapers: [
                          { label: "English Past Paper 2024", href: "#" },
                        ],
                        textbooks: [{ label: "English Textbook", href: "#" }],
                        notes: [{ label: "English Notes", href: "#" }],
                      },
                    },
                  ]}
                  resourceTypes={[
                    {
                      key: "pastPapers",
                      title: "Past Papers",
                      description: "Official past papers with marking schemes.",
                      examples: [],
                    },
                    {
                      key: "textbooks",
                      title: "Textbooks",
                      description: "Curated textbooks and references.",
                      examples: [],
                    },
                    {
                      key: "notes",
                      title: "Revision Notes",
                      description: "Exam-focused revision notes and guides.",
                      examples: [],
                    },
                  ]}
                />
              </HoverCard.Content>
            </HoverCard.Portal>
          </HoverCard.Root>
          <Link
            to="/donate"
            className="font-medium transition-colors hover:text-primary"
          >
            {language === "si" ? (
              <span
                className=""
                style={{
                  fontFamily: '"Noto Serif Sinhala", serif',
                  fontWeight: 600,
                }}
              >
                පරිත්‍යාග
              </span>
            ) : (
              "Donate"
            )}
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
              {language === "en" ? "SI" : "EN"}
            </span>
          </Button>

          {/* Auth Section */}
          {!user ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="hidden sm:inline-flex">
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
              <Button variant="ghost" size="sm" onClick={handleLogout}>
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
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
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
  );
};
