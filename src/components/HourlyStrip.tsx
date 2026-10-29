import type { HourlyPoint, Units } from '../domain/types'
import { formatTemp } from '../domain/units'
import { describeWeather } from '../domain/weatherCodes'

interface Props {
  hours: HourlyPoint[]
  units: Units
}

export function HourlyStrip({ hours, units }: Props) {
  return (
    <section className="card" aria-labelledby="hourly-heading">
      <h2 id="hourly-heading">Next 24 hours</h2>
      {/* Focusable so keyboard users can scroll the strip. */}
      <div className="hourly-scroll" tabIndex={0} role="region" aria-label="Hourly forecast, scrollable">
        <ol className="hourly">
          {hours.map((hour, i) => {
            const weather = describeWeather(hour.weatherCode, hour.isDay)
            return (
              <li key={hour.time} className="hour">
                <span className="hour-time">{i === 0 ? 'Now' : hour.time.slice(11, 16)}</span>
                <span className="hour-icon" aria-hidden="true">
                  {weather.icon}
                </span>
                <span className="visually-hidden">{weather.label}</span>
                <span className="hour-temp">{formatTemp(hour.temperature, units.temp)}</span>
                {hour.precipitationProbability !== null && (
                  <span className="hour-pop" aria-label={`${hour.precipitationProbability}% chance of precipitation`}>
                    {hour.precipitationProbability}%
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
