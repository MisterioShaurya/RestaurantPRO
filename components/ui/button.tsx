import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 active:scale-95 hover:shadow-md",
  {
    variants: {
      variant: {
        // Primary - Vibrant Orange (Main action)
        default: 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 shadow-sm hover:shadow-lg focus-visible:ring-orange-300',
        
        // Success variant
        success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm hover:shadow-lg',
        
        // Secondary - Neutral gray
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 shadow-sm hover:shadow-lg',
        
        // Danger - Red
        destructive: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm hover:shadow-lg focus-visible:ring-red-300',
        
        // Outline - Orange border
        outline: 'border-2 border-orange-500 bg-white text-orange-600 hover:bg-orange-50 hover:border-orange-600 active:bg-orange-100',
        
        // Ghost - Subtle background
        ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
        
        // Link - Text only
        link: 'text-orange-600 underline-offset-4 hover:underline font-semibold',
        
        // Light warning
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700 shadow-sm hover:shadow-lg',
      },
      size: {
        default: 'h-10 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs font-medium',
        lg: 'h-12 rounded-md px-6 has-[>svg]:px-4 text-base',
        xl: 'h-14 rounded-lg px-8 has-[>svg]:px-5 text-lg',
        icon: 'size-10 rounded-md',
        'icon-sm': 'size-8 rounded-md',
        'icon-lg': 'size-12 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
