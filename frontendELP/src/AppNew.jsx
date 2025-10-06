import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LayoutProvider } from './context/LayoutContext';

// Layout principal
import MainLayout from './components/layout/MainLayout';

// Páginas
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import Profile from './pages/Profile';

/**
 * Componente App principal del Sistema ELP Pontificia
 * Configuración de routing y providers globales
 */
function App() {
  return (
    <AuthProvider>
      <LayoutProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Ruta pública - Home */}
              <Route path="/" element={<Home />} />
              
              {/* Ruta de login */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Rutas protegidas con layout */}
              <Route path="/dashboard/*" element={
                <MainLayout>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </MainLayout>
              } />

              {/* Ruta por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </LayoutProvider>
    </AuthProvider>
  );
}

export default App;