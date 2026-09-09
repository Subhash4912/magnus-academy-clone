import { useCallback, useEffect, useRef, useState } from 'react'

const initialState = { data: null, loading: false, error: null, success: false }

function useAsync() {
  const [state, setState] = useState(initialState)
  const latestRequest = useRef(0)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      latestRequest.current += 1
    }
  }, [])

  // Explicit execution only. Newer requests/reset/unmount invalidate older state updates.
  const execute = useCallback(async (request, ...args) => {
    const id = ++latestRequest.current
    if (mounted.current) setState({ ...initialState, loading: true })
    try {
      const data = await request(...args)
      if (mounted.current && id === latestRequest.current) {
        setState({ data, loading: false, error: null, success: true })
      }
      return data
    } catch (error) {
      if (mounted.current && id === latestRequest.current) {
        setState({ ...initialState, error })
      }
      throw error // The caller must handle rejection; errors are never silently swallowed.
    }
  }, [])

  const reset = useCallback(() => {
    latestRequest.current += 1
    if (mounted.current) setState(initialState)
  }, [])

  return { ...state, execute, reset }
}

export default useAsync
