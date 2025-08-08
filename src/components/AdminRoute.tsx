import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

type AdminRouteProps = {
  children: React.ReactNode;
};

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdmin, setIsAdmin, setAdminData, checkAdminAuth } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    identification_number: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const verifyAdminSession = async () => {
      try {
        // Usar la función del store para verificar la sesión de admin
        await checkAdminAuth();
        setLoading(false);
        
        // Si no es admin después de verificar, mostrar formulario de login
        if (!isAdmin) {
          setShowLoginForm(true);
        }
      } catch (error) {
        console.error('Error verificando sesión de admin:', error);
        setLoading(false);
        setShowLoginForm(true);
      }
    };

    verifyAdminSession();
  }, [checkAdminAuth, isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Verificar credenciales en la tabla admins
      const { data: adminData, error } = await supabase
        .from('admins')
        .select('*')
        .eq('name', formData.name.trim())
        .eq('identification_number', formData.identification_number.trim())
        .single();

      if (error || !adminData) {
        console.log('Error de Supabase:', error);
        toast.error('Credenciales incorrectas. Verifica tu nombre y número de identificación.');
        return;
      }

      // Guardar sesión de admin en localStorage
      localStorage.setItem('admin_id', adminData.id);
      localStorage.setItem('admin_data', JSON.stringify({
        id: adminData.id,
        name: adminData.name,
        identification_number: adminData.identification_number
      }));

      // Actualizar estado usando las funciones del store
      setIsAdmin(true);
      setAdminData({
        id: adminData.id,
        name: adminData.name,
        identification_number: adminData.identification_number
      });
      
      setShowLoginForm(false);
      toast.success(`¡Bienvenido, ${adminData.name}!`);
      
    } catch (error) {
      console.error('Error during admin login:', error);
      toast.error('Error al verificar credenciales.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <span className="text-gray-500 text-lg">Verificando acceso...</span>
        </div>
      </div>
    );
  }

  if (showLoginForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acceso de Administrador
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tus credenciales para acceder al panel de administración
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                    placeholder="Ingresa tu nombre"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="identification_number" className="block text-sm font-medium text-gray-700">
                  Número de Identificación
                </label>
                <div className="mt-1">
                  <input
                    id="identification_number"
                    name="identification_number"
                    type="text"
                    required
                    maxLength={4}
                    pattern="[0-9]{4}"
                    value={formData.identification_number}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                    placeholder="4 dígitos"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Verificando...' : 'Acceder'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <button
                onClick={() => window.history.back()}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
              >
                ← Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default AdminRoute;