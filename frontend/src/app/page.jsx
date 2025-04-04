'use client'
import React, { useEffect, useState, useRef } from 'react'
import styles from './Home.module.css'
import axios from 'axios'
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle'
import { CookieMessage } from '@/components/CookieMessage/CookieMessage'

const LandingPage = () => {
  const [games, setGames] = useState([])
  const footerRef = useRef(null)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/games') // Use the backend port

        // Ensure the response is JSON
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server did not return JSON')
        }

        const data = response.data
        setGames(data)
      } catch (error) {
        console.error('Error fetching game images:', error)
      }
    }
    fetchGames()
    setTimeout(() => {
      if (footerRef.current) {
        footerRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 2000) // Delays scrolling by 2 seconds
  }, [])

  return (
    <>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.navContainer}>
            <img className={styles.logo} src='BRLogo.png' width={250} />
            <nav>
              <ul className={styles.navList}>
                <li>
                  <ThemeToggle />
                </li>
                <li>
                  <a
                    href={process.env.NEXT_PUBLIC_BACKEND + '/auth/steam'}
                    className={styles.navLink}
                  >
                    Sign In With Steam
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroOverlay}>
            <div className={styles.heroContent}>
              <h2 className={styles.heroTitle}>Welcome to Boiler Room</h2>
              <p className={styles.heroSubtitle}>
                Discover, play, and share amazing games.
              </p>
              <a href='/Dashboard' className={styles.exploreButton}>
                Explore Now
              </a>
            </div>
          </div>
        </section>
        {/*Dynamically Update the featured games section to display 3 random games from the data base.*/}
        <section className={styles.featuredGames}>
          <h3 className={styles.sectionTitle}>Featured Games</h3>
          <div className={styles.gamesGrid}>
            {games.map((game, index) => (
              <div key={index} className={styles.gameCard}>
                {/* Link to the game's Steam page */}
                <a href={`/SingleGame/${game.game_id}`}>
                  <img
                    src={game.header_image}
                    alt={game.name}
                    className={styles.gameImage}
                  />
                </a>
                <h4 className={styles.gameTitle}>{game.name}</h4>
                <p className={styles.gameDescription}>{game.description}</p>
              </div>
            ))}
          </div>
        </section>

        <footer ref={footerRef} className={styles.footer}>
          {' '}
          &copy; 2025 Boiler Room. All rights reserved.
        </footer>
      </div>

      <CookieMessage />
    </>
  )
}

export default LandingPage
