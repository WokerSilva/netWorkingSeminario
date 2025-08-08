import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';
import RegisterForm from '../components/RegisterForm';
import { useFormStore, useUserStore } from '../store';
import { isSupabaseConfigured } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    // Navegacion de boton directory
  const navigate = useNavigate();
  const { isOpen, openForm } = useFormStore();
  const { isAuthenticated } = useUserStore();

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
            <h1 className="text-2xl font-bold mb-4">Conexión a Base de Datos Requerida</h1>
            <p className="text-gray-600 mb-4">
              Por favor, haz clic en el botón "Connect to Supabase" en la esquina superior derecha para configurar tu conexión a la base de datos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <section className="py-20 bg-gradient-to-b from-yellow-50 to-white">
          <div className="container mx-auto px-4 text-center ">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Conecta. Colabora. <span className="text-yellow-500">Crece.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto">
              ¿Listos para liderar la transformación digital? Antes de sumergirnos, vamos 
              a romper el hielo y forjar alianzas en un networking dinámico. 
              <br></br>
              ¡Es hora de conocernos! 
            </p>

            <div className="flex flex-col items-center gap-y-4 w-fit mx-auto">
             

              {/* Botón Regístrate  */}
              {!isAuthenticated && (
                <button
                  onClick={openForm}
                  className="px-6 py-2.5 text-base bg-black text-white hover:bg-gray-800 rounded font-semibold transition-colors shadow-lg hover:shadow-xl min-w-[180px]"
                >
                  Regístrate Ahora
                </button>
              )}

              {/* Botón Directorio */}
              <button
                onClick={() => navigate('/directory')}
                className="px-6 py-2.5 text-base bg-yellow-500 text-black hover:bg-yellow-600 rounded font-semibold transition-colors shadow-lg hover:shadow-xl min-w-[180px]"
              >
                Directorio
              </button>
            </div>
            
            {/*<div className="flex gap-4">} 
              {!isAuthenticated && (
                <button
                  onClick={openForm}
                  className="btn btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Regístrate Ahora
                </button>
              )}



              <button
                  onClick={() => navigate('/directory')}
                  className="bg-yellow-500 text-black hover:bg-yellow-600 px-4 py-2 rounded font-semibold transition-colors text-sm sm:text-base"
                >
                  Directorio
              </button>
            {</div>*/}
          </div>
        </section>
        
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">¿Cómo Funciona?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-yellow-500">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Registra tu Perfil</h3>
                <p className="text-gray-600">
                  Crea tu perfil destacando tus actividades facoritas y actividades que casi no te gustan.
                </p>
              </div>
              
              <div className="card text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-yellow-500">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Conecta con Otros</h3>
                <p className="text-gray-600">
                  Nuestro algoritmo te emparejará con los participantes más compatibles en tres rondas.
                </p>
              </div>
              
              <div className="card text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-yellow-500">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Forma Equipos</h3>
                <p className="text-gray-600">
                  Después del networking, serás asignado a equipos basados en habilidades y necesidades complementarias.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-black text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2025 NetEvent. Todos los derechos reservados.</p>
          <p className="text-gray-400">Conecta. Colabora. Crece.</p>
        </div>
      </footer>
      
      {isOpen && <RegisterForm />}
    </div>
  );
};

export default Home;