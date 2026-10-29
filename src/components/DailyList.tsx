import type { DailyPoint, Units } from '../domain/types'
import { formatTemp } from '../domain/units'
import { describeWeather } from '../domain/weatherCodes'

const weekday = new Intl.DateTimeFormat('en', { weekday: 'long', timeZone: 'UTC' })

/** Dates are location-local "YYYY-MM-DD" strings, so format them as UTC to avoid shifting the day. */
export const dayName = (date: string, index: number): string =>
  index === 0 ? 'Today' : weekday.format(new Date(`${date}T00:00:00Z`))

interface Props {
  days: DailyPoint[]
  units: Units
}

export function DailyList({ days, units }: Props) {
  return (
    <section className="card" aria-labelledby="daily-heading">
      <h2 id="daily-heading">7-day forecast</h2>
      <ul className="daily">
        {days.map((day, i) => {
          const weather = describeWeather(day.weatherCode)
          return (
            <li key={day.date} className="day">
              <span className="day-name">{dayName(day.date, i)}</span>
              <span className="day-icon" aria-hidden="true">
                {weather.icon}
              </span>
              <span className="day-condition">{weather.label}</span>
              <span className="day-pop">
                {day.precipitationProbability !== null && (
                  <>
                    <span className="visually-hidden">Chance of precipitation </span>
                    {day.precipitationProbability}%
                  </>
                )}
              </span>
              <span className="day-temps">
                <span className="visually-hidden">Low </span>
                <span className="day-min">{formatTemp(day.min, units.temp)}</span>
                <span aria-hidden="true"> / </span>
                <span className="visually-hidden">, high </span>
                <span className="day-max">{formatTemp(day.max, units.temp)}</span>
              </span>
              <span className="day-sun">
                <span aria-hidden="true">↑</span>
                <span className="visually-hidden">Sunrise </span>
                {day.sunrise.slice(11, 16)} <span aria-hidden="true">↓</span>
                <span className="visually-hidden">Sunset </span>
                {day.sunset.slice(11, 16)}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
