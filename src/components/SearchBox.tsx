import { useEffect, useId, useState, type KeyboardEvent } from 'react'
import { searchPlaces } from '../api/openMeteo'
import type { Place } from '../domain/types'
import { placeSubtitle } from './placeLabel'

type SearchStatus = 'idle' | 'loading' | 'done' | 'error'

interface Props {
  onSelect: (place: Place) => void
  search?: (query: string, signal: AbortSignal) => Promise<Place[]>
  debounceMs?: number
}

export function SearchBox({ onSelect, search = searchPlaces, debounceMs = 300 }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const inputId = useId()
  const listId = useId()

  const trimmed = query.trim()
  const searchable = trimmed.length >= 2

  useEffect(() => {
    if (trimmed.length < 2) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setStatus('loading')
      search(trimmed, controller.signal)
        .then((places) => {
          setResults(places)
          setActive(-1)
          setStatus('done')
        })
        .catch(() => {
          if (!controller.signal.aborted) setStatus('error')
        })
    }, debounceMs)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [trimmed, search, debounceMs])

  const visible = open && searchable && status === 'done'
  const showList = visible && results.length > 0

  function choose(place: Place) {
    onSelect(place)
    setQuery('')
    setResults([])
    setStatus('idle')
    setOpen(false)
    setActive(-1)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault()
      setOpen(true)
      setActive((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp' && results.length > 0) {
      e.preventDefault()
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1))
    } else if (e.key === 'Enter') {
      const place = results[active >= 0 ? active : 0]
      if (showList && place) {
        e.preventDefault()
        choose(place)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActive(-1)
    }
  }

  let message = ''
  if (open && searchable) {
    if (status === 'loading') message = 'Searching…'
    else if (status === 'error') message = 'Search failed. Check your connection and try again.'
    else if (status === 'done' && results.length === 0) message = `No places found for “${trimmed}”.`
  }

  return (
    <div className="search">
      <label htmlFor={inputId} className="visually-hidden">
        Search for a city
      </label>
      <input
        id={inputId}
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
        placeholder="Search for a city…"
        autoComplete="off"
        spellCheck={false}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      <ul id={listId} role="listbox" aria-label="Search results" className="search-results" hidden={!showList}>
        {showList &&
          results.map((place, i) => (
            <li
              key={place.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className="search-option"
              // mousedown keeps focus in the input so onBlur doesn't close the list before click
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(place)}
            >
              <span className="search-option-name">{place.name}</span>
              <span className="search-option-sub">{placeSubtitle(place)}</span>
            </li>
          ))}
      </ul>
      <p className="search-message" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  )
}
