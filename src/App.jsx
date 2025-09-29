import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PlantasMedicinales from './pages/PlantasMedicinales';
import Enfermedades from './pages/Enfermedades';
import Hero from './components/Hero';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plantas" element={<PlantasMedicinales />} />
            <Route path="/enfermedades" element={<Enfermedades />} />
            <Route path="/contacto" element={<div className="page-placeholder"><h2>Página de Contacto</h2><p>En desarrollo...</p></div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
