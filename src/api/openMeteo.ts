import type { CurrentWeather, DailyPoint, Forecast, HourlyPoint, Place } from '../domain/types'

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'

export class ApiError extends Error {
  override name = 'ApiError'
}

/** Coordinates are rounded to ~1 km before leaving the browser (privacy, see threat model). */
export const roundCoord = (value: number): number => Math.round(value * 100) / 100

export function buildForecastUrl(latitude: number, longitude: number): string {
  const params = new URLSearchParams({
    latitude: String(roundCoord(latitude)),
    longitude: String(roundCoord(longitude)),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day',
    hourly: 'temperature_2m,precipitation_probability,weather_code,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
    timezone: 'auto',
    forecast_days: '7',
  })
  return `${FORECAST_URL}?${params}`
}

export function buildSearchUrl(query: string): string {
  const params = new URLSearchParams({ name: query, count: '8', language: 'en', format: 'json' })
  return `${GEOCODING_URL}?${params}`
}

// --- runtime validation helpers -------------------------------------------------

function obj(v: unknown, what: string): Record<string, unknown> {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new ApiError(`Invalid ${what}`)
  return v as Record<string, unknown>
}

function num(v: unknown, what: string): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new ApiError(`Invalid ${what}`)
  return v
}

function str(v: unknown, what: string): string {
  if (typeof v !== 'string') throw new ApiError(`Invalid ${what}`)
  return v
}

function arr(v: unknown, what: string): unknown[] {
  if (!Array.isArray(v)) throw new ApiError(`Invalid ${what}`)
  return v
}

const numOrNull = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const optStr = (v: unknown): string | undefined => (typeof v === 'string' && v !== '' ? v : undefined)

// --- parsing ---------------------------------------------------------------------

export function parseForecast(data: unknown, fetchedAt: number = Date.now()): Forecast {
  const root = obj(data, 'response')
  const c = obj(root.current, 'current')
  const h = obj(root.hourly, 'hourly')
  const d = obj(root.daily, 'daily')

  const current: CurrentWeather = {
    time: str(c.time, 'current.time'),
    temperature: num(c.temperature_2m, 'current.temperature_2m'),
    apparentTemperature: num(c.apparent_temperature, 'current.apparent_temperature'),
    humidity: num(c.relative_humidity_2m, 'current.relative_humidity_2m'),
    precipitation: num(c.precipitation, 'current.precipitation'),
    weatherCode: num(c.weather_code, 'current.weather_code'),
    windSpeed: num(c.wind_speed_10m, 'current.wind_speed_10m'),
    windDirection: num(c.wind_direction_10m, 'current.wind_direction_10m'),
    isDay: c.is_day === 1,
  }

  const hTemp = arr(h.temperature_2m, 'hourly.temperature_2m')
  const hCode = arr(h.weather_code, 'hourly.weather_code')
  const hPop = Array.isArray(h.precipitation_probability) ? h.precipitation_probability : []
  const hDay = Array.isArray(h.is_day) ? h.is_day : []
  const allHours: HourlyPoint[] = arr(h.time, 'hourly.time').map((t, i) => ({
    time: str(t, 'hourly.time'),
    temperature: num(hTemp[i], 'hourly.temperature_2m'),
    precipitationProbability: numOrNull(hPop[i]),
    weatherCode: num(hCode[i], 'hourly.weather_code'),
    isDay: hDay[i] !== 0,
  }))

  // Next 24 hours, starting with the hour that contains "now" (times are location-local strings).
  const currentHour = current.time.slice(0, 13)
  const startIndex = Math.max(
    0,
    allHours.findIndex((p) => p.time.slice(0, 13) >= currentHour),
  )
  const hourly = allHours.slice(startIndex, startIndex + 24)

  const dMax = arr(d.temperature_2m_max, 'daily.temperature_2m_max')
  const dMin = arr(d.temperature_2m_min, 'daily.temperature_2m_min')
  const dCode = arr(d.weather_code, 'daily.weather_code')
  const dPop = Array.isArray(d.precipitation_probability_max) ? d.precipitation_probability_max : []
  const dRise = arr(d.sunrise, 'daily.sunrise')
  const dSet = arr(d.sunset, 'daily.sunset')
  const daily: DailyPoint[] = arr(d.time, 'daily.time').map((t, i) => ({
    date: str(t, 'daily.time'),
    max: num(dMax[i], 'daily.temperature_2m_max'),
    min: num(dMin[i], 'daily.temperature_2m_min'),
    weatherCode: num(dCode[i], 'daily.weather_code'),
    precipitationProbability: numOrNull(dPop[i]),
    sunrise: str(dRise[i], 'daily.sunrise'),
    sunset: str(dSet[i], 'daily.sunset'),
  }))

  return {
    timezone: typeof root.timezone === 'string' ? root.timezone : 'UTC',
    current,
    hourly,
    daily,
    fetchedAt,
  }
}

export function parsePlaces(data: unknown): Place[] {
  const root = obj(data, 'response')
  if (!Array.isArray(root.results)) return []
  return root.results.flatMap((r): Place[] => {
    try {
      const o = obj(r, 'result')
      return [
        {
          id: num(o.id, 'id'),
          name: str(o.name, 'name'),
          latitude: num(o.latitude, 'latitude'),
          longitude: num(o.longitude, 'longitude'),
          country: optStr(o.country),
          admin1: optStr(o.admin1),
        },
      ]
    } catch {
      return [] // skip malformed entries rather than failing the whole search
    }
  })
}

// --- fetching --------------------------------------------------------------------

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new ApiError(`Request failed (${response.status})`)
  return response.json()
}

/** Returns the raw (unvalidated) forecast payload so it can be cached as-is. */
export const fetchForecastData = (latitude: number, longitude: number, signal?: AbortSignal): Promise<unknown> =>
  getJson(buildForecastUrl(latitude, longitude), signal)

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const q = query.trim()
  if (q.length < 2) return []
  return parsePlaces(await getJson(buildSearchUrl(q), signal))
}
