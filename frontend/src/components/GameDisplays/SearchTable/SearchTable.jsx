'use client'

import { useState, useEffect } from 'react'
import styles from './GameTable.module.css'
import axios from 'axios'

async function hideGame(game_id, hideValue) {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND}/hidegame`,
      {
        gameId: Number(game_id),
        hide: Number(hideValue),
      },
      {
        withCredentials: true,
      }
    )
    return response.data
  } catch (error) {
    console.error('Error hiding game:', error)
    throw error
  }
}

const GameTable = ({ games, onGamesUpdate }) => {
  const ROWS_PER_PAGE = 10
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredGames, setFilteredGames] = useState([])
  const [sortBy, setSortBy] = useState('boil')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    filterGames()
    console.log('Frontend' + games[0])
  }, [games, sortBy, sortOrder]) // Depend on sortBy and sortOrder

  const filterGames = () => {
    let sortedGames = [...games]

    sortedGames.sort((a, b) => {
      const comparison = compareValues(a, b, sortBy)
      return sortOrder === 'asc' ? comparison : -comparison
    })

    const newTotalPages = Math.ceil(sortedGames.length / ROWS_PER_PAGE)
    setFilteredGames(sortedGames)

    // Keep the current page unless it's out of bounds
    setCurrentPage((prevPage) => Math.min(prevPage, newTotalPages) || 1)
    console.log('Frontend' + games[0])
  }

  const totalPages = Math.ceil(filteredGames.length / ROWS_PER_PAGE)
  const indexOfLastGame = currentPage * ROWS_PER_PAGE
  const indexOfFirstGame = indexOfLastGame - ROWS_PER_PAGE
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame)

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const compareValues = (a, b, criteria) => {
    switch (criteria) {
      case 'title':
        return a.name.localeCompare(b.name)
      case 'metacritic':
        return (a.metacritic_score ?? 0) - (b.metacritic_score ?? 0)
      case 'timePlayed':
        return (a.total_played ?? 0) - (b.total_played ?? 0)
      case 'length':
        return (a.hltb_score ?? Infinity) - (b.hltb_score ?? Infinity)
      case 'boil':
        return (a.boil_score ?? 0) - (b.boil_score ?? 0)
      default:
        return 0
    }
  }

  const sortGames = (criteria) => {
    const newOrder = sortBy === criteria && sortOrder === 'desc' ? 'asc' : 'desc'
    setSortBy(criteria)
    setSortOrder(newOrder)
    filterGames() // Reapply sorting and filtering
  }

  return (
    <div className={styles.gameTableContainer}>
      <div className={styles.controls}>
        <div className={styles.filters}>
          <button
            onClick={() => sortGames('title')}
            className={sortBy === 'title' ? styles.activeFilter : ''}
          >
            Sort by Title {sortBy === 'title' && (sortOrder === 'asc' ? '⬆' : '⬇')}
          </button>
          <button
            onClick={() => sortGames('metacritic')}
            className={sortBy === 'metacritic' ? styles.activeFilter : ''}
          >
            Sort by Metacritic{' '}
            {sortBy === 'metacritic' && (sortOrder === 'asc' ? '⬆' : '⬇')}
          </button>
          <button
            onClick={() => sortGames('length')}
            className={sortBy === 'length' ? styles.activeFilter : ''}
          >
            Sort by Time to Beat{' '}
            {sortBy === 'length' && (sortOrder === 'asc' ? '⬆' : '⬇')}
          </button>
          <button
            onClick={() => sortGames('boil')}
            className={sortBy === 'boil' ? styles.activeFilter : ''}
          >
            Sort by BOIL {sortBy === 'boil' && (sortOrder === 'asc' ? '⬆' : '⬇')}
          </button>
        </div>

        <div className={styles.pagination}>
          <button onClick={prevPage} disabled={currentPage === 1}>
            Previous
          </button>
          <span>
            {currentPage} of {totalPages}
          </span>
          <button onClick={nextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      </div>

      <table className={styles.gameTable}>
        <thead>
          <tr className={styles.headerRow}>
            <th className={styles.titleColumn}>Title</th>
            <th>Boil</th>
            <th>Rating</th>
            <th>hltb</th>
            <th>Steam</th>
          </tr>
        </thead>
        <tbody>
          {currentGames.map((game) => (
            <tr key={game.game_id} className={styles.gameRow}>
              <td className={styles.titleColumn}>
                <div className={styles.titleContainer}>
                  <img
                    src={game.header_image}
                    alt={game.name}
                    className={styles.headerImage}
                  />
                  <a className={styles.titleText} href={`/SingleGame/${game.game_id}`}>
                    {game.name}
                  </a>
                </div>
              </td>
              <td>{game.boil_score ?? 'N/A'}</td>
              <td>{game.metacritic_score ?? 'N/A'}</td>
              <td>{game.hltb_score ? `${game.hltb_score} Hrs` : 'N/A'}</td>

              <td>
                <a href={`https://store.steampowered.com/app/${game.game_id}`}>
                  <img
                    src='https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png'
                    className={styles.steamImg}
                    alt='Steam'
                  />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default GameTable
