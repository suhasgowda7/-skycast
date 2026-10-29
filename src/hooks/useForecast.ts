import { useCallback, useEffect, useState } from 'react'
import { fetchForecastData, parseForecast } from '../api/openMeteo'
import type { Forecast, Place } from '../domain/types'
import { isCachedForecast, type CachedForecast } from '../domain/validators'
import { readJSON, writeJSON } from './storage'

export const FORECAST_CACHE_KEY = 'skycast:last-forecast'

export function readCachedForecast(latitude: number, longitude: number): Forecast | null {
  const entry = readJSON<CachedForecast | null>(
    FORECAST_CACHE_KEY,
    (v): v is CachedForecast | null => v === null || isCachedForecast(v),
    null,
  )
  if (!entry || entry.latitude !== latitude || entry.longitude !== longitude) return null
  try {
    return parseForecast(entry.data, entry.fetchedAt)
  } catch {
    return null
  }
}

function describeError(): string {
  return typeof navigator !== 'undefined' && navigator.onLine === false
    ? "You're offline."
    : "Couldn't load the forecast."
}

interface ForecastState {
  forecast: Forecast | null
  loading: boolean
  error: string | null
}

export function useForecast(place: Place | null) {
  const latitude = place?.latitude
  const longitude = place?.longitude
  const [state, setState] = useState<ForecastState>(() => ({
    forecast: place ? readCachedForecast(place.latitude, place.longitude) : null,
    loading: place !== null,
    error: null,
  }))
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (latitude === undefined || longitude === undefined) return
    const controller = new AbortController()
    const cached = readCachedForecast(latitude, longitude)
    // Show cached data immediately while the network request is in flight.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronising with an external fetch
    setState({ forecast: cached, loading: true, error: null })

    fetchForecastData(latitude, longitude, controller.signal)
      .then((raw) => {
        const forecast = parseForecast(raw)
        writeJSON(FORECAST_CACHE_KEY, { latitude, longitude, fetchedAt: forecast.fetchedAt, data: raw })
        setState({ forecast, loading: false, error: null })
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setState({ forecast: cached, loading: false, error: describeError() })
      })

    return () => controller.abort()
  }, [latitude, longitude, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return { ...state, stale: state.error !== null && state.forecast !== null, retry }
}
