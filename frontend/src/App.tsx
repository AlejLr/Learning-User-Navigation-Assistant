import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { PortfolioLayout } from './portfolio/PortfolioLayout'
import { HomePage } from './portfolio/HomePage'
import { ProjectsPage } from './portfolio/ProjectsPage'
import { ProjectPage } from './portfolio/ProjectPage'
import { ChatPage } from './ChatPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PortfolioLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectPage />} />
        </Route>
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
      <SpeedInsights />
    </BrowserRouter>
  )
}
