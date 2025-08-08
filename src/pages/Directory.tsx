import React, { useEffect, useState } from 'react';
import { Search, User } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { fetchParticipants, Participant } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const Directory: React.FC = () => {
  // Navegacion de boton Ver Macthes 
    const navigate = useNavigate();
    
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadParticipants = async () => {
      try {
        const data = await fetchParticipants();
        console.log(data)
        setParticipants(data);
        setFilteredParticipants(data);
      } catch (error) {
        console.error('Error loading participants:', error);
        toast.error('Failed to load participant directory.');
      } finally {
        setIsLoading(false);
      }
    };
  
    loadParticipants();
  }, []);

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredParticipants(participants);
      return;
    }
  
    const term = searchTerm.toLowerCase();
    const filtered = participants.filter(participant => 
      participant.name.toLowerCase().includes(term) ||
      participant.surname.toLowerCase().includes(term) ||
      participant.business_type.toLowerCase().includes(term) ||
      participant.strengths.some(s => s.toLowerCase().includes(term)) ||
      participant.needs.some(n => n.toLowerCase().includes(term))
    );
  
    setFilteredParticipants(filtered);
  }, [searchTerm, participants]);

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${type} copied!`))
      .catch(() => toast.error(`Failed to copy ${type.toLowerCase()}`));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
    
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Directorio de Participantes</h1>
              <p className="text-gray-600">
                Conecta con otros participantes del evento.
              </p>
              <button
                onClick={() => navigate('/matches')}
                className="bg-yellow-500 text-black hover:bg-yellow-600 px-4 py-2 rounded font-semibold transition-colors text-sm sm:text-base"
              >
                Ver Matches
              </button>
            </div>
          
            {/* Search Bar */}
            <div className="mt-4 md:mt-0 w-full md:w-64">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input-field pl-10 w-full"
                  placeholder="Buscar participantes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredParticipants.length > 0 ? (
                filteredParticipants.map(participant => (
                  <div 
                    key={participant.id} 
                    className="contact-card"
                  >
                    <div className="h-32 bg-yellow-400 relative">
                      {participant.photo_url ? (
                        <img
                          src={participant.photo_url}
                          alt={`${participant.name} ${participant.surname}`}
                          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 rounded-full object-cover border-4 border-white"
                        />
                      ) : (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 rounded-full bg-white border-4 border-white flex items-center justify-center">
                          <User size={40} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  
                    <div className="pt-16 pb-4 px-4 text-center">
                      <h3 className="text-xl font-bold">
                        {participant.name} {participant.surname}
                      </h3>
                      <p className="text-gray-500 mb-3">{participant.business_type}</p>
                    
                      <div className="flex flex-col items-center space-y-2">
                        {/*
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyText(participant.phone, 'Phone number');
                          }}
                          className="flex items-center space-x-2 bg-white text-black py-2 px-4 rounded-md w-full justify-center hover:bg-yellow-500 hover:text-white"
                        >
                          <Phone size={18} />
                          <span>Copiar número</span>
                          <Copy size={18} />
                        </button>
                        */}
                      
                        <div className="flex flex-col items-center w-full text-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (participant.social_media?.network1) {
                                handleCopyText(participant.social_media.network1, 'Social handle');
                              }
                            }}
                            className="min-h-[1.5em] w-full text-center bg-yellow-500 text-white hover:bg-yellow-600 hover:text-white rounded-md py-2 px-4"
                            disabled={!participant.social_media?.network1}
                          >
                            {participant.social_media?.network1 || ''}
                          </button>
                          {/*
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (participant.social_media?.network2) {
                                handleCopyText(participant.social_media.network2, 'Social handle');
                              }
                            }}
                            className="min-h-[1.5em] w-full text-center bg-yellow-500 text-white hover:bg-yellow-600 hover:text-white rounded-md py-2 px-4"
                            disabled={!participant.social_media?.network2}
                          >
                            {participant.social_media?.network2 || ''}
                          </button>
                          */}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Search size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No participants found</h3>
                    <p className="text-gray-500">
                      Try adjusting your search or filters.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    
      <footer className="bg-black text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 NetEvent. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Directory;