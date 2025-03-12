import './globals.css'
import { Navbar } from '@/components/Navbar/Navbar'
import { ThemeProvider } from '@/providers/ThemeProvider'

export const metadata = {
  title: 'BoilerRoom',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
