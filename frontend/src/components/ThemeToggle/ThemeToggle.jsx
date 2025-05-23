'use client'

import axios from 'axios'
import styles from './ThemeToggle.module.css'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const unauthenticatedUrls = ['/', '/LoginRedirect', /^\/Search/, /^\/SingleGame/]

  function matchesAnyPattern(str, patterns) {
    return patterns.some((pattern) => {
      if (pattern instanceof RegExp) {
        return pattern.test(str)
      }
      return str === pattern
    })
  }

  async function toggleTheme() {
    if (theme == 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
    if (!matchesAnyPattern(pathname, unauthenticatedUrls)) {
      console.log('path' + pathname)
      const preference = theme == 'dark' ? 1 : 0
      // technically 0=dark and 1=light but the theme variable doesn't updated
      // immediately so I have to just switch them
      try {
        await axios.put(
          process.env.NEXT_PUBLIC_BACKEND + '/themepreference',
          { preference: preference },
          {
            withCredentials: true,
          }
        )
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <button onClick={toggleTheme} className={styles.button}>
      {theme == 'dark' ? (
        <img className={styles.darkButton} src='/dark-mode.png' width={24} />
      ) : (
        <img src='/light-mode.png' width={24} />
      )}
    </button>
  )
}
