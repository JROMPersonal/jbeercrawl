import { useEffect, useState } from 'react'
import { fetchBreweriesForCity } from '../api/breweryDb'

/**
 * Fetches the brewery list for a city from Open Brewery DB.
 * @returns {{ breweries: Array, status: 'loading' | 'ready' | 'error' }}
 */
export function useBreweries(city) {
  const [breweries, setBreweries] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!city) return

    let cancelled = false
    setStatus('loading')

    fetchBreweriesForCity(city)
      .then((data) => {
        if (cancelled) return
        setBreweries(data)
        setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [city])

  return { breweries, status }
}
