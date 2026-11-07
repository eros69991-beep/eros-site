import { Component, type ReactNode } from 'react'
import { isStaleChunkError, reloadOnceForStaleBuild } from '../app/staleBuildRecovery'

interface SceneErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode
  resetKey: string | number
}

interface SceneErrorBoundaryState {
  error: Error | null
}

export class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): SceneErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error) {
    // 季节场景的代码文件是旧版本留下的地址：刷新一次即可，不用让访客看到错误框
    if (isStaleChunkError(error)) reloadOnceForStaleBuild()
  }

  componentDidUpdate(previousProps: SceneErrorBoundaryProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error !== null) {
      this.setState({ error: null })
    }
  }

  render() {
    return this.state.error === null ? this.props.children : this.props.fallback
  }
}
