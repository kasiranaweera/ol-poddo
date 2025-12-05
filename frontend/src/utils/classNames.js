import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines tailwind class names with conditional logic and merges conflicts
 * This is the shadcn/ui standard cn utility
 * @param {...any} inputs - Class names or objects to combine
 * @returns {string} - Combined class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Gets theme-aware color classes
 * @param {string} lightColor - Tailwind class for light mode
 * @param {string} darkColor - Tailwind class for dark mode
 * @returns {string} - Combined dark mode classes
 */
export const themeColor = (lightColor, darkColor) => {
  return cn(lightColor, `dark:${darkColor}`)
}

/**
 * Gets responsive classes with theme support
 * @param {string} base - Base classes
 * @param {string} sm - Small screen classes
 * @param {string} md - Medium screen classes
 * @param {string} lg - Large screen classes
 * @returns {string} - Combined responsive classes
 */
export const responsive = (base, sm, md, lg) => {
  return cn(base, `sm:${sm}`, `md:${md}`, `lg:${lg}`)
}

