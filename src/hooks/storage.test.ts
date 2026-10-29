import { describe, expect, it, vi } from 'vitest'
import { isUnits } from '../domain/validators'
import { DEFAULT_UNITS } from '../domain/types'
import { makeForecastResponse } from '../test/fixtures'
import { readJSON, writeJSON } from './storage'
import { FORECAST_CACHE_KEY, readCachedForecast } from './useForecast'

describe('readJSON / writeJSON', () => {
  it('round-trips valid values', () => {
    writeJSON('k', { temp: 'F', wind: 'mph' })
    expect(readJSON('k', isUnits, DEFAULT_UNITS)).toEqual({ temp: 'F', wind: 'mph' })
  })

  it('falls back on missing, corrupted or invalid data', () => {
    expect(readJSON('missing', isUnits, DEFAULT_UNITS)).toBe(DEFAULT_UNITS)
    localStorage.setItem('k', '{not json')
    expect(readJSON('k', isUnits, DEFAULT_UNITS)).toBe(DEFAULT_UNITS)
    localStorage.setItem('k', JSON.stringify({ temp: 'K' }))
    expect(readJSON('k', isUnits, DEFAULT_UNITS)).toBe(DEFAULT_UNITS)
  })

  it('swallows storage errors', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError')
    })
    expect(() => writeJSON('k', 1)).not.toThrow()
  })
})

describe('readCachedForecast', () => {
  it('returns the cached forecast only for the same coordinates', () => {
    writeJSON(FORECAST_CACHE_KEY, { latitude: 52.52, longitude: 13.41, fetchedAt: 42, data: makeForecastResponse() })
    expect(readCachedForecast(52.52, 13.41)?.fetchedAt).toBe(42)
    expect(readCachedForecast(48.85, 2.35)).toBeNull()
  })

  it('ignores tampered cache payloads', () => {
    writeJSON(FORECAST_CACHE_KEY, { latitude: 1, longitude: 2, fetchedAt: 42, data: { current: 'oops' } })
    expect(readCachedForecast(1, 2)).toBeNull()
  })
})
