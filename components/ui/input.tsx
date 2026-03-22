import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'placeholder:text-gray-500 selection:bg-orange-100 selection:text-orange-900 border-gray-300 h-10 w-full rounded-lg border bg-white px-4 py-2 text-base shadow-sm transition-all outline-none',
        'file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-gray-700',
        'focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-0',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
        'aria-invalid:border-red-500 aria-invalid:ring-red-200 aria-invalid:focus-visible:ring-red-300',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
