/// <reference types="vite/client" />

interface Window {
  __EROS_TEST_API__?: {
    setSceneTime(seconds: number): void
    triggerSceneError?: () => void
  }
}
