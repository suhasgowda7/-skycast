/** Builds an Open-Meteo forecast payload shaped like the real API (Berlin, 29 Oct 2026, 14:15 local). */
export function makeForecastResponse(overrides: { temperature?: number } = {}) {
  const start = Date.UTC(2026, 9, 29, 0)
  const hourTimes = Array.from({ length: 168 }, (_, i) => new Date(start + i * 3_600_000).toISOString().slice(0, 16))
  const dates = Array.from({ length: 7 }, (_, i) => new Date(start + i * 86_400_000).toISOString().slice(0, 10))

  return {
    latitude: 52.52,
    longitude: 13.41,
    timezone: 'Europe/Berlin',
    current: {
      time: '2026-10-29T14:15',
      temperature_2m: overrides.temperature ?? 12.3,
      apparent_temperature: 10.1,
      relative_humidity_2m: 70,
      precipitation: 0.2,
      weather_code: 61,
      wind_speed_10m: 16.1,
      wind_direction_10m: 225,
      is_day: 1,
    },
    hourly: {
      time: hourTimes,
      temperature_2m: hourTimes.map((_, i) => 8 + (i % 24) / 2),
      precipitation_probability: hourTimes.map((_, i) => (i * 7) % 100),
      weather_code: hourTimes.map((_, i) => (i % 2 === 0 ? 3 : 61)),
      is_day: hourTimes.map((_, i) => (i % 24 >= 7 && i % 24 < 17 ? 1 : 0)),
    },
    daily: {
      time: dates,
      weather_code: dates.map(() => 63),
      temperature_2m_max: dates.map((_, i) => 14 + i),
      temperature_2m_min: dates.map((_, i) => 5 + i),
      precipitation_probability_max: dates.map((_, i) => i * 10),
      sunrise: dates.map((d) => `${d}T07:05`),
      sunset: dates.map((d) => `${d}T16:40`),
    },
  }
}

export const geocodingResponse = {
  results: [
    { id: 2950159, name: 'Berlin', latitude: 52.52437, longitude: 13.41053, country: 'Germany', admin1: 'Land Berlin' },
    { id: 4517009, name: 'Berlin', latitude: 39.79, longitude: -84.18, country: 'United States', admin1: 'Ohio' },
  ],
}
