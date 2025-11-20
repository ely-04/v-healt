import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PlantasMedicinales from './pages/PlantasMedicinales';
import Enfermedades from './pages/Enfermedades';
import Auth from './pages/Auth';
import AuthTest from './pages/AuthTest';
import Dashboard from './pages/Dashboard';
import AddFaceAuth from './pages/AddFaceAuth';
import ProtectedRoute from './components/ProtectedRoute';
import PanelCifrado from './components/PanelCifrado';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/plantas" element={<PlantasMedicinales />} />
              <Route path="/enfermedades" element={<Enfermedades />} />
              <Route path="/contacto" element={<div className="page-placeholder"><h2>Página de Contacto</h2><p>En desarrollo...</p></div>} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth-test" element={<AuthTest />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/add-face-auth" element={
                <ProtectedRoute>
                  <AddFaceAuth />
                </ProtectedRoute>
              } />
              {/* Ruta oculta para demostración de cifrado - Solo administradores */}
              <Route path="/admin/security-demo" element={
                <ProtectedRoute>
                  <PanelCifrado />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
