'use client'

import { useState } from 'react'
import styles from './DashGameGallery.module.css'

const DashGameGallery = ({ games, categories }) => {
  const [imageErrors, setImageErrors] = useState({})

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }))
  }

  const fallbackImage =
    'https://cdn2.steamgriddb.com/grid/786d203018e4c2e02516c19095af939e.jpg'

  return (
    <div className={styles.gallery}>
      {games.map((game, index) => {
        const isMiddle = games.length === 3 && index === 1 // Check if it's the middle game

        return (
          <div
            key={index}
            className={`${styles.gameContainer} ${isMiddle ? styles.enlarged : ''}`}
          >
            <a href={'/SingleGame/' + game.game_id} className={styles.imageWrapper}>
              {imageErrors[index] ? (
                <div className={styles.placeholder}>
                  <img src={fallbackImage} />
                </div>
              ) : (
                <img
                  src={
                    'https://steamcdn-a.akamaihd.net/steam/apps/' +
                    game.game_id +
                    '/library_600x900_2x.jpg'
                  }
                  alt={game.name}
                  className={styles.gameImage}
                  onError={() => handleImageError(index)}
                />
              )}
            </a>
            <p className={styles.gameCategory}>{categories[index].label}</p>
            <p className={styles.placeholderText}>{game.name}</p>
          </div>
        )
      })}
    </div>
  )
}
export default DashGameGallery
