import { useCallback, useState } from 'react'
import { roundCoord } from '../api/openMeteo'

export interface Coordinates {
  latitude: number
  longitude: number
}

const PERMISSION_DENIED = 1

export function useGeolocation(onLocated: (coords: Coordinates) => void) {
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Location is not available in this browser. Search for a city instead.')
      return
    }
    setLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false)
        onLocated({
          latitude: roundCoord(position.coords.latitude),
          longitude: roundCoord(position.coords.longitude),
        })
      },
      (err) => {
        setLocating(false)
        setError(
          err.code === PERMISSION_DENIED
            ? 'Location permission was denied. Search for a city instead.'
            : "Couldn't get your location. Search for a city instead.",
        )
      },
      { timeout: 10_000, maximumAge: 10 * 60_000 },
    )
  }, [onLocated])

  const clearError = useCallback(() => setError(null), [])

  return { locate, locating, error, clearError }
}
