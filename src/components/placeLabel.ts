import type { Place } from '../domain/types'

export const placeSubtitle = (place: Place): string =>
  [place.admin1, place.country].filter((part) => part && part !== place.name).join(', ')
