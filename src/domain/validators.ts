import type { Place, Units } from './types'

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

const isOptionalString = (v: unknown): boolean => v === undefined || typeof v === 'string'

export function isPlace(v: unknown): v is Place {
  return (
    isObject(v) &&
    isFiniteNumber(v.id) &&
    typeof v.name === 'string' &&
    isFiniteNumber(v.latitude) &&
    Math.abs(v.latitude) <= 90 &&
    isFiniteNumber(v.longitude) &&
    Math.abs(v.longitude) <= 180 &&
    isOptionalString(v.country) &&
    isOptionalString(v.admin1)
  )
}

export const isPlaceOrNull = (v: unknown): v is Place | null => v === null || isPlace(v)

export const isPlaceArray = (v: unknown): v is Place[] => Array.isArray(v) && v.every(isPlace)

export const isUnits = (v: unknown): v is Units =>
  isObject(v) && (v.temp === 'C' || v.temp === 'F') && (v.wind === 'kmh' || v.wind === 'mph')

export interface CachedForecast {
  latitude: number
  longitude: number
  fetchedAt: number
  /** Raw API payload; re-validated by parseForecast when read. */
  data: unknown
}

export const isCachedForecast = (v: unknown): v is CachedForecast =>
  isObject(v) && isFiniteNumber(v.latitude) && isFiniteNumber(v.longitude) && isFiniteNumber(v.fetchedAt) && 'data' in v
