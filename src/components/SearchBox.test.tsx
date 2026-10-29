import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Place } from '../domain/types'
import { SearchBox } from './SearchBox'

const places: Place[] = [
  { id: 1, name: 'Paris', latitude: 48.85, longitude: 2.35, country: 'France', admin1: 'Île-de-France' },
  { id: 2, name: 'Paris', latitude: 33.66, longitude: -95.55, country: 'United States', admin1: 'Texas' },
]

function setup(search = vi.fn().mockResolvedValue(places)) {
  const onSelect = vi.fn()
  render(<SearchBox onSelect={onSelect} search={search} debounceMs={0} />)
  return { onSelect, search, user: userEvent.setup(), input: screen.getByRole('combobox', { name: /search for a city/i }) }
}

describe('FR-4 SearchBox', () => {
  it('shows results and selects with the keyboard', async () => {
    const { onSelect, search, user, input } = setup()
    await user.type(input, 'Par')
    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(2)
    expect(search).toHaveBeenLastCalledWith('Par', expect.any(AbortSignal))
    expect(input).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(options[1]).toHaveAttribute('aria-selected', 'true')
    expect(input).toHaveAttribute('aria-activedescendant', options[1]?.id)
    await user.keyboard('{ArrowUp}')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{Enter}')

    expect(onSelect).toHaveBeenCalledWith(places[0])
    expect(input).toHaveValue('')
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('selects with the mouse', async () => {
    const { onSelect, user, input } = setup()
    await user.type(input, 'Paris')
    await user.click((await screen.findAllByText('Paris'))[1]!)
    expect(onSelect).toHaveBeenCalledWith(places[1])
  })

  it('wraps ArrowUp to the last result and closes on Escape', async () => {
    const { user, input } = setup()
    await user.type(input, 'Pa')
    const options = await screen.findAllByRole('option')
    await user.keyboard('{ArrowUp}')
    expect(options[1]).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('does not search for a single character', async () => {
    const { search, user, input } = setup()
    await user.type(input, 'P')
    expect(search).not.toHaveBeenCalled()
  })

  it('shows a "no results" message', async () => {
    const { user, input } = setup(vi.fn().mockResolvedValue([]))
    await user.type(input, 'Zzzz')
    expect(await screen.findByText('No places found for “Zzzz”.')).toBeInTheDocument()
  })

  it('shows an error message when search fails', async () => {
    const { user, input } = setup(vi.fn().mockRejectedValue(new Error('offline')))
    await user.type(input, 'Rome')
    expect(await screen.findByText(/search failed/i)).toBeInTheDocument()
  })
})
