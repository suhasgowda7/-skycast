import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App, { STORAGE_KEYS } from './App'
import { FORECAST_CACHE_KEY } from './hooks/useForecast'
import { geocodingResponse, makeForecastResponse } from './test/fixtures'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const berlin = { id: 2950159, name: 'Berlin', latitude: 52.52437, longitude: 13.41053, country: 'Germany', admin1: 'Land Berlin' }

/** Routes fetch calls by host, like the real API. */
function mockApi(forecast: () => Response = () => json(makeForecastResponse())) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input))
    if (url.hostname === 'geocoding-api.open-meteo.com') return json(geocodingResponse)
    if (url.hostname === 'api.open-meteo.com') return forecast()
    throw new Error(`Unexpected request ${url}`)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function mockGeolocation(impl: Geolocation['getCurrentPosition']) {
  vi.stubGlobal('navigator', Object.assign(Object.create(navigator), { geolocation: { getCurrentPosition: impl } }))
}

beforeEach(() => {
  localStorage.clear()
})

describe('App', () => {
  it('shows the welcome state with attribution when nothing is selected (FR-10)', () => {
    mockApi()
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Welcome to SkyCast' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open-Meteo.com' })).toHaveAttribute('href', 'https://open-meteo.com/')
  })

  it('FR-1/2/3/4 searches a city and shows its forecast', async () => {
    mockApi()
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByRole('combobox'), 'Berlin')
    await user.click((await screen.findAllByRole('option'))[0]!)

    expect(await screen.findByRole('heading', { name: 'Berlin', level: 2 })).toBeInTheDocument()
    expect(screen.getByText('Land Berlin, Germany')).toBeInTheDocument()
    expect(screen.getByTestId('current-temp')).toHaveTextContent('12°')
    expect(within(screen.getByRole('region', { name: 'Berlin' })).getByText('Light rain')).toBeInTheDocument()
    expect(screen.getByTestId('current-wind')).toHaveTextContent('16 km/h SW')

    const hourly = screen.getByRole('region', { name: /hourly forecast/i })
    expect(within(hourly).getAllByRole('listitem')).toHaveLength(24)
    expect(within(hourly).getByText('Now')).toBeInTheDocument()

    const daily = screen.getByRole('heading', { name: '7-day forecast' }).parentElement!
    expect(within(daily).getAllByRole('listitem')).toHaveLength(7)
    expect(within(daily).getByText('Today')).toBeInTheDocument()
    expect(within(daily).getByText('Friday')).toBeInTheDocument()

    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.lastPlace)!)).toMatchObject({ id: berlin.id })
  })

  it('FR-7 toggles units without refetching and persists the choice', async () => {
    localStorage.setItem(STORAGE_KEYS.lastPlace, JSON.stringify(berlin))
    const fetchMock = mockApi()
    const user = userEvent.setup()
    render(<App />)
    await screen.findByTestId('current-temp')
    const calls = fetchMock.mock.calls.length

    await user.click(screen.getByRole('button', { name: '°F' }))
    await user.click(screen.getByRole('button', { name: 'mph' }))

    expect(screen.getByTestId('current-temp')).toHaveTextContent('54°')
    expect(screen.getByTestId('current-wind')).toHaveTextContent('10 mph SW')
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true')
    expect(fetchMock.mock.calls.length).toBe(calls)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.units)!)).toEqual({ temp: 'F', wind: 'mph' })
  })

  it('FR-6 adds, selects and removes favourites', async () => {
    localStorage.setItem(STORAGE_KEYS.lastPlace, JSON.stringify(berlin))
    mockApi()
    const user = userEvent.setup()
    render(<App />)

    await user.click(await screen.findByRole('button', { name: 'Add Berlin to favourites' }))
    const favs = screen.getByRole('navigation', { name: 'Favourite cities' })
    expect(within(favs).getByRole('button', { name: 'Berlin' })).toHaveAttribute('aria-current', 'true')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.favourites)!)).toHaveLength(1)

    await user.click(within(favs).getByRole('button', { name: 'Berlin' }))
    const card = screen.getByRole('region', { name: 'Berlin' })
    await user.click(within(card).getByRole('button', { name: 'Remove Berlin from favourites' }))
    expect(within(favs).queryByRole('button', { name: 'Berlin' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Berlin to favourites' })).toBeInTheDocument()
  })

  it('FR-6 removes a favourite from the chip row and caps the list at 10', async () => {
    const favourites = Array.from({ length: 10 }, (_, i) => ({ ...berlin, id: i + 1, name: `City ${i + 1}` }))
    localStorage.setItem(STORAGE_KEYS.favourites, JSON.stringify(favourites))
    localStorage.setItem(STORAGE_KEYS.lastPlace, JSON.stringify(berlin))
    mockApi()
    const user = userEvent.setup()
    render(<App />)

    await user.click(await screen.findByRole('button', { name: 'Add Berlin to favourites' }))
    expect(screen.getByText(/up to 10 favourites/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove City 1 from favourites' }))
    expect(screen.queryByRole('button', { name: 'City 1' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add Berlin to favourites' }))
    // Both the star on the card and the new chip now offer removal.
    expect(screen.getAllByRole('button', { name: 'Remove Berlin from favourites' })).toHaveLength(2)
  })

  it('FR-8/FR-9 restores the last place and shows cached data with a notice when offline', async () => {
    localStorage.setItem(STORAGE_KEYS.lastPlace, JSON.stringify(berlin))
    localStorage.setItem(
      FORECAST_CACHE_KEY,
      JSON.stringify({ latitude: berlin.latitude, longitude: berlin.longitude, fetchedAt: Date.now(), data: makeForecastResponse({ temperature: 3 }) }),
    )
    mockApi(() => {
      throw new TypeError('Failed to fetch')
    })
    render(<App />)

    // Cached data renders immediately, before the request fails.
    expect(screen.getByTestId('current-temp')).toHaveTextContent('3°')
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/couldn't load the forecast/i)
    expect(alert).toHaveTextContent(/showing the forecast saved at/i)
  })

  it('NFR-5 shows an error with Retry that recovers', async () => {
    localStorage.setItem(STORAGE_KEYS.lastPlace, JSON.stringify(berlin))
    let fail = true
    mockApi(() => (fail ? json({ error: true }, 503) : json(makeForecastResponse())))
    const user = userEvent.setup()
    render(<App />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent("Couldn't load the forecast.")
    expect(screen.queryByTestId('current-temp')).not.toBeInTheDocument()

    fail = false
    await user.click(within(alert).getByRole('button', { name: 'Retry' }))
    expect(await screen.findByTestId('current-temp')).toHaveTextContent('12°')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('NFR-5 says "offline" when the browser is offline', async () => {
    localStorage.setItem(STORAGE_KEYS.lastPlace, JSON.stringify(berlin))
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    mockApi(() => {
      throw new TypeError('Failed to fetch')
    })
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent("You're offline.")
  })

  it('FR-5 loads the forecast for the current location', async () => {
    const fetchMock = mockApi()
    mockGeolocation((success) =>
      success({ coords: { latitude: 51.50735, longitude: -0.12776 } } as GeolocationPosition),
    )
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /my location/i }))
    expect(await screen.findByRole('heading', { name: 'My location' })).toBeInTheDocument()
    // No favourite button for "My location".
    expect(screen.queryByRole('button', { name: /favourites/ })).not.toBeInTheDocument()
    const url = new URL(String(fetchMock.mock.calls.at(-1)?.[0]))
    expect(url.searchParams.get('latitude')).toBe('51.51')
    expect(url.searchParams.get('longitude')).toBe('-0.13')
  })

  it('FR-5 explains when location permission is denied', async () => {
    mockApi()
    mockGeolocation((_success, error) => error?.({ code: 1 } as GeolocationPositionError))
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /my location/i }))
    expect(screen.getByText(/permission was denied/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeEnabled()
  })

  it('FR-5 handles other geolocation failures and missing support', async () => {
    mockApi()
    mockGeolocation((_success, error) => error?.({ code: 3 } as GeolocationPositionError))
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.click(screen.getByRole('button', { name: /my location/i }))
    expect(screen.getByText(/couldn't get your location/i)).toBeInTheDocument()
    unmount()

    vi.stubGlobal('navigator', Object.create(null))
    render(<App />)
    await user.click(screen.getByRole('button', { name: /my location/i }))
    expect(screen.getByText(/not available in this browser/i)).toBeInTheDocument()
  })
})
