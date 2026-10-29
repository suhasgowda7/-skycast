import { describe, expect, it } from 'vitest'
import { compassDirection, formatTemp, formatWind, kmhToMph, toFahrenheit } from './units'
import { isCachedForecast, isPlace, isPlaceArray, isPlaceOrNull, isUnits } from './validators'
import { describeWeather } from './weatherCodes'

describe('FR-7 units', () => {
  it('converts Celsius to Fahrenheit', () => {
    expect(toFahrenheit(0)).toBe(32)
    expect(toFahrenheit(100)).toBe(212)
  })

  it('converts km/h to mph', () => {
    expect(kmhToMph(1.609344)).toBeCloseTo(1)
  })

  it('formats temperatures rounded, never as -0', () => {
    expect(formatTemp(12.3, 'C')).toBe('12°')
    expect(formatTemp(12.3, 'F')).toBe('54°')
    expect(formatTemp(-0.4, 'C')).toBe('0°')
  })

  it('formats wind speed in the chosen unit', () => {
    expect(formatWind(16.1, 'kmh')).toBe('16 km/h')
    expect(formatWind(16.1, 'mph')).toBe('10 mph')
  })

  it.each([
    [0, 'N'],
    [44, 'NE'],
    [225, 'SW'],
    [350, 'N'],
    [-90, 'W'],
    [720, 'N'],
  ])('maps %d° to %s', (deg, dir) => {
    expect(compassDirection(deg)).toBe(dir)
  })
})

describe('FR-1 weather codes', () => {
  it('describes known codes with day and night icons', () => {
    expect(describeWeather(0)).toEqual({ label: 'Clear sky', icon: '☀️' })
    expect(describeWeather(0, false)).toEqual({ label: 'Clear sky', icon: '🌙' })
    expect(describeWeather(3, false).icon).toBe('☁️') // no night variant → day icon
  })

  it('falls back for unknown codes', () => {
    expect(describeWeather(1234)).toEqual({ label: 'Unknown', icon: '❔' })
  })
})

describe('validators (threat model: storage tampering)', () => {
  const berlin = { id: 1, name: 'Berlin', latitude: 52.5, longitude: 13.4 }

  it('accepts valid places and rejects malformed ones', () => {
    expect(isPlace(berlin)).toBe(true)
    expect(isPlace({ ...berlin, country: 'Germany', admin1: 'Berlin' })).toBe(true)
    expect(isPlace({ ...berlin, latitude: 120 })).toBe(false)
    expect(isPlace({ ...berlin, name: 5 })).toBe(false)
    expect(isPlace({ ...berlin, country: 7 })).toBe(false)
    expect(isPlace(null)).toBe(false)
    expect(isPlace([berlin])).toBe(false)
  })

  it('validates place arrays and nullable places', () => {
    expect(isPlaceArray([berlin])).toBe(true)
    expect(isPlaceArray([berlin, {}])).toBe(false)
    expect(isPlaceOrNull(null)).toBe(true)
  })

  it('validates units', () => {
    expect(isUnits({ temp: 'F', wind: 'mph' })).toBe(true)
    expect(isUnits({ temp: 'K', wind: 'mph' })).toBe(false)
  })

  it('validates cached forecast envelopes', () => {
    expect(isCachedForecast({ latitude: 1, longitude: 2, fetchedAt: 3, data: {} })).toBe(true)
    expect(isCachedForecast({ latitude: 1, longitude: 2, fetchedAt: 3 })).toBe(false)
  })
})
