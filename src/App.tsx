import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RestaurantProvider } from './contexts/RestaurantContext';
import { ClientApp } from './components/client/ClientApp';
import { KDSApp } from './components/kds/KDSApp';
import { AdminApp } from './components/admin/AdminApp';
import { HomePage } from './components/HomePage';
import { Toaster } from './components/ui/Toaster';

function App() {
  return (
    <RestaurantProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/table/:tableToken" element={<ClientApp />} />
            <Route path="/kds" element={<KDSApp />} />
            <Route path="/admin" element={<AdminApp />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </RestaurantProvider>
  );
}

export default App;