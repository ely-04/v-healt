import React, { useState } from 'react';
// Si usas Tailwind, elimina la importación de Enfermedades.css

const Enfermedades = () => {
  const [selectedEnfermedad, setSelectedEnfermedad] = useState(null);

  const enfermedades = [
    {
      id: 1,
      nombre: 'Dolor de Cabeza',
      categoria: 'neurologica',
      descripcion: 'Dolor localizado en la cabeza o cuello, puede ser tensional o migrañoso.',
      sintomas: ['Dolor pulsante', 'Sensibilidad a la luz', 'Náuseas', 'Tensión muscular'],
      plantasRecomendadas: [
        {
          nombre: 'Menta',
          uso: 'Aplicar aceite esencial diluido en las sienes',
          preparacion: 'Masaje suave con 2-3 gotas mezcladas con aceite portador'
        },
        {
          nombre: 'Lavanda',
          uso: 'Aromaterapia o infusión relajante',
          preparacion: 'Inhalar vapor o beber té de lavanda'
        },
        {
          nombre: 'Sauce Blanco',
          uso: 'Infusión analgésica natural',
          preparacion: '1 cucharadita de corteza en agua caliente por 10 minutos'
        }
      ],
      prevencion: ['Mantener horarios regulares de sueño', 'Evitar estrés excesivo', 'Hidratación adecuada'],
      cuandoConsultar: 'Si el dolor es severo, recurrente o acompañado de fiebre alta.'
    },
    {
      id: 2,
      nombre: 'Resfriado Común',
      categoria: 'respiratoria',
      descripcion: 'Infección viral del tracto respiratorio superior.',
      sintomas: ['Congestión nasal', 'Estornudos', 'Dolor de garganta', 'Tos leve'],
      plantasRecomendadas: [
        {
          nombre: 'Equinácea',
          uso: 'Fortalecer el sistema inmunológico',
          preparacion: 'Tintura o cápsulas según indicaciones del producto'
        },
        {
          nombre: 'Jengibre',
          uso: 'Reducir inflamación y aliviar síntomas',
          preparacion: 'Té con jengibre fresco, miel y limón'
        },
        {
          nombre: 'Eucalipto',
          uso: 'Descongestionar vías respiratorias',
          preparacion: 'Vaporizaciones con hojas o aceite esencial'
        }
      ],
      prevencion: ['Lavado frecuente de manos', 'Evitar contacto con personas enfermas', 'Mantener sistema inmune fuerte'],
      cuandoConsultar: 'Si los síntomas persisten más de 10 días o hay fiebre alta.'
    },
    {
      id: 3,
      nombre: 'Indigestión',
      categoria: 'digestiva',
      descripcion: 'Malestar estomacal después de comer, también conocido como dispepsia.',
      sintomas: ['Dolor estomacal', 'Sensación de llenura', 'Acidez', 'Náuseas'],
      plantasRecomendadas: [
        {
          nombre: 'Manzanilla',
          uso: 'Calmar el estómago y reducir inflamación',
          preparacion: 'Infusión después de las comidas'
        },
        {
          nombre: 'Menta',
          uso: 'Aliviar espasmos digestivos',
          preparacion: 'Té de menta fresca o seca'
        },
        {
          nombre: 'Hinojo',
          uso: 'Reducir gases y mejorar digestión',
          preparacion: 'Masticar semillas o preparar infusión'
        }
      ],
      prevencion: ['Comer despacio', 'Evitar comidas muy grasas', 'No acostarse inmediatamente después de comer'],
      cuandoConsultar: 'Si hay dolor severo, vómitos persistentes o pérdida de peso.'
    },
    {
      id: 4,
      nombre: 'Insomnio',
      categoria: 'neurologica',
      descripcion: 'Dificultad para conciliar o mantener el sueño.',
      sintomas: ['Dificultad para dormir', 'Despertares frecuentes', 'Cansancio diurno', 'Irritabilidad'],
      plantasRecomendadas: [
        {
          nombre: 'Valeriana',
          uso: 'Inductor natural del sueño',
          preparacion: 'Infusión 30 minutos antes de dormir'
        },
        {
          nombre: 'Pasiflora',
          uso: 'Reducir ansiedad y promover relajación',
          preparacion: 'Té o tintura antes de acostarse'
        },
        {
          nombre: 'Manzanilla',
          uso: 'Efecto calmante y relajante',
          preparacion: 'Infusión tibia antes de dormir'
        }
      ],
      prevencion: ['Mantener horarios regulares', 'Evitar cafeína por la tarde', 'Crear ambiente relajante'],
      cuandoConsultar: 'Si el insomnio persiste más de 2 semanas o afecta significativamente la vida diaria.'
    },
    {
      id: 5,
      nombre: 'Ansiedad Leve',
      categoria: 'neurologica',
      descripcion: 'Estado de inquietud, nerviosismo o preocupación.',
      sintomas: ['Nerviosismo', 'Palpitaciones', 'Sudoración', 'Tensión muscular'],
      plantasRecomendadas: [
        {
          nombre: 'Tilo',
          uso: 'Efecto tranquilizante natural',
          preparacion: 'Infusión de flores 2-3 veces al día'
        },
        {
          nombre: 'Melisa',
          uso: 'Calmar nervios y reducir estrés',
          preparacion: 'Té de hojas frescas o secas'
        },
        {
          nombre: 'Lavanda',
          uso: 'Aromaterapia relajante',
          preparacion: 'Difusor, baños aromáticos o almohadas de lavanda'
        }
      ],
      prevencion: ['Técnicas de respiración', 'Ejercicio regular', 'Meditación o mindfulness'],
      cuandoConsultar: 'Si la ansiedad es severa, persistente o interfiere con las actividades diarias.'
    }
  ];

  const categorias = [
    { id: 'todas', nombre: 'Todas', icono: '' },
    { id: 'digestiva', nombre: 'Digestivas', icono: '' },
    { id: 'respiratoria', nombre: 'Respiratorias', icono: '' },
    { id: 'neurologica', nombre: 'Neurológicas', icono: '' },
    { id: 'dermatologica', nombre: 'Dermatológicas', icono: '' }
  ];

  const [filtroCategoria, setFiltroCategoria] = useState('todas');

  const enfermedadesFiltradas = filtroCategoria === 'todas' 
    ? enfermedades 
    : enfermedades.filter(e => e.categoria === filtroCategoria);

  return (
    
    <div className="bg-white min-h-screen">
      <header className="pt-12 pb-4 text-center">
        <h1 className="text-5xl font-serif text-[#c4a484] mb-2">Guía de Enfermedades</h1>
        <p className="text-lg text-gray-500">Tratamientos naturales para dolencias comunes</p>
      </header>
      <div className="flex max-w-7xl mx-auto px-4 gap-8">
        {/* Sidebar de filtrado */}
        <aside className="w-64 bg-[#f5f2ed] rounded-xl p-6 h-fit shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Filtrar por categoría</h3>
          <div className="flex flex-col gap-2">
            {categorias.map(cat => (
              <button
                key={cat.id}
                className={`text-left px-4 py-2 rounded-lg border transition-colors font-medium ${filtroCategoria === cat.id ? 'bg-[#c4a484] text-white' : 'bg-white text-gray-700 hover:bg-[#e7e2d9]'}`}
                onClick={() => setFiltroCategoria(cat.id)}
              >
                <span className="mr-2">{cat.icono}</span>
                {cat.nombre}
              </button>
            ))}
          </div>
        </aside>
        {/* Galería de enfermedades */}
        <section className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enfermedadesFiltradas.map(enfermedad => (
            <div key={enfermedad.id} className="bg-[#f5f2ed] rounded-xl shadow-md p-6 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-serif text-[#c4a484]">{enfermedad.nombre}</h3>
                <button 
                  className="text-2xl font-bold text-[#c4a484] focus:outline-none"
                  onClick={() => setSelectedEnfermedad(
                    selectedEnfermedad === enfermedad.id ? null : enfermedad.id
                  )}
                >
                  {selectedEnfermedad === enfermedad.id ? '−' : '+'}
                </button>
              </div>
              <p className="italic text-gray-500 mb-2">{enfermedad.descripcion}</p>
              <div className="mb-2">
                <h4 className="font-semibold text-gray-700 mb-1">Síntomas principales:</h4>
                <div className="flex flex-wrap gap-2">
                  {enfermedad.sintomas.slice(0, 2).map((sintoma, index) => (
                    <span key={index} className="bg-[#c4a484] text-white px-2 py-1 rounded text-xs">{sintoma}</span>
                  ))}
                  {enfermedad.sintomas.length > 2 && (
                    <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs">+{enfermedad.sintomas.length - 2} más</span>
                  )}
                </div>
              </div>
              {selectedEnfermedad === enfermedad.id && (
                <div className="mt-2">
                  <div className="mb-2">
                    <h4 className="font-semibold text-gray-700 mb-1">Todos los síntomas:</h4>
                    <ul className="list-disc list-inside text-gray-600 text-sm">
                      {enfermedad.sintomas.map((sintoma, index) => (
                        <li key={index}>{sintoma}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mb-2">
                    <h4 className="font-semibold text-gray-700 mb-1">Plantas recomendadas:</h4>
                    {enfermedad.plantasRecomendadas.map((planta, index) => (
                      <div key={index} className="mb-2">
                        <h5 className="font-semibold text-[#c4a484]">{planta.nombre}</h5>
                        <p className="text-gray-600 text-sm"><strong>Uso:</strong> {planta.uso}</p>
                        <p className="text-gray-600 text-sm"><strong>Preparación:</strong> {planta.preparacion}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mb-2">
                    <h4 className="font-semibold text-gray-700 mb-1"> Prevención:</h4>
                    <ul className="list-disc list-inside text-gray-600 text-sm">
                      {enfermedad.prevencion.map((medida, index) => (
                        <li key={index}>{medida}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-1"> Cuándo consultar un médico:</h4>
                    <p className="text-gray-600 text-sm">{enfermedad.cuandoConsultar}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Enfermedades;