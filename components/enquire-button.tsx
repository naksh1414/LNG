import { ChevronDown } from 'lucide-react'
import { EnquiryForm } from '@/components/enquiry-form'

// Native <details>: keyboard accessible and works without any layout scripting.
export function EnquireButton({ book }: { book: { id: string; title: string } }) {
  return (
    <details id="enquire" className="group mt-8 border border-border">
      <summary className="flex h-11 cursor-pointer list-none items-center justify-between gap-2 px-5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
        Enquire about this book
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="relative border-t border-border p-5">
        <EnquiryForm book={book} />
      </div>
    </details>
  )
}
