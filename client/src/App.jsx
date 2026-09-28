import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CatalogProvider } from './context/CatalogContext'
import { CollectionsProvider } from './context/CollectionsContext'
import { CartProvider } from './context/CartContext'
import { OrdersProvider } from './context/OrdersContext'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import BlogPage from './pages/BlogPage'
import CollectionsPage from './pages/CollectionsPage'
import ShopPage from './pages/ShopPage'
import CartPage from './pages/CartPage'
import FindPerfumePage from './pages/FindPerfumePage'
import PlaceholderPage from './pages/PlaceholderPage'
import ProductPage from './pages/ProductPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminCollectionsPage from './pages/admin/AdminCollectionsPage'

export default function App() {
  return (
    <AuthProvider>
      <CatalogProvider>
        <CollectionsProvider>
        <OrdersProvider>
          <CartProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="admin/login" element={<AdminLoginPage />} />
                <Route path="admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="collections" element={<AdminCollectionsPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                </Route>

                <Route element={<MainLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="trouver-mon-parfum" element={<FindPerfumePage />} />
                  <Route path="shop" element={<ShopPage />} />
                  <Route path="product/:slug" element={<ProductPage />} />
                  <Route
                    path="collection/:slug"
                    element={<CategoryPage mode="collection" />}
                  />
                  <Route
                    path="category/:slug"
                    element={<CategoryPage mode="category" />}
                  />
                  <Route path="collections" element={<CollectionsPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="blog" element={<BlogPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route
                    path="account"
                    element={
                      <PlaceholderPage title="Compte" description="Phase 9." />
                    }
                  />
                  <Route path="faq" element={<PlaceholderPage title="FAQ" />} />
                  <Route
                    path="terms"
                    element={<PlaceholderPage title="Conditions générales" />}
                  />
                  <Route
                    path="privacy"
                    element={
                      <PlaceholderPage title="Politique de confidentialité" />
                    }
                  />
                </Route>
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </OrdersProvider>
        </CollectionsProvider>
      </CatalogProvider>
    </AuthProvider>
  )
}
