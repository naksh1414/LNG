"use client"

import { useState, type FormEvent } from "react"
import { ArrowUpRight } from "lucide-react"

const recipient = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim()

export function ContactForm() {
  const [opened, setOpened] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!recipient) return
    const form = new FormData(event.currentTarget)
    const subject = encodeURIComponent(`Enquiry from ${form.get("name")}`)
    const body = encodeURIComponent(
      `Name: ${form.get("name")}\nEmail: ${form.get("email")}\n\n${form.get("message")}`,
    )
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`
    setOpened(true)
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-fields">
        <label>
          Your name
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          Email address
          <input name="email" type="email" autoComplete="email" required />
        </label>
      </div>
      <label>
        How can we help?
        <textarea name="message" rows={5} required />
      </label>
      <div className="contact-submit-row">
        <button className="button-primary" type="submit" disabled={!recipient}>
          {recipient ? "Prepare your enquiry" : "Inbox being set up"} <ArrowUpRight aria-hidden="true" />
        </button>
        <span className="contact-note" aria-live="polite">
          {opened ? "Your email app should open with your message ready to send." : recipient ? "We usually reply within two working days." : "Our contact inbox is being configured. Please check back shortly."}
        </span>
      </div>
    </form>
  )
}
