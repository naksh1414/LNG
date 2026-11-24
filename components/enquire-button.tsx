import { ChevronDown } from 'lucide-react'
import { EnquiryForm } from '@/components/enquiry-form'

// Native <details>: keyboard accessible and works without any layout scripting.
export function EnquireButton({ book }: { book: { id: string; title: string } }) {
  return (
    <details id="enquire" className="group mt-10 border border-foreground">
      <summary className="flex h-12 cursor-pointer list-none items-center justify-between gap-2 bg-foreground px-5 text-base font-semibold text-background transition-colors select-none hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
        Enquire about this book
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="relative border-t border-border p-5">
        <EnquiryForm book={book} />
      </div>
    </details>
  )
}
