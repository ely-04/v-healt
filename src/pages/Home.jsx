
import React, { useState } from 'react';
import Hero from '../components/Hero';

import plantasDiseno from '../assets/plantasdiseño.png';
import { useNavigate } from 'react-router-dom';
import manzanillaImg from '../assets/manzanilla.jpg';
import jengibreImg from '../assets/jengibre.jpg';
import aloeImg from '../assets/aloe.jpg';
import eucaliptoImg from '../assets/eucalipto.jpg';
import lavandaImg from '../assets/lavanda.jpg';

const plantas = [
  {
    id: 1,
    nombre: 'Manzanilla',
    nombreCientifico: 'Matricaria chamomilla',
    imagen: manzanillaImg,
    propiedades: ['Antiinflamatoria', 'Calmante', 'Digestiva'],
    usos: ['Indigestión', 'Insomnio', 'Ansiedad', 'Irritación de piel'],
    preparacion: 'Infusión: 1 cucharada de flores secas por taza de agua caliente. Dejar reposar 5-10 minutos.',
    precauciones: 'Evitar en caso de alergia a plantas de la familia Asteraceae.'
  },
  {
    id: 2,
    nombre: 'Jengibre',
    nombreCientifico: 'Zingiber officinale',
    imagen: jengibreImg,
    propiedades: ['Antiemético', 'Antiinflamatorio', 'Digestivo'],
    usos: ['Náuseas', 'Mareos', 'Indigestión', 'Dolor muscular'],
    preparacion: 'Té: Hervir 2-3 rodajas de jengibre fresco en agua por 10 minutos.',
    precauciones: 'Consultar médico si tomas anticoagulantes. Moderar en embarazo.'
  },
  {
    id: 3,
    nombre: 'Aloe Vera',
    nombreCientifico: 'Aloe barbadensis',
    imagen: aloeImg,
    propiedades: ['Cicatrizante', 'Hidratante', 'Antiinflamatoria'],
    usos: ['Quemaduras menores', 'Heridas', 'Piel seca', 'Eczema'],
    preparacion: 'Aplicar gel directamente sobre la piel limpia 2-3 veces al día.',
    precauciones: 'No consumir internamente sin supervisión médica.'
  },
  {
    id: 4,
    nombre: 'Eucalipto',
    nombreCientifico: 'Eucalyptus globulus',
    imagen: eucaliptoImg,
    propiedades: ['Expectorante', 'Antiséptico', 'Descongestionante'],
    usos: ['Resfriado', 'Bronquitis', 'Sinusitis', 'Dolor muscular'],
    preparacion: 'Vaporizaciones: 5-10 gotas de aceite esencial en agua caliente.',
    precauciones: 'No aplicar aceite puro sobre la piel. Evitar en niños menores de 2 años.'
  },
  {
    id: 5,
    nombre: 'Lavanda',
    nombreCientifico: 'Lavandula angustifolia',
    imagen: lavandaImg,
    propiedades: ['Relajante', 'Antiséptica', 'Cicatrizante'],
    usos: ['Insomnio', 'Ansiedad', 'Heridas menores', 'Dolores de cabeza'],
    preparacion: 'Infusión: 1 cucharadita de flores secas por taza. Aromaterapia: difusor.',
    precauciones: 'Puede causar somnolencia. No usar antes de conducir.'
  }
];

const Home = () => {
  const [activePlanta, setActivePlanta] = useState(null);
  const navigate = useNavigate();
  return (
    <div>
      <Hero />
  
        {/* Galería de plantas medicinales */}
        <section className="plantas-gallery" style={{ background: '#fff', padding: '3rem 0' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', color: '#c4a484', marginBottom: '2rem', fontFamily: 'serif' }}>Galería de Plantas Medicinales</h2>
          <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '1400px', margin: '0 auto' }}>
            {plantas.map(planta => (
              <div
                key={planta.id}
                style={{ background: 'white', borderRadius: '1.2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: '0', textAlign: 'center', width: '340px', minHeight: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'pointer', border: '1.5px solid #e0e0e0' }}
                onClick={() => setActivePlanta(planta)}
              >
                <div style={{ width: '100%', height: '320px', background: '#f7f7f7', borderTopLeftRadius: '1.2rem', borderTopRightRadius: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={planta.imagen} alt={planta.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.2rem 1rem', width: '100%' }}>
                  <h3 style={{ color: '#2d5a27', fontFamily: 'serif', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>{planta.nombre}</h3>
                  <p style={{ fontStyle: 'italic', color: '#888', marginBottom: '1.2rem', fontSize: '1rem' }}>{planta.nombreCientifico}</p>
                  <button style={{ width: '100%', padding: '0.7rem 0', borderRadius: '0.7rem', border: '1.5px solid #c4a484', background: '#fff', color: '#c4a484', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '1px', cursor: 'pointer', marginTop: '0.5rem', transition: 'background 0.2s, color 0.2s' }} onClick={e => { e.stopPropagation(); setActivePlanta(planta); }}>Ver información</button>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* Popup de información de planta */}
        {activePlanta && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setActivePlanta(null)}>
            <div style={{ background: 'white', borderRadius: '1.2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', padding: '2.5rem 2rem', minWidth: '320px', maxWidth: '90vw', position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button style={{ position: 'absolute', top: 12, right: 18, fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#c44' }} onClick={() => setActivePlanta(null)}>&times;</button>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <img src={activePlanta.imagen} alt={activePlanta.nombre} style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain' }} />
                <h2 style={{ color: '#c4a484', fontFamily: 'serif', fontSize: '2rem', marginBottom: '0.5rem' }}>{activePlanta.nombre}</h2>
                <p style={{ fontStyle: 'italic', color: '#888', marginBottom: '0.5rem' }}>{activePlanta.nombreCientifico}</p>
                <div style={{ marginBottom: '0.5rem', color: '#2d5a27', fontWeight: 'bold' }}>
                  <span style={{ fontSize: '1.1rem' }}>Propiedades:</span> <span style={{ fontWeight: 'normal' }}>{activePlanta.propiedades.join(', ')}</span>
                </div>
                <div style={{ marginBottom: '0.5rem', color: '#2d5a27', fontWeight: 'bold' }}>
                  <span style={{ fontSize: '1.1rem' }}>Usos:</span> <span style={{ fontWeight: 'normal' }}>{activePlanta.usos.join(', ')}</span>
                </div>
                <div style={{ marginBottom: '0.5rem', color: '#2d5a27', fontWeight: 'bold' }}>
                  <span style={{ fontSize: '1.1rem' }}>Preparación:</span> <span style={{ fontWeight: 'normal' }}>{activePlanta.preparacion}</span>
                </div>
                <div style={{ color: '#c44', fontSize: '0.95rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                  <span>Precauciones:</span> <span style={{ fontWeight: 'normal', color: '#c44' }}>{activePlanta.precauciones}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div style={{ width: '100%', background: '#97b892', display: 'flex', justifyContent: 'center', position: 'relative', bottom: 0 }}>
          <img
            src={plantasDiseno}
            alt="Diseño de plantas decorativas"
            style={{ width: '100%', maxHeight: '220px', objectFit: 'cover' }}
          />
        </div>
      </div>
  );
};

export default Home;
