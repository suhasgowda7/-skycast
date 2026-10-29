import { useEffect, useState } from 'react'

export function readJSON<T>(key: string, validate: (v: unknown) => v is T, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const value: unknown = JSON.parse(raw)
    return validate(value) ? value : fallback
  } catch {
    return fallback // blocked storage or corrupted JSON
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable (private mode): persistence is best-effort.
  }
}

export function useLocalStorage<T>(key: string, validate: (v: unknown) => v is T, fallback: T) {
  const [value, setValue] = useState<T>(() => readJSON(key, validate, fallback))
  useEffect(() => writeJSON(key, value), [key, value])
  return [value, setValue] as const
}
