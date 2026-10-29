import type { TempUnit, WindUnit } from './types'

export const toFahrenheit = (celsius: number): number => (celsius * 9) / 5 + 32
export const kmhToMph = (kmh: number): number => kmh / 1.609344

/** Rounds without ever producing "-0". */
const roundClean = (value: number): number => Math.round(value) || 0

export function formatTemp(celsius: number, unit: TempUnit): string {
  return `${roundClean(unit === 'F' ? toFahrenheit(celsius) : celsius)}°`
}

export function formatWind(kmh: number, unit: WindUnit): string {
  return unit === 'mph' ? `${roundClean(kmhToMph(kmh))} mph` : `${roundClean(kmh)} km/h`
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const

export function compassDirection(degrees: number): string {
  const normalised = ((degrees % 360) + 360) % 360
  return COMPASS[Math.round(normalised / 45) % 8] ?? 'N'
}
