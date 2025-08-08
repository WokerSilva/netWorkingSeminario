import React, { useState } from 'react';
import { X, Upload, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useFormStore, useEventStore } from '../store';
import { createParticipant, supabase } from '../lib/supabase';

const STRENGTHS_LIST = [
  'Ver peliculas o series',
  'Comer pizza', 
  'Hacer viajes',
  'Ir a la playa', 
  'Salir de fiesta', 
  'Ir a bailar',
  'Ir a conciertos', 
  'Leer libros', 
  'Salir a correr', 
  'Ir al gimnasio',
  'Comer sushi',
  'Dormir mucho',
  'Escribir código',
  'Jugar un deporte',
];

const BUSINESS_TYPES = [
  'Actuaria',
  'Biología',
  'Matemáticas',
  'Ciencias de la Computación',
  'Matemáticas Aplicadas',
  'Fisica Biomedica'
];

const NEEDS_LIST = STRENGTHS_LIST;

const RegisterForm: React.FC = () => {
  const { closeForm } = useFormStore();
  const { addParticipant } = useEventStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    photo_url: '',
    phone: '',
    strengths: [] as string[],
    needs: [] as string[],
    business_type: '',
    social_media: {
      network1: '',
      network2: ''
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      social_media: {
        ...formData.social_media,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'strengths' | 'needs') => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
      if (formData[type].length >= 5) {
        toast.warning(`Solo puedes seleccionar 5 ${type === 'strengths' ? 'fortalezas' : 'necesidades'}!`);
        return;
      }

      setFormData({
        ...formData,
        [type]: [...formData[type], value]
      });
    } else {
      setFormData({
        ...formData,
        [type]: formData[type].filter(item => item !== value)
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];

    // Validaciones
    if (file.size > 5 * 1024 * 1024) { // 5MB máximo
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    // Comprimir imagen
    const compressedFile = await compressImage(file);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `photos/${fileName}`;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(compressedFile);

    setIsLoading(true);

    try {
      const { error: uploadError } = await supabase
        .storage
        .from('participants')
        .upload(filePath, compressedFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('participants')
        .getPublicUrl(filePath);

      setFormData({
        ...formData,
        photo_url: publicUrl
      });

      toast.success('Foto subida exitosamente!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Error al subir la foto. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Redimensionar manteniendo aspecto
        const maxWidth = 800;
        const maxHeight = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(new File([blob!], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          }));
        }, 'image/jpeg', 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'Por favor ingresa tu nombre';
    if (!formData.surname.trim()) newErrors.surname = 'Por favor ingresa tu apellido';
    
    if (!formData.business_type.trim()) newErrors.business_type = 'Por favor selecciona el tipo de negocio';
    if (formData.strengths.length !== 5) newErrors.strengths = 'Selecciona exactamente 5 fortalezas';
    if (formData.needs.length !== 5) newErrors.needs = 'Selecciona exactamente 5 necesidades';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [generalError, setGeneralError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(''); // Limpiar el error anterior

    if (!validateForm()) {
      setGeneralError('Completa todos los campos correctamente');
      return;
    }

    setShowConfirm(true);
  };

  // ✅ FUNCIÓN ACTUALIZADA - Aquí está el cambio principal
  const handleConfirmSubmit = async () => {
    setIsLoading(true);

    try {
      // Crear el participante en Supabase
      const newParticipant = await createParticipant(formData);
      
      // Agregar al store local
      addParticipant(newParticipant);
      
      // ✅ GUARDAR EL USUARIO EN LOCALSTORAGE
      localStorage.setItem('user', JSON.stringify(newParticipant));
      
      toast.success('¡Registro exitoso!');
      closeForm();
      
      // Redirigir a la página de matches
      navigate('/matches');
      
    } catch (error) {
      console.error('Error registering:', error);
      toast.error('Error en el registro. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 popup-overlay" onClick={() => setShowConfirm(false)}>
        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-2xl font-bold mb-4">Confirmar Registro</h2>
          <div className="flex items-center space-x-2 mb-6 text-indigo-600 bg-indigo-100 p-4 rounded-md">
            <span className="font-bold">Seminario de transformación digital</span>            
          </div>

          <div className="flex items-center space-x-2 mb-6 text-yellow-600 bg-yellow-100 p-4 rounded-md">
            <AlertCircle size={24} />
            <p>Los datos de los participantes estaran en el directorio.</p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              className="btn btn-outline"
              onClick={() => setShowConfirm(false)}
            >
              Cancelar
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleConfirmSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-overlay" onClick={closeForm}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Formulario de Registro</h2>
          <button
            onClick={closeForm}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full focus:outline-none"
            aria-label="Cerrar"
            style={{ background: 'transparent', boxShadow: 'none', border: 'none' }}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="input-group">
              <label htmlFor="name" className="input-label">Nombre *</label>
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="surname" className="input-label">Apellido *</label>
              {errors.surname && <p className="text-red-500 text-sm">{errors.surname}</p>}
              <input
                type="text"
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="photo" className="input-label">Foto de Perfil</label>
            <div className="mt-1 flex items-center space-x-4">
              {imagePreview ? (
                <div className="relative w-24 h-24">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="w-24 h-24 object-cover rounded-full border-2 border-yellow-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData({ ...formData, photo_url: '' });
                    }}
                    className="absolute top-0 right-0 p-1" // Quitado bg-red-500 y text-white
                    aria-label="Eliminar foto"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400">
                  <Upload size={24} />
                </div>
              )}
              <div className="flex-1">
                <label
                  htmlFor="photo-upload"
                  className="btn btn-outline inline-flex items-center cursor-pointer"
                >
                  <Upload size={18} className="mr-2" />
                  Subir Foto
                </label>
                <input
                  id="photo-upload"
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="sr-only"
                />
              </div>
            </div>
          </div>

          {/* <div className="input-group">
            <label htmlFor="phone" className="input-label">Teléfono *</label>
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div> */}

          <div className="mt-4">
            <label className="input-label font-semibold">
              ♥️ 5 actividades que si me gusta : *
            </label>
            {errors.strengths && <p className="text-red-500 text-sm">{errors.strengths}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {STRENGTHS_LIST.map(strength => {
                const isChecked = formData.strengths.includes(strength);
                return (
                  <button
                    type="button"
                    key={strength}
                    onClick={() => handleCheckboxChange({
                      target: { value: strength, checked: !isChecked }
                    } as any, 'strengths')}
                    className={`w-full text-left rounded-md py-2 px-4 font-medium transition-colors border border-gray-300 focus:outline-none mb-1
                      ${isChecked ? 'bg-yellow-500 text-white border-yellow-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  >
                    {strength}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <label className="input-label font-semibold">
              🚫 5 actividades que no me gustan: *
            </label>
            {errors.needs && <p className="text-red-500 text-sm">{errors.needs}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {NEEDS_LIST.map(need => {
                const isChecked = formData.needs.includes(need);
                return (
                  <button
                    type="button"
                    key={need}
                    onClick={() => handleCheckboxChange({
                      target: { value: need, checked: !isChecked }
                    } as any, 'needs')}
                    className={`w-full text-left rounded-md py-2 px-4 font-medium transition-colors border border-gray-300 focus:outline-none mb-1
                      ${isChecked ? 'bg-yellow-500 text-white border-yellow-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  >
                    {need}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="business_type" className="input-label">Carrera</label>
            {errors.business_type && <p className="text-red-500 text-sm">{errors.business_type}</p>}
            <select
              id="business_type"
              name="business_type"
              value={formData.business_type}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="" disabled>Selecciona una opción</option>
              {BUSINESS_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="input-group">
              <label htmlFor="network1" className="input-label">Red Social Personal (Opcional)</label>
              <input
                type="text"
                id="network1"
                name="network1"
                value={formData.social_media.network1}
                onChange={handleSocialChange}
                className="input-field"
                placeholder="user name"
              />
            </div>

            {/*
            <div className="input-group">
              <label htmlFor="network2" className="input-label">Red Social Empresa (Opcional)</label>
              <input
                type="text"
                id="network2"
                name="network2"
                value={formData.social_media.network2}
                onChange={handleSocialChange}
                className="input-field"
                placeholder="https://..."
              />
            </div>
            */}
          </div>

          <div className="mt-6 flex justify-end">
            {generalError && (
              <div className="mb-4 text-red-500 text-center font-medium w-full">
                {generalError}
              </div>
            )}
            <button
              type="submit"
              className="btn btn-secondary flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>Procesando...</>
              ) : (
                <>
                  <Check size={18} className="mr-2" />
                  Enviar Registro
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;