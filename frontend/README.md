# OL-Poddo Frontend

A modern, fully-featured Vite + React application with Tailwind CSS and React Router, featuring a beautiful light and dark theme system with **Amber** as the primary color.

## 🎨 Features

- **Vite 5.2.0** - Lightning-fast build tool and dev server
- **React 18.3.1** - Modern UI library
- **React Router 6.24.0** - Client-side routing
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Theme System** - Light mode (Amber primary) and Dark mode (Zinc/Stone palette)
- **Responsive Design** - Mobile-first, fully responsive
- **Dark Mode Toggle** - Easy theme switching with persistent storage
- **ESLint** - Code quality and consistency

## 🎯 Color Scheme

### Light Mode
- Primary: **Amber** (#f59e0b)
- Secondary: Yellow, Gray
- Background: White
- Text: Gray-900

### Dark Mode
- Primary: **Amber** (#f59e0b - maintained for consistency)
- Background: Zinc-900 (#18181b) / Stone
- Text: Amber-200, Gray-300
- Accents: Zinc-700 to Zinc-800

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

## 📚 Project Structure

- `src/components/` - Reusable UI components
- `src/context/` - React Context (Theme management)
- `src/pages/` - Page components
- `src/utils/` - Utility functions
- `tailwind.config.js` - Tailwind CSS configuration
- `vite.config.js` - Vite configuration
