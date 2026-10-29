export type TempUnit = 'C' | 'F'
export type WindUnit = 'kmh' | 'mph'

export interface Units {
  temp: TempUnit
  wind: WindUnit
}

export interface Place {
  /** Geocoding id; 0 is reserved for "My location". */
  id: number
  name: string
  latitude: number
  longitude: number
  country?: string
  admin1?: string
}

export interface CurrentWeather {
  /** Local time of the location, e.g. "2026-10-29T14:15". */
  time: string
  temperature: number
  apparentTemperature: number
  humidity: number
  precipitation: number
  weatherCode: number
  windSpeed: number
  windDirection: number
  isDay: boolean
}

export interface HourlyPoint {
  time: string
  temperature: number
  precipitationProbability: number | null
  weatherCode: number
  isDay: boolean
}

export interface DailyPoint {
  /** Local date, e.g. "2026-10-29". */
  date: string
  min: number
  max: number
  weatherCode: number
  precipitationProbability: number | null
  sunrise: string
  sunset: string
}

export interface Forecast {
  timezone: string
  current: CurrentWeather
  hourly: HourlyPoint[]
  daily: DailyPoint[]
  /** Epoch ms when the data was fetched. */
  fetchedAt: number
}

export const MY_LOCATION_ID = 0
export const MAX_FAVOURITES = 10
export const DEFAULT_UNITS: Units = { temp: 'C', wind: 'kmh' }
