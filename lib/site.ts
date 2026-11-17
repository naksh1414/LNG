export const site = {
  name: 'Learn and Grow',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER as string | undefined,
  // Shown on the contact page; a blank value hides its row. directionsUrl is a Google Maps share link.
  // Sample values: replace before launch.
  contact: {
    phone: '+91 98765 43210',
    address: '12 Example Street, Sample Nagar\nNew Delhi 110001',
    directionsUrl: 'https://maps.google.com/?q=New+Delhi',
  },
  nav: [
    { label: 'Books', href: '/catalog' },
    { label: 'About', href: '/about' },
    { label: 'For schools', href: '/#schools' },
    { label: 'Contact', href: '/contact' },
  ],
}
