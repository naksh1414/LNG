export const site = {
  name: 'Learn and Grow',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER as string | undefined,
  nav: [
    { label: 'Books', href: '/catalog' },
    { label: 'About', href: '/about' },
    { label: 'For schools', href: '/#schools' },
    { label: 'Contact', href: '/#contact' },
  ],
}
