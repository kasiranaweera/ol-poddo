import React from 'react'
import { cn } from '../../utils/classNames'

const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default:
      'inline-flex items-center rounded-full border border-transparent bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    secondary:
      'inline-flex items-center rounded-full border border-transparent bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-50',
    destructive:
      'inline-flex items-center rounded-full border border-transparent bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-900 dark:text-red-200',
    outline:
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:text-zinc-50',
  }

  return (
    <div
      ref={ref}
      className={cn(variants[variant], className)}
      {...props}
    />
  )
})
Badge.displayName = 'Badge'

export { Badge }
