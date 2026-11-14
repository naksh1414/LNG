'use client'

import { AlertDialog } from '@base-ui/react/alert-dialog'
import { Button } from '@/components/ui/button'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  pending?: boolean
  error?: string | null
}

// Base UI traps focus, closes on Escape and returns focus to the trigger.
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, onConfirm, pending, error }: Props) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 bg-foreground/40" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 border border-border bg-background p-6 shadow-[0_24px_60px_-20px_rgba(35,44,54,0.45)]">
          <AlertDialog.Title className="text-lg font-bold text-foreground">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</AlertDialog.Description>
          {error && <p role="alert" className="mt-3 text-sm font-medium text-destructive">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Close render={<Button variant="quiet" size="sm" />}>Cancel</AlertDialog.Close>
            <Button
              size="sm"
              onClick={onConfirm}
              disabled={pending}
              className="border-destructive bg-destructive text-white hover:border-foreground hover:bg-foreground"
            >
              {pending ? 'Deleting' : confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
