import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { reloadOnceForStaleBuild } from './app/staleBuildRecovery'

// 新版本部署后，旧页面加载不到旧的代码文件：刷新一次换成新版本
window.addEventListener('vite:preloadError', (event) => {
  if (reloadOnceForStaleBuild()) event.preventDefault()
})

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root application mount')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
