import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RestaurantProvider } from './contexts/RestaurantContext';
import { AuthProvider } from './contexts/AuthContext';
import { ClientApp } from './components/client/ClientApp';
import { KDSApp } from './components/kds/KDSApp';
import { AdminApp } from './components/admin/AdminApp';
import { CaixaApp } from './components/caixa/CaixaApp';
import { PainelApp } from './components/painel/PainelApp';
import { ReservationPage } from './components/reserva/ReservationPage';
import { ReceptionApp } from './components/recepcao/ReceptionApp';
import { WaiterApp } from './components/garcom/WaiterApp';
import { DeliveryApp } from './components/delivery/DeliveryApp';
import { DeliveryTracking } from './components/delivery/DeliveryTracking';
import { LandingPage } from './components/landing/LandingPage';
import { HomePage } from './components/HomePage';
import { SignupPage } from './components/auth/SignupPage';
import { LoginPage } from './components/auth/LoginPage';
import { AccountPage } from './components/auth/AccountPage';
import { PublicMenuPage } from './components/cardapio/PublicMenuPage';
import { Toaster } from './components/ui/Toaster';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RestaurantProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/cardapio" element={<PublicMenuPage />} />
                <Route path="/cadastro" element={<SignupPage />} />
                <Route path="/entrar" element={<LoginPage />} />
                <Route path="/conta" element={<AccountPage />} />
                <Route path="/salao" element={<HomePage />} />
                <Route path="/delivery" element={<DeliveryApp />} />
                <Route path="/delivery/pedido/:orderId" element={<DeliveryTracking />} />
                <Route path="/reserva" element={<ReservationPage />} />
                <Route path="/recepcao" element={<ReceptionApp />} />
                <Route path="/garcom" element={<WaiterApp />} />
                <Route path="/table/:tableToken" element={<ClientApp />} />
                <Route path="/kds" element={<KDSApp station="kitchen" />} />
                <Route path="/cambuza" element={<KDSApp station="cambuza" />} />
                <Route path="/caixa" element={<CaixaApp />} />
                <Route path="/painel" element={<PainelApp />} />
                <Route path="/admin" element={<AdminApp />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </RestaurantProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
