export const econtentUrl = 'https://econtent.learnngrow.co.in/tg/'

type NavItem = { label: string; href: string; external?: boolean }

export const site = {
  name: 'Learn N Grow',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER as string | undefined,
  // Shown on the contact page; a blank value hides its row. directionsUrl is a Google Maps share link.
  // Sample values: replace before launch.
  contact: {
    phone: '+91 98765 43210',
    address: '12 Example Street, Sample Nagar\nNew Delhi 110001',
    directionsUrl: 'https://maps.google.com/?q=New+Delhi',
  },
  // Link to the Learn N Grow app (Play Store or website). Empty hides the app button on the home page.
  app: { url: 'https://play.google.com/store/apps/details?id=vk.apps.lng' },
  // SAMPLE TEXT: placeholder name and message for the About page. Replace with the founder's own words.
  founder: {
    name: 'Founder name',
    role: 'Founder, Learn N Grow',
    // Path under public/, e.g. '/founder.jpg'. Leave empty to show the initial instead.
    image: '',
    message: [
      'We started Learn N Grow because children deserve books that trust them. A good book gives a child something to wonder about, and the time to find their own way into it.',
      'Every series we publish is made with that in mind: clear language, hands-on ideas, and room for each child’s pace. Thank you for reading with us.',
    ],
  },
  nav: <NavItem[]>[
    { label: 'Home', href: '/' },
    { label: 'Books', href: '/catalog' },
    { label: 'About', href: '/about' },
    { label: 'For schools', href: econtentUrl, external: true },
    { label: 'Contact', href: '/contact' },
  ],
}
