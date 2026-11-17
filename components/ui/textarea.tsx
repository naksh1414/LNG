import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'min-h-28 w-full rounded-md border border-input bg-field px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent aria-invalid:border-destructive disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
