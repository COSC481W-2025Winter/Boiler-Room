'use client'

import styles from './Friends.module.css'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'

export default function Friends() {
  //Function to check for login and redirect
  //to error page if not logged in
  if (!process.env.JEST_WORKER_ID) {
    checkLogin()
  }
  async function checkLogin() {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND}/steam/logininfo`,
        { withCredentials: true }
      )
      if (!response.data.steamId) {
        //redirect to error page if not logged in
          window.location.href = '/LoginRedirect';
      }
    } catch (error) {
      window.location.href = '/LoginRedirect';
    }
  }

  const [friendsInfo, setFriendsInfo] = useState([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(true)

  async function checkIfUserLoggedIn() {
    try {
      await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/steam/playersummary', {
        withCredentials: true,
      })
      return true
    } catch (err) {
      return false
    }
  }

  async function fetchFriendsList() {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND + '/steam/friendsList',
        {
          withCredentials: true,
        }
      )

      return response.data
    } catch (error) {
      console.error('Error fetching Steam ID:', error)
    }
  }

  async function fetchFriendsRecentGames(friendsList) {
    const friendsInfoList = []
    for (const friend of friendsList) {
      try {
        const username = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND + '/steam/playersummary',
          {
            withCredentials: true,
            params: {
              steamid: friend.steamid,
            },
          }
        )

        const recentGames = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND + '/steam/recentGames',
          {
            withCredentials: true,
            params: {
              steamid: friend.steamid,
            },
          }
        )

        friendsInfoList.push({
          username: username.data.username,
          recentGames: recentGames.data,
        })
      } catch (error) {
        console.error('Error Fetching Friends Info:', error)
      } finally {
        setLoading(false)
      }
    }
    return friendsInfoList
  }

  useEffect(() => {
    async function fetchData() {
      if (await checkIfUserLoggedIn()) {
        const friendsList = await fetchFriendsList()
        const friendsInfoList = await fetchFriendsRecentGames(friendsList)
        setFriendsInfo(friendsInfoList)
      } else {
        setLoggedIn(false)
      }
    }

    fetchData()
  }, [])

  if (!loggedIn) {
    return <h1 className={styles.title}>Not Logged In</h1>
  }

  return (
    <div className={styles.container}>
      <h1>Your Friends</h1>
      <div className={styles.list_of_friends}>
        {loading
          ? 'Fetching Friends Data...'
          : friendsInfo?.map((friend, key) => {
              return (
                <div className={styles.friend_info} key={key}>
                  <h4 className={styles.username}>{friend.username}</h4>

                  <span className={styles.recently_played_label}>
                    Recently Played Games
                  </span>
                  <div className={styles.recent_game_list}>
                    {friendsInfo.recentGames?.length != 0 ? (
                      friend.recentGames?.map((game, key) => {
                        return (
                          <div className={styles.recent_game} key={key}>
                            <Link href={`SingleGame/${game.appid}`}>
                              <img
                                className={styles.image}
                                src={
                                  'https://steamcdn-a.akamaihd.net/steam/apps/' +
                                  game.appid +
                                  '/library_600x900_2x.jpg'
                                }
                                alt={game.name}
                              />
                            </Link>
                            <span>
                              {Math.round(game.playtime_2weeks / 60)} hours in last 2
                              weeks
                            </span>
                          </div>
                        )
                      })
                    ) : (
                      <span>No Games Played</span>
                    )}
                  </div>
                </div>
              )
            })}
      </div>
    </div>
  )
}
