'use client'
import React, { useEffect, useState } from 'react'
import styles from './SingleGame.module.css'
import { useParams } from 'next/navigation'
import axios from 'axios'

const SingleGamePage = () => {
  const { gameid } = useParams()
  const [game, setGame] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND + `/games/${gameid}`
        )

        const contentType = response.headers['content-type']
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server did not return JSON')
        }

        setGame(response.data)
      } catch (error) {
        console.error('Error fetching game details:', error)
        setError('Failed to load game details.')
      }
    }

    if (gameid) {
      fetchGame()
    }
  }, [gameid])

  // Circular Progress Function
  const getStrokeDashOffset = (score) => {
    const radius = 50
    const circumference = 2 * Math.PI * radius
    return circumference - (score / 100) * circumference
  }

  return error ? (
    <div className={styles.error}>{error}</div>
  ) : !game ? (
    <div className={styles.loading}>Loading...</div>
  ) : (
    <div className={styles.singleGameContainer}>
      <h1 className={styles.gameTitle}>{game.name}</h1>
      <div className={styles.gameContent}>
        {/* Left Column */}
        <div className={styles.gameLeft}>
          <div className={styles.imageContainer}>
            <img
              src={`https://steamcdn-a.akamaihd.net/steam/apps/${gameid}/library_600x900_2x.jpg`}
              alt={game.name}
              onError={(e) => {
                e.target.src = `https://placehold.co/600x900/black/white/?text=${game.name}&font=lobster`
              }}
            />
          </div>
          <div className={styles.releaseDate}>
            Release Date: {game.released ? game.released : 'Not Available'}
          </div>
          <button className={styles.button}>Recommend this Game</button>
        </div>

        {/* Right Column */}
        <div className={styles.gameRight}>
          <div className={styles.gameSummary}>
            {game.description ? game.description : 'No description available.'}
          </div>
          <div className={styles.reviews}>
            <strong>Steam Reviews</strong>
            <br />
            <br />
            {game.recommendations ? game.recommendations : 'N/A'}
          </div>
          <div className={styles.hltb_score}>
            <strong>How Long to Beat</strong>
            <span className={styles.tooltipText}>
              <strong>
                The Average of the <br></br>Main Story & Main Story + Extras <br></br>
              </strong>
              howlongtobeat.com{' '}
            </span>
            <br />
            <br />
            {game.hltb_score ? `${Math.floor(game.hltb_score)} hours` : 'N/A'}
          </div>
          <div className={styles.platforms}>
            <strong>Platforms</strong>
            <br />
            <br />
            {game.platform ? game.platform : 'N/A'}
          </div>
          <div className={styles.metacritic_score}>
            <strong>Metacritic Score</strong>
            <br></br>
            <br></br>
            <div className={styles.circleContainer}>
              <svg className={styles.progressRing} width='120' height='120'>
                <circle className={styles.progressRingBg} cx='60' cy='60' r='50'></circle>
                <circle
                  className={styles.progressRingCircle}
                  cx='60'
                  cy='60'
                  r='50'
                  style={{
                    strokeDasharray: 314,
                    strokeDashoffset: getStrokeDashOffset(game.metacritic_score),
                    transition: 'stroke-dashoffset 0.6s ease-in-out',
                  }}
                ></circle>
              </svg>
              <span className={styles.progressText}>
                {game.metacritic_score ? `${game.metacritic_score}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SingleGamePage
