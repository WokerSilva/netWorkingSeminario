import React, { useState, useEffect } from 'react';
import { Match, Participant, Team, fetchMatches, fetchParticipants, fetchTeams } from '../lib/supabase';
import MatchesDisplay from '../components/MatchesDisplay';
import TeamsDisplay from '../components/TeamsDisplay';
import { useNavigate } from 'react-router-dom';

const MatchesPage: React.FC = () => {
  // Navegacion de boton directory
  const navigate = useNavigate();
  // Obtener el usuario del localStorage
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id;

  const [matches, setMatches] = useState<Match[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]); // Estado para los participantes
  const [showTeams, setShowTeams] = useState(false);


  const loadData = async () => {
    setLoading(true); // Activa el estado de carga
    try {
      const allMatches = await fetchMatches();
      const userMatches = allMatches.filter(
        (match) => match.participant1_id === userId || match.participant2_id === userId
      );
      setMatches(userMatches);

      const allTeams = await fetchTeams();
      const userTeam = allTeams.find((team) => team.participant_ids.includes(userId));
      setTeam(userTeam || null);

      const allParticipants = await fetchParticipants();
      setParticipants(allParticipants);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false); // Desactiva el estado de carga (éxito o error)
    }
  };

  // Llamar solo cuando hay usuario válido
  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);


  const reloadPage = () => {
    window.location.reload();
  };

  const renderMatch = (match: Match) => {
    const participant1Id = match.participant1_id;
    const participant2Id = match.participant2_id;

    // Obtener información de los participantes
    const participant1 = participants.find((p) => p.id === participant1Id);
    const participant2 = participants.find((p) => p.id === participant2Id);

    if (!participant1 || !participant2) {
      return <p>Participante no encontrado</p>;
    }

    return (
      <div key={match.id} className="match-card">
        <p>
          Ronda {match.round}: {participant1.name} & {participant2.name}
        </p>
      </div>
    );
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  // Si el usuario no está autenticado, mostrar un mensaje
  if (!userId) {
    return (
      <div className="matches-page">
        <h1>¡Acceso Denegado!</h1>
        <p>Debes iniciar sesión para ver esta página.</p>
        {/* Agrega un enlace a la página de login si es necesario */}
      </div>
    );
  }
      // Determina la ronda más reciente en la que el usuario ha tenido matches.
      // Se usa para mostrar los matches de esa ronda actual.
  const currentRound = matches.length > 0 ? Math.max(...matches.map(m => m.round)) : 0;
  const currentRoundMatches = matches.filter(match => match.round === currentRound);  


  return (
    <div className="bg-white min-h-screen py-4 md:py-10 px-2">
      <div className="container mx-auto px-2 sm:px-4 max-w-4xl">

        <h1 className="text-2xl md:text-3xl font-bold text-yellow-500 mb-3 md:mb-4">¡Hola {user?.name}!</h1>
        <p className="text-base md:text-lg text-gray-800 mb-4 md:mb-6">
          Aquí puedes ver tus <span className="text-black font-semibold">matches</span> y tu <span className="text-black font-semibold">equipo</span>.
        </p>

        {/* Botones - Apilados verticalmente en móviles */}
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            className="bg-black text-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors px-4 py-2 rounded font-semibold text-sm sm:text-base"
            onClick={() => setShowTeams(!showTeams)}
          >
            {showTeams ? 'Ver Matches' : 'Ver Equipos'}
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="bg-yellow-500 text-black hover:bg-yellow-600 px-4 py-2 rounded font-semibold transition-colors text-sm sm:text-base"
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>

          <button
            onClick={() => navigate('/directory')}
            className="bg-yellow-500 text-black hover:bg-yellow-600 px-4 py-2 rounded font-semibold transition-colors text-sm sm:text-base"
          >
            Directorio
          </button>

        </div>

        <div className="flex flex-col items-center space-y-4 md:space-y-6">
          {/* Renderizado condicional */}
          {showTeams ? (
            <TeamsDisplay
              teams={team ? [team] : []}
              participants={participants}
              isLoading={loading}
              generateTeams={() => {}}
              setShowTeams={setShowTeams}
            />
          ) : matches.length > 0 ? (
            <MatchesDisplay
              currentRound={currentRound}
              currentRoundMatches={currentRoundMatches}
              participants={participants}
              teams={team ? [team] : []}
              isLoading={loading}
              generateMatches={() => {}}
              setShowTeams={setShowTeams}
            />
          ) : (
            <div className="text-center my-6 md:my-8 px-2">
              <p className="text-lg md:text-xl font-semibold text-yellow-500">Aún no tienes matches asignados.</p>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Por favor espera a que el administrador los genere.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );


  
};

export default MatchesPage;

