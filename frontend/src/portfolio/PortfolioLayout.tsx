import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ChatWidget } from '../components/ChatWidget'
import '../portfolio.css'

export function PortfolioLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <ChatWidget />
    </>
  )
}
