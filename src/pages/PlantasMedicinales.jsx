import React, { useState } from 'react';
// Si usas Tailwind, elimina la importación de Plantas.css

const PlantasMedicinales = () => {
  const [selectedCategory, setSelectedCategory] = useState('todas');

  const plantas = [
    {
      id: 1,
      nombre: 'Manzanilla',
      nombreCientifico: 'Matricaria chamomilla',
      categoria: 'digestiva',
      imagen: '',
      propiedades: ['Antiinflamatoria', 'Calmante', 'Digestiva'],
      usos: ['Indigestión', 'Insomnio', 'Ansiedad', 'Irritación de piel'],
      preparacion: 'Infusión: 1 cucharada de flores secas por taza de agua caliente. Dejar reposar 5-10 minutos.',
      precauciones: 'Evitar en caso de alergia a plantas de la familia Asteraceae.'
    },
    {
      id: 2,
      nombre: 'Jengibre',
      nombreCientifico: 'Zingiber officinale',
      categoria: 'digestiva',
      imagen: '',
      propiedades: ['Antiemético', 'Antiinflamatorio', 'Digestivo'],
      usos: ['Náuseas', 'Mareos', 'Indigestión', 'Dolor muscular'],
      preparacion: 'Té: Hervir 2-3 rodajas de jengibre fresco en agua por 10 minutos.',
      precauciones: 'Consultar médico si tomas anticoagulantes. Moderar en embarazo.'
    },
    {
      id: 3,
      nombre: 'Aloe Vera',
      nombreCientifico: 'Aloe barbadensis',
      categoria: 'dermatologica',
      imagen: '',
      propiedades: ['Cicatrizante', 'Hidratante', 'Antiinflamatoria'],
      usos: ['Quemaduras menores', 'Heridas', 'Piel seca', 'Eczema'],
      preparacion: 'Aplicar gel directamente sobre la piel limpia 2-3 veces al día.',
      precauciones: 'No consumir internamente sin supervisión médica.'
    },
    {
      id: 4,
      nombre: 'Eucalipto',
      nombreCientifico: 'Eucalyptus globulus',
      categoria: 'respiratoria',
      imagen: '',
      propiedades: ['Expectorante', 'Antiséptico', 'Descongestionante'],
      usos: ['Resfriado', 'Bronquitis', 'Sinusitis', 'Dolor muscular'],
      preparacion: 'Vaporizaciones: 5-10 gotas de aceite esencial en agua caliente.',
      precauciones: 'No aplicar aceite puro sobre la piel. Evitar en niños menores de 2 años.'
    },
    {
      id: 5,
      nombre: 'Lavanda',
      nombreCientifico: 'Lavandula angustifolia',
      categoria: 'relajante',
      imagen: '',
      propiedades: ['Relajante', 'Antiséptica', 'Cicatrizante'],
      usos: ['Insomnio', 'Ansiedad', 'Heridas menores', 'Dolores de cabeza'],
      preparacion: 'Infusión: 1 cucharadita de flores secas por taza. Aromaterapia: difusor.',
      precauciones: 'Puede causar somnolencia. No usar antes de conducir.'
    }
  ];

  const categorias = [
    { id: 'todas', nombre: 'Todas las plantas' },
    { id: 'digestiva', nombre: 'Digestivas' },
    { id: 'respiratoria', nombre: 'Respiratorias' },
    { id: 'dermatologica', nombre: 'Dermatológicas' },
    { id: 'relajante', nombre: 'Relajantes' }
  ];

  const plantasFiltradas = selectedCategory === 'todas' 
    ? plantas 
    : plantas.filter(planta => planta.categoria === selectedCategory);

  return (
    <div className="bg-white min-h-screen">
      <header className="pt-12 pb-4 text-center">
        <h1 className="text-5xl font-serif text-[#c4a484] mb-2">Plantas Medicinales</h1>
        <p className="text-lg text-gray-500">Descubre el poder curativo de la naturaleza</p>
      </header>
      <div className="flex max-w-7xl mx-auto px-4 gap-8">
        {/* Sidebar de filtrado */}
        <aside className="w-64 bg-[#f5f2ed] rounded-xl p-6 h-fit shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Filtrar por categoría</h3>
          <div className="flex flex-col gap-2">
            {categorias.map(categoria => (
              <button
                key={categoria.id}
                className={`text-left px-4 py-2 rounded-lg border transition-colors font-medium ${selectedCategory === categoria.id ? 'bg-[#c4a484] text-white' : 'bg-white text-gray-700 hover:bg-[#e7e2d9]'}`}
                onClick={() => setSelectedCategory(categoria.id)}
              >
                {categoria.nombre}
              </button>
            ))}
          </div>
        </aside>
        {/* Galería de plantas */}
        <section className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plantasFiltradas.map(planta => (
            <div key={planta.id} className="bg-[#f5f2ed] rounded-xl shadow-md p-6 flex flex-col items-center">
              <div className="text-6xl mb-4">{planta.imagen}</div>
              <h3 className="text-2xl font-serif text-[#c4a484] mb-1">{planta.nombre}</h3>
              <p className="italic text-gray-500 mb-2">{planta.nombreCientifico}</p>
              <div className="mb-2 w-full">
                <h4 className="font-semibold text-gray-700 mb-1">Propiedades:</h4>
                <div className="flex flex-wrap gap-2">
                  {planta.propiedades.map((prop, index) => (
                    <span key={index} className="bg-[#c4a484] text-white px-2 py-1 rounded text-xs">{prop}</span>
                  ))}
                </div>
              </div>
              <div className="mb-2 w-full">
                <h4 className="font-semibold text-gray-700 mb-1">Usos principales:</h4>
                <ul className="list-disc list-inside text-gray-600 text-sm">
                  {planta.usos.map((uso, index) => (
                    <li key={index}>{uso}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-2 w-full">
                <h4 className="font-semibold text-gray-700 mb-1">Preparación:</h4>
                <p className="text-gray-600 text-sm">{planta.preparacion}</p>
              </div>
              <div className="w-full">
                <h4 className="font-semibold text-red-600 mb-1"> Precauciones:</h4>
                <p className="text-gray-600 text-sm">{planta.precauciones}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default PlantasMedicinales;