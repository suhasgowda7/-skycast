import type { Place } from '../domain/types'

interface Props {
  favourites: Place[]
  currentId: number | null
  onSelect: (place: Place) => void
  onRemove: (id: number) => void
}

export function Favourites({ favourites, currentId, onSelect, onRemove }: Props) {
  return (
    <nav className="favourites" aria-label="Favourite cities">
      {favourites.length === 0 ? (
        <p className="subtle">Tap ☆ on a city to save it here.</p>
      ) : (
        <ul>
          {favourites.map((place) => (
            <li key={place.id} className="chip">
              <button
                type="button"
                className="chip-main"
                aria-current={place.id === currentId ? 'true' : undefined}
                onClick={() => onSelect(place)}
              >
                {place.name}
              </button>
              <button
                type="button"
                className="chip-remove"
                aria-label={`Remove ${place.name} from favourites`}
                onClick={() => onRemove(place.id)}
              >
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}
