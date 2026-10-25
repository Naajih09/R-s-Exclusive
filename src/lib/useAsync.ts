import { useEffect, useState } from 'react'

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

/**
 * Runs `load` whenever its identity changes and ignores results from stale runs.
 * Wrap `load` in useCallback so it only changes when its inputs do.
 */
export function useAsync<T>(load: () => Promise<T>): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' })

  useEffect(() => {
    let active = true
    setState({ status: 'loading' })
    load().then(
      (data) => {
        if (active) setState({ status: 'success', data })
      },
      (error: unknown) => {
        if (active) {
          setState({
            status: 'error',
            error: error instanceof Error ? error : new Error(String(error)),
          })
        }
      },
    )
    return () => {
      active = false
    }
  }, [load])

  return state
}
