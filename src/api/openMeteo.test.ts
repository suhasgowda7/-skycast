import { describe, expect, it, vi } from 'vitest'
import { geocodingResponse, makeForecastResponse } from '../test/fixtures'
import {
  ApiError,
  buildForecastUrl,
  fetchForecastData,
  parseForecast,
  parsePlaces,
  searchPlaces,
} from './openMeteo'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('buildForecastUrl', () => {
  it('rounds coordinates to 2 decimals and requests metric data in local time', () => {
    const url = new URL(buildForecastUrl(52.524368, 13.410530))
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast')
    expect(url.searchParams.get('latitude')).toBe('52.52')
    expect(url.searchParams.get('longitude')).toBe('13.41')
    expect(url.searchParams.get('timezone')).toBe('auto')
    expect(url.searchParams.get('forecast_days')).toBe('7')
  })
})

describe('parseForecast', () => {
  it('FR-1 maps current conditions', () => {
    const f = parseForecast(makeForecastResponse(), 1000)
    expect(f.fetchedAt).toBe(1000)
    expect(f.timezone).toBe('Europe/Berlin')
    expect(f.current).toEqual({
      time: '2026-10-29T14:15',
      temperature: 12.3,
      apparentTemperature: 10.1,
      humidity: 70,
      precipitation: 0.2,
      weatherCode: 61,
      windSpeed: 16.1,
      windDirection: 225,
      isDay: true,
    })
  })

  it('FR-2 returns 24 hours starting at the current hour', () => {
    const { hourly } = parseForecast(makeForecastResponse())
    expect(hourly).toHaveLength(24)
    expect(hourly[0]?.time).toBe('2026-10-29T14:00')
    expect(hourly[23]?.time).toBe('2026-10-30T13:00')
  })

  it('FR-3 returns 7 days', () => {
    const { daily } = parseForecast(makeForecastResponse())
    expect(daily).toHaveLength(7)
    expect(daily[0]).toEqual({
      date: '2026-10-29',
      max: 14,
      min: 5,
      weatherCode: 63,
      precipitationProbability: 0,
      sunrise: '2026-10-29T07:05',
      sunset: '2026-10-29T16:40',
    })
  })

  it('tolerates missing optional series', () => {
    const data = makeForecastResponse() as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
    delete data.hourly.precipitation_probability
    delete data.daily.precipitation_probability_max
    delete data.timezone
    const f = parseForecast(data)
    expect(f.hourly[0]?.precipitationProbability).toBeNull()
    expect(f.daily[0]?.precipitationProbability).toBeNull()
    expect(f.timezone).toBe('UTC')
  })

  it('NFR-5 rejects malformed payloads', () => {
    expect(() => parseForecast(null)).toThrow(ApiError)
    expect(() => parseForecast({ current: {} })).toThrow(ApiError)
    const bad = makeForecastResponse()
    bad.current.temperature_2m = Number.NaN
    expect(() => parseForecast(bad)).toThrow(/current.temperature_2m/)
  })
})

describe('FR-4 searchPlaces', () => {
  it('does not call the API for queries shorter than 2 characters', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(await searchPlaces(' b ')).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('queries the geocoding API and maps results', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(geocodingResponse))
    vi.stubGlobal('fetch', fetchMock)
    const places = await searchPlaces(' Berlin ')
    const url = new URL(fetchMock.mock.calls[0]?.[0] as string)
    expect(url.hostname).toBe('geocoding-api.open-meteo.com')
    expect(url.searchParams.get('name')).toBe('Berlin')
    expect(places).toHaveLength(2)
    expect(places[0]).toMatchObject({ id: 2950159, name: 'Berlin', country: 'Germany', admin1: 'Land Berlin' })
  })

  it('skips malformed results and handles "no results"', () => {
    expect(parsePlaces({ results: [{ id: 'x' }, geocodingResponse.results[0]] })).toHaveLength(1)
    expect(parsePlaces({ generationtime_ms: 1 })).toEqual([])
  })

  it('throws ApiError on HTTP errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: true }, 500)))
    await expect(fetchForecastData(1, 2)).rejects.toThrow('Request failed (500)')
  })
})
