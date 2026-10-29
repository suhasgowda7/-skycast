import type { Units } from '../domain/types'

interface Props {
  units: Units
  onChange: (units: Units) => void
}

export function UnitToggle({ units, onChange }: Props) {
  return (
    <div className="unit-toggles">
      <div className="segmented" role="group" aria-label="Temperature unit">
        <button type="button" aria-pressed={units.temp === 'C'} onClick={() => onChange({ ...units, temp: 'C' })}>
          °C
        </button>
        <button type="button" aria-pressed={units.temp === 'F'} onClick={() => onChange({ ...units, temp: 'F' })}>
          °F
        </button>
      </div>
      <div className="segmented" role="group" aria-label="Wind speed unit">
        <button type="button" aria-pressed={units.wind === 'kmh'} onClick={() => onChange({ ...units, wind: 'kmh' })}>
          km/h
        </button>
        <button type="button" aria-pressed={units.wind === 'mph'} onClick={() => onChange({ ...units, wind: 'mph' })}>
          mph
        </button>
      </div>
    </div>
  )
}
