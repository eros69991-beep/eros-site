import {
  createBrowserRouter,
  createMemoryRouter,
  RouterProvider,
  type RouteObject,
} from 'react-router-dom'
import { ArchivePage } from '../features/archive/ArchivePage'
import { BagPage } from '../features/bag/BagPage'
import { HomePage } from '../features/home/HomePage'
import { NotFoundPage } from '../features/not-found/NotFoundPage'
import { ProductPage } from '../features/product/ProductPage'
import { SearchPage } from '../features/search/SearchPage'
import { StudioPage } from '../features/studio/StudioPage'
import { WorldPage } from '../features/worlds/WorldPage'
import { AppShell } from './AppShell'

const routes: RouteObject[] = [
  {
    path: '/*',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'world/:worldId', element: <WorldPage /> },
      { path: 'studio', element: <StudioPage /> },
      { path: 'archive', element: <ArchivePage /> },
      { path: 'product/:slug', element: <ProductPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'bag', element: <BagPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

const browserRouter = createBrowserRouter(routes)

export function AppRouter() {
  return <RouterProvider router={browserRouter} />
}

export function TestRouter({ initialEntries }: { initialEntries: string[] }) {
  const router = createMemoryRouter(routes, { initialEntries })
  return <RouterProvider router={router} />
}
