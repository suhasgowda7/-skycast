import { useCallback, useState } from 'react'
import { CurrentCard } from './components/CurrentCard'
import { DailyList } from './components/DailyList'
import { Favourites } from './components/Favourites'
import { HourlyStrip } from './components/HourlyStrip'
import { SearchBox } from './components/SearchBox'
import { UnitToggle } from './components/UnitToggle'
import { DEFAULT_UNITS, MAX_FAVOURITES, MY_LOCATION_ID, type Place, type Units } from './domain/types'
import { isPlaceArray, isPlaceOrNull, isUnits } from './domain/validators'
import { useLocalStorage } from './hooks/storage'
import { useForecast } from './hooks/useForecast'
import { useGeolocation, type Coordinates } from './hooks/useGeolocation'

export const STORAGE_KEYS = {
  units: 'skycast:units',
  favourites: 'skycast:favourites',
  lastPlace: 'skycast:last-place',
} as const

const formatClock = (epochMs: number): string =>
  new Date(epochMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function App() {
  const [units, setUnits] = useLocalStorage<Units>(STORAGE_KEYS.units, isUnits, DEFAULT_UNITS)
  const [favourites, setFavourites] = useLocalStorage<Place[]>(STORAGE_KEYS.favourites, isPlaceArray, [])
  const [place, setPlace] = useLocalStorage<Place | null>(STORAGE_KEYS.lastPlace, isPlaceOrNull, null)
  const [notice, setNotice] = useState<string | null>(null)
  const { forecast, loading, error, stale, retry } = useForecast(place)

  const onLocated = useCallback(
    ({ latitude, longitude }: Coordinates) => setPlace({ id: MY_LOCATION_ID, name: 'My location', latitude, longitude }),
    [setPlace],
  )
  const geo = useGeolocation(onLocated)

  const selectPlace = (next: Place) => {
    setNotice(null)
    geo.clearError()
    setPlace(next)
  }

  const isFavourite = place !== null && favourites.some((f) => f.id === place.id)

  const toggleFavourite = () => {
    if (!place) return
    if (isFavourite) {
      setFavourites(favourites.filter((f) => f.id !== place.id))
      setNotice(null)
    } else if (favourites.length >= MAX_FAVOURITES) {
      setNotice(`You can save up to ${MAX_FAVOURITES} favourites. Remove one first.`)
    } else {
      setFavourites([...favourites, place])
    }
  }

  const message = geo.error ?? notice

  return (
    <div className="app">
      <a href="#main" className="skip-link">
        Skip to forecast
      </a>
      <header className="app-header">
        <div className="brand">
          <span aria-hidden="true">🌤️</span>
          <h1>SkyCast</h1>
        </div>
        <div className="controls">
          <SearchBox onSelect={selectPlace} />
          <button type="button" className="btn" onClick={geo.locate} disabled={geo.locating}>
            <span aria-hidden="true">📍</span> {geo.locating ? 'Locating…' : 'My location'}
          </button>
          <UnitToggle units={units} onChange={setUnits} />
        </div>
      </header>

      <Favourites
        favourites={favourites}
        currentId={place?.id ?? null}
        onSelect={selectPlace}
        onRemove={(id) => setFavourites(favourites.filter((f) => f.id !== id))}
      />

      <main id="main" tabIndex={-1}>
        <div className="notices" role="status" aria-live="polite">
          {message && <p className="notice">{message}</p>}
          {place && loading && !forecast && <p className="notice">Loading forecast…</p>}
        </div>

        {error && (
          <div className="notice notice-error" role="alert">
            <p>
              {error}{' '}
              {stale && forecast ? `Showing the forecast saved at ${formatClock(forecast.fetchedAt)}.` : ''}
            </p>
            <button type="button" className="btn" onClick={retry}>
              Retry
            </button>
          </div>
        )}

        {!place && (
          <section className="card empty">
            <h2>Welcome to SkyCast</h2>
            <p>Search for a city or use your location to see the forecast.</p>
          </section>
        )}

        {place && forecast && (
          <div className="forecast-grid">
            <CurrentCard
              place={place}
              current={forecast.current}
              units={units}
              canFavourite={place.id !== MY_LOCATION_ID}
              isFavourite={isFavourite}
              onToggleFavourite={toggleFavourite}
            />
            <HourlyStrip hours={forecast.hourly} units={units} />
            <DailyList days={forecast.daily} units={units} />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Weather data by <a href="https://open-meteo.com/">Open-Meteo.com</a> (CC BY 4.0).
          {forecast && ` Updated ${formatClock(forecast.fetchedAt)}.`}
        </p>
        <p className="subtle">
          Your location is only sent to Open-Meteo, rounded to about 1 km, to fetch the forecast. No tracking.
        </p>
      </footer>
    </div>
  )
}
