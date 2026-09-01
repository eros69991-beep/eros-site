const WORLD_RETURN_CONTEXT_KEY = 'eros-studio:world-return-context'

interface WorldReturnContext {
  pathname: string
  scrollY: number
  selector: string
}

export function rememberWorldReturnContext(selector: string) {
  if (typeof window === 'undefined') return

  const context: WorldReturnContext = {
    pathname: window.location.pathname,
    scrollY: window.scrollY,
    selector,
  }
  window.sessionStorage.setItem(WORLD_RETURN_CONTEXT_KEY, JSON.stringify(context))
}

export function consumeWorldReturnContext(pathname: string): WorldReturnContext | null {
  if (typeof window === 'undefined') return null

  const stored = window.sessionStorage.getItem(WORLD_RETURN_CONTEXT_KEY)
  if (!stored) return null
  window.sessionStorage.removeItem(WORLD_RETURN_CONTEXT_KEY)

  try {
    const context: unknown = JSON.parse(stored)
    if (!context || typeof context !== 'object') return null
    const candidate = context as Partial<WorldReturnContext>
    if (candidate.pathname !== pathname || typeof candidate.selector !== 'string' || typeof candidate.scrollY !== 'number') {
      return null
    }
    return candidate as WorldReturnContext
  } catch {
    return null
  }
}
