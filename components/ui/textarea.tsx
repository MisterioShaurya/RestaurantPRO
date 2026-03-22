import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'placeholder:text-gray-400 border-gray-300 bg-white flex field-sizing-content min-h-20 w-full rounded-xl border px-4 py-2 text-base shadow-sm transition-all outline-none',
        'focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-0',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
        'aria-invalid:border-red-500 aria-invalid:ring-red-200 aria-invalid:focus-visible:ring-red-300',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
