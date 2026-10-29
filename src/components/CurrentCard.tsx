import type { CurrentWeather, Place, Units } from '../domain/types'
import { compassDirection, formatTemp, formatWind } from '../domain/units'
import { describeWeather } from '../domain/weatherCodes'
import { placeSubtitle } from './placeLabel'

interface Props {
  place: Place
  current: CurrentWeather
  units: Units
  canFavourite: boolean
  isFavourite: boolean
  onToggleFavourite: () => void
}

export function CurrentCard({ place, current, units, canFavourite, isFavourite, onToggleFavourite }: Props) {
  const weather = describeWeather(current.weatherCode, current.isDay)
  const subtitle = placeSubtitle(place)

  return (
    <section className="card current" aria-labelledby="current-heading">
      <div className="current-head">
        <div>
          <h2 id="current-heading">{place.name}</h2>
          {subtitle && <p className="subtle">{subtitle}</p>}
        </div>
        {canFavourite && (
          <button
            type="button"
            className="icon-btn fav-btn"
            aria-label={isFavourite ? `Remove ${place.name} from favourites` : `Add ${place.name} to favourites`}
            onClick={onToggleFavourite}
          >
            <span aria-hidden="true">{isFavourite ? '★' : '☆'}</span>
          </button>
        )}
      </div>
      <div className="current-main">
        <span className="current-icon" aria-hidden="true">
          {weather.icon}
        </span>
        <span className="current-temp" data-testid="current-temp">
          {formatTemp(current.temperature, units.temp)}
        </span>
      </div>
      <p className="current-condition">{weather.label}</p>
      <dl className="stats">
        <div>
          <dt>Feels like</dt>
          <dd>{formatTemp(current.apparentTemperature, units.temp)}</dd>
        </div>
        <div>
          <dt>Humidity</dt>
          <dd>{Math.round(current.humidity)}%</dd>
        </div>
        <div>
          <dt>Wind</dt>
          <dd data-testid="current-wind">
            {formatWind(current.windSpeed, units.wind)} {compassDirection(current.windDirection)}
          </dd>
        </div>
        <div>
          <dt>Precipitation</dt>
          <dd>{current.precipitation} mm</dd>
        </div>
      </dl>
    </section>
  )
}
