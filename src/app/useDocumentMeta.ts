import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { getObject, getWorld } from '../domain/selectors'

export const DEFAULT_DOCUMENT_TITLE = 'EROS STUDIO'

export function getDocumentTitle(pathname: string) {
  if (pathname === '/') return DEFAULT_DOCUMENT_TITLE
  if (pathname === '/archive') return 'ARCHIVE / ALL OBJECTS — EROS'
  if (pathname === '/studio') return 'THE STUDIO — EROS'
  if (pathname === '/search') return 'SEARCH — EROS'
  if (pathname === '/bag') return 'BAG — EROS'

  const worldMatch = /^\/world\/(spring|summer|autumn|winter)\/?$/.exec(pathname)
  if (worldMatch) {
    const world = getWorld(worldMatch[1] as 'spring' | 'summer' | 'autumn' | 'winter')
    return `${world.season} / ${world.concept} — EROS`
  }

  const productMatch = /^\/product\/([^/]+)\/?$/.exec(pathname)
  if (productMatch) {
    const object = getObject(productMatch[1]!)
    if (object) return `${object.name.toUpperCase()} — EROS`
  }

  return DEFAULT_DOCUMENT_TITLE
}

export function useDocumentMeta() {
  const { pathname } = useLocation()
  const title = useMemo(() => getDocumentTitle(pathname), [pathname])

  useEffect(() => {
    document.title = title
    return () => {
      document.title = DEFAULT_DOCUMENT_TITLE
    }
  }, [title])
}
