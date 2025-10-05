import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { RoleBasedRoute } from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Toastify para notificaciones
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Páginas públicas
import Home from './pages/Home';
import Login from './pages/Login';

// Dashboards por rol
import AdminDashboard from './pages/Admin/Dashboard';
import DocenteDashboard from './pages/Docente/Dashboard';
import RRHHDashboard from './pages/RRHH/Dashboard';
import ContabilidadDashboard from './pages/Contabilidad/Dashboard';
import TIDashboard from './pages/TI/Dashboard';

// Módulos funcionales
import { DocumentsModule } from './modules/documents';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas - Admin */}
            <Route path="/admin/*" element={
              <RoleBasedRoute role="Administrador">
                <DashboardLayout />
              </RoleBasedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="documentos" element={<DocumentsModule />} />
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Rutas protegidas - Docente */}
            <Route path="/docente/*" element={
              <RoleBasedRoute role="Docente">
                <DashboardLayout />
              </RoleBasedRoute>
            }>
              <Route path="dashboard" element={<DocenteDashboard />} />
              <Route path="documentos" element={<DocumentsModule />} />
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Rutas protegidas - RRHH */}
            <Route path="/rrhh/*" element={
              <RoleBasedRoute role="RRHH">
                <DashboardLayout />
              </RoleBasedRoute>
            }>
              <Route path="dashboard" element={<RRHHDashboard />} />
              <Route path="documentos" element={<DocumentsModule />} />
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Rutas protegidas - Contabilidad */}
            <Route path="/contabilidad/*" element={
              <RoleBasedRoute role="Contabilidad">
                <DashboardLayout />
              </RoleBasedRoute>
            }>
              <Route path="dashboard" element={<ContabilidadDashboard />} />
              <Route path="documentos" element={<DocumentsModule />} />
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Rutas protegidas - TI */}
            <Route path="/ti/*" element={
              <RoleBasedRoute role="TI">
                <DashboardLayout />
              </RoleBasedRoute>
            }>
              <Route path="dashboard" element={<TIDashboard />} />
              <Route path="documentos" element={<DocumentsModule />} />
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Toast Container para notificaciones globales */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
