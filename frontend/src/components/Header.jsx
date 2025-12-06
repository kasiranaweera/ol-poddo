import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Flame,
  Folder,
  Home,
  Info,
  Key,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  X,
} from "lucide-react";
import * as HoverCard from "@radix-ui/react-hover-card";
import { NavigationMenu } from "./common/NavigationMenu";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "./common/Button";
import { cn } from "../utils/cn";
import Logo from "./Logo";
import Knowingz from "../assets/knowingz.png";

export const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [openNavMenu, setOpenNavMenu] = useState(true);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    window.location.reload();
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
        <div className="flex gap-4">
          <div className="flex gap-1 items-center">
            <img src={Knowingz} alt="Knowingz Logo" className="h-8 w-auto" />
            <p className="font-klarissa text-3xl hidden xl:block">KnowingZ</p>
          </div>

          {/* <img src={Knowingz} alt="Knowingz Logo" className="h-8 w-auto" /> */}
          <div className="border-x-2 border-border" />
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
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
            className="rounded-full border border-border"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="rounded-full border border-border"
            aria-label="Toggle language"
          >
            <span className="text-sm font-semibold">
              {language === "en" ? "SI" : "EN"}
            </span>
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full border border-border lg:hidden"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>

          {mobileMenuOpen}
          {/* Auth Section */}
          {!user ? (
            <div className="lg:flex items-center gap-2 hidden">
              <Button
                variant="ghost"
                className="hidden sm:inline-flex border border-border"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="default" className="hidden sm:inline-flex">
                <Link to="/register" className="text-white">
                  Sign Up
                </Link>
              </Button>
            </div>
          ) : (
            <Link onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-semibold">
                {user.username?.charAt(0).toUpperCase()}
              </div>
            </Link>
          )}

          
        </div>
      </div>

      {/* Profile Menu */}
      {profileMenuOpen && (
        <div className="border mx-4 absolute border-border right-0 rounded-lg w-4/12 md:w-3/12 xl:w-2/12 2xl:w-1/12 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60r ">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4 ">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.username}</span>
              <span className="text-xs font-medium text-muted-foreground">
                {user.email}
              </span>
            </div>
            <div className="border-t border-border" />
            <Link
              to="/account"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setProfileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <User className="inline w-4" />
                <span className="">Account</span>
              </div>
            </Link>

            <Link
              to="/login"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={handleLogout}
            >
              <div className="flex items-center gap-2">
                <LogOut className="inline w-4" />
                <span className="">Logout</span>
              </div>
            </Link>
          </nav>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border mx-4 absolute border-border right-0 rounded-lg w-3/12 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60r ">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4 ">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <Home className="inline w-4" />
                <span className="">Home</span>
              </div>
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <Info className="inline w-4" />
                <span className="">About Us</span>
              </div>
            </Link>
            <Link
              to="/resources"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <Folder className="inline w-4" />
                <span className="">Resorces</span>
              </div>
            </Link>
            <Link
              to="/donate"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <Flame className="inline w-4" />
                <span className="">Donate</span>
              </div>
            </Link>
            <div className="border-t border-border" />
            <Link
              to="/login"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <Key className="inline w-4" />
                <span className="">Login</span>
              </div>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
