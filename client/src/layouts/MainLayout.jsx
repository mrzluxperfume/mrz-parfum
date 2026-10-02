import { Outlet } from 'react-router-dom'
import TopBar from '../components/layout/TopBar'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import CookieConsent from '../components/CookieConsent'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  )
}
