/**
 * 部署新版本后，旧标签页里记着的代码文件名（带哈希）在服务器上已经不存在了。
 * 这时动态加载季节场景会失败。遇到这种情况就刷新一次页面，拿到新版本；
 * 用 sessionStorage 记下刷新时间，30 秒内不重复刷新，避免真出错时陷入刷新循环。
 */
const RELOAD_KEY = 'eros:stale-build-reload-at'
const RELOAD_COOLDOWN_MS = 30_000

const STALE_CHUNK_PATTERNS = [
  /Failed to fetch dynamically imported module/i, // Chrome
  /Importing a module script failed/i, // Safari
  /error loading dynamically imported module/i, // Firefox
  /Unable to preload CSS/i, // Vite
  /'text\/html' is not a valid JavaScript MIME type/i,
]

export function isStaleChunkError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return STALE_CHUNK_PATTERNS.some((pattern) => pattern.test(message))
}

interface ReloadEnvironment {
  storage?: Pick<Storage, 'getItem' | 'setItem'> | null
  now?: () => number
  reload?: () => void
}

function browserStorage() {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

/** 刷新一次页面；冷却期内已经刷新过则不刷新，返回 false。 */
export function reloadOnceForStaleBuild({
  storage = browserStorage(),
  now = Date.now,
  reload = () => window.location.reload(),
}: ReloadEnvironment = {}) {
  const last = Number(storage?.getItem(RELOAD_KEY) ?? 0)
  if (now() - last < RELOAD_COOLDOWN_MS) return false
  try {
    storage?.setItem(RELOAD_KEY, String(now()))
  } catch {
    // 无痕模式等情况下存不了，照样刷新
  }
  reload()
  return true
}
