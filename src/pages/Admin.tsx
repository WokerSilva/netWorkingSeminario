import React, { useEffect, useState } from 'react';
import {
  Users, User, RefreshCcw, UserCog, Share2,
  AlertCircle, Loader2, LogOut
} from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import MatchesDisplay from '../components/MatchesDisplay';
import TeamsDisplay from '../components/TeamsDisplay';
import {
  fetchParticipants, fetchMatches, createMatches,
  fetchTeams, createTeams, Match, Team, clearMatches, clearTeams
} from '../lib/supabase';
import { useEventStore, useUserStore } from '../store';

// Interfaz actualizada para Match con score
interface MatchWithScore extends Omit<Match, 'score'> {
  score?: number;
}

const Admin: React.FC = () => {
  const {
    participants, setParticipants,
    currentRound, setCurrentRound,
    matches, setMatches,
    teams, setTeams
  } = useEventStore();
  const { setIsAdmin } = useUserStore();

  const [isLoading, setIsLoading] = useState(false);
  const [showTeams, setShowTeams] = useState(false);

  // Función de logout
  const handleLogout = () => {
    localStorage.removeItem('admin_id');
    localStorage.removeItem('admin_data');
    setIsAdmin(false);
    toast.success('Sesión cerrada correctamente');
  };

  // Función para reiniciar matches y equipos
  const resetMatchesAndTeams = async () => {
    if (!window.confirm('¿Estás seguro de que quieres reiniciar todos los matches y equipos? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsLoading(true);

    try {
      await clearMatches();
      await clearTeams();

      setMatches([]);
      setTeams([]);
      setCurrentRound(0);
      setShowTeams(false);

      toast.success('Matches y equipos reiniciados correctamente');
    } catch (error) {
      console.error('Error resetting data:', error);
      toast.error('Error al reiniciar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const participantData = await fetchParticipants();
        setParticipants(participantData);

        const matchData = await fetchMatches();
        setMatches(matchData);

        const maxRound = matchData.length > 0
          ? Math.max(...matchData.map(m => m.round))
          : 0;
        setCurrentRound(maxRound);

        const teamData = await fetchTeams();
        setTeams(teamData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setParticipants, setMatches, setCurrentRound, setTeams]);

  // ✅ ALGORITMO DE MATCHING CON PUNTAJES
  const calculateCompatibilityScore = (participant1: any, participant2: any): number => {
    const WEIGHTS = {
      MUTUAL_HELP: 4,
      BUSINESS_DIVERSITY: 1
    };

    let score = 0;

    const myNeedsTheirStrengths = participant1.needs.filter((need: string) =>
      participant2.strengths.includes(need)
    ).length;

    const theirNeedsMyStrengths = participant2.needs.filter((need: string) =>
      participant1.strengths.includes(need)
    ).length;

    const businessDiversity = participant1.business_type !== participant2.business_type ? 1 : 0;

    score = WEIGHTS.MUTUAL_HELP * (myNeedsTheirStrengths + theirNeedsMyStrengths) +
            WEIGHTS.BUSINESS_DIVERSITY * businessDiversity;

    return score;
  };

  const generateMatches = async () => {
    if (participants.length < 2) {
      toast.error('No hay suficientes participantes para generar matches.');
      return;
    }

    setIsLoading(true);

    try {
      const nextRound = currentRound + 1;
      if (nextRound > 3) {
        toast.error('Máximo de 3 rondas permitidas.');
        return;
      }

      console.log(`🚀 Generando matches para Ronda ${nextRound}...`);

      // Construir set de pares prohibidos
      const forbiddenPairs = new Set<string>();
      matches.forEach(match => {
        const pair1 = `${match.participant1_id}-${match.participant2_id}`;
        const pair2 = `${match.participant2_id}-${match.participant1_id}`;
        forbiddenPairs.add(pair1);
        forbiddenPairs.add(pair2);
      });

      // Calcular matriz de puntajes
      const candidates: Array<{
        participant1: any;
        participant2: any;
        score: number;
      }> = [];

      for (let i = 0; i < participants.length; i++) {
        for (let j = i + 1; j < participants.length; j++) {
          const p1 = participants[i];
          const p2 = participants[j];

          const pairKey1 = `${p1.id}-${p2.id}`;
          const pairKey2 = `${p2.id}-${p1.id}`;

          if (!forbiddenPairs.has(pairKey1) && !forbiddenPairs.has(pairKey2)) {
            const score = calculateCompatibilityScore(p1, p2);
            candidates.push({
              participant1: p1,
              participant2: p2,
              score
            });
          }
        }
      }

      // Ordenar por puntaje descendente
      candidates.sort((a, b) => b.score - a.score);

      // Greedy Max-Score Matching
      const matched = new Set<string>();
      const newMatches: Omit<MatchWithScore, 'id' | 'created_at'>[] = [];

      for (const candidate of candidates) {
        const p1Id = candidate.participant1.id;
        const p2Id = candidate.participant2.id;

        if (!matched.has(p1Id) && !matched.has(p2Id)) {
          newMatches.push({
            round: nextRound,
            participant1_id: p1Id,
            participant2_id: p2Id,
            score: candidate.score
          });

          matched.add(p1Id);
          matched.add(p2Id);
        }
      }

      // Manejar participante impar
      const unmatchedParticipants = participants.filter(p => !matched.has(p.id!));
      if (unmatchedParticipants.length > 0) {
        toast.warning(`${unmatchedParticipants[0].name} ${unmatchedParticipants[0].surname} no tiene pareja en esta ronda.`);
      }

      // Persistir en Supabase
      const createdMatches = await createMatches(newMatches);

      // Actualizar estado
      setMatches([...matches, ...createdMatches]);
      setCurrentRound(nextRound);

      // Estadísticas
      const avgScore = newMatches.length > 0
        ? (newMatches.reduce((sum, m) => sum + (m.score || 0), 0) / newMatches.length).toFixed(1)
        : '0';

      toast.success(`¡Ronda ${nextRound} generada! ${newMatches.length} matches creados. Puntaje promedio: ${avgScore}`);

    } catch (error) {
      console.error('Error generating matches:', error);
      toast.error('Error al generar matches.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ ALGORITMO PARA GENERAR EQUIPOS
  const generateTeams = async () => {
    if (participants.length < 3) {
      toast.error('No hay suficientes participantes para generar equipos.');
      return;
    }

    setIsLoading(true);

    try {
      setTeams([]);

      const teamSize = Math.min(5, Math.max(3, Math.ceil(participants.length / Math.ceil(participants.length / 4))));

      const participantsWithDiversity = participants.map(p => ({
        ...p,
        diversityScore: 0
      }));

      const allStrengths = new Set(participants.flatMap(p => p.strengths));
      participantsWithDiversity.forEach(p => {
        p.diversityScore = p.strengths.length +
          (new Set(p.strengths).size / allStrengths.size) * 10;
      });

      participantsWithDiversity.sort((a, b) => b.diversityScore - a.diversityScore);

      const newTeams: Omit<Team, 'id' | 'created_at'>[] = [];
      const assignedParticipants = new Set<string>();

      let teamIndex = 0;
      for (const participant of participantsWithDiversity) {
        if (assignedParticipants.has(participant.id!)) continue;

        if (teamIndex >= newTeams.length) {
          newTeams.push({
            name: `Equipo ${newTeams.length + 1}`,
            participant_ids: []
          });
        }

        newTeams[teamIndex].participant_ids.push(participant.id!);
        assignedParticipants.add(participant.id!);

        teamIndex = (teamIndex + 1) % Math.ceil(participants.length / teamSize);
      }

      // Balancear equipos
      const maxTeamSize = Math.ceil(participants.length / newTeams.length);
      const minTeamSize = Math.floor(participants.length / newTeams.length);

      for (let i = 0; i < newTeams.length; i++) {
        while (newTeams[i].participant_ids.length > maxTeamSize) {
          const smallestTeamIndex = newTeams.findIndex(team =>
            team.participant_ids.length < minTeamSize
          );

          if (smallestTeamIndex !== -1) {
            const participantToMove = newTeams[i].participant_ids.pop()!;
            newTeams[smallestTeamIndex].participant_ids.push(participantToMove);
          } else {
            break;
          }
        }
      }

      const createdTeams = await createTeams(newTeams);
      setTeams(createdTeams);
      setShowTeams(true);

      toast.success(`¡${createdTeams.length} equipos generados exitosamente!`);

    } catch (error) {
      console.error('Error generating teams:', error);
      toast.error('Error al generar equipos.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get current round matches
  const currentRoundMatches = matches.filter(match => match.round === currentRound);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">
                Gestiona matches y equipos para el evento de networking
              </p>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <button
                className="btn btn-secondary flex items-center"
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const participantData = await fetchParticipants();
                    setParticipants(participantData);
                    toast.success('¡Datos actualizados!');
                  } catch (error) {
                    toast.error('Error al actualizar datos.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
              >
                <RefreshCcw size={18} className="mr-2" />
                Actualizar Datos
              </button>

              <button
                className="btn btn-danger flex items-center"
                onClick={resetMatchesAndTeams}
                disabled={isLoading}
              >
                <RefreshCcw size={18} className="mr-2" />
                Reiniciar Todo
              </button>

              <button
                onClick={handleLogout}
                className="btn btn-outline flex items-center"
              >
                <LogOut size={18} className="mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Status Card */}
          <div className="card mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">Estado del Evento</h2>
                <div className="flex items-center text-gray-600">
                  <Users size={20} className="mr-2" />
                  <span>{participants.length} Participantes Registrados</span>
                </div>
                <div className="flex items-center text-gray-600 mt-2">
                  <UserCog size={20} className="mr-2" />
                  <span>Ronda Actual: {currentRound}</span>
                </div>
              </div>

              <div>
                {currentRound < 3 ? (
                  <button
                    className="btn btn-primary flex items-center"
                    onClick={generateMatches}
                    disabled={isLoading || participants.length < 2}
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="mr-2 animate-spin" />
                    ) : (
                      <RefreshCcw size={18} className="mr-2" />
                    )}
                    {currentRound === 0 ? 'Comenzar Ronda 1' : `Comenzar Ronda ${currentRound + 1}`}
                  </button>
                ) : (
                  <button
                    className="btn btn-secondary flex items-center"
                    onClick={generateTeams}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="mr-2 animate-spin" />
                    ) : (
                      <Share2 size={18} className="mr-2" />
                    )}
                    Ver Equipos
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Matches or Teams Display - COMPONENTES MODULARES */}
          {showTeams ? (
            <TeamsDisplay
              teams={teams}
              participants={participants}
              isLoading={isLoading}
              generateTeams={generateTeams}
              setShowTeams={setShowTeams}
            />
          ) : (
            <MatchesDisplay
              currentRound={currentRound}
              currentRoundMatches={currentRoundMatches}
              participants={participants}
              teams={teams}
              isLoading={isLoading}
              generateMatches={generateMatches}
              setShowTeams={setShowTeams}
            />
          )}

          {/* Participant List */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Participantes Registrados ({participants.length})</h2>

            {participants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Negocio
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fortalezas
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Necesidades
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {participants.map(participant => (
                      <tr key={participant.id}>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            {participant.photo_url ? (
                              <img
                                src={participant.photo_url}
                                alt={`${participant.name} ${participant.surname}`}
                                className="w-10 h-10 rounded-full object-cover mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                <User size={18} className="text-gray-500" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">
                                {participant.name} {participant.surname}
                              </div>
                              <div className="text-sm text-gray-500">
                                {participant.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {participant.business_type}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {participant.strengths.slice(0, 3).map(strength => (
                              <span key={strength} className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                                {strength}
                              </span>
                            ))}
                            {participant.needs.length > 3 && (
                              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                +{participant.needs.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {participant.needs.slice(0, 3).map(need => (
                              <span key={need} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                                {need}
                              </span>
                            ))}
                            {participant.needs?.length > 3 && (
                              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                +{participant.needs.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No hay participantes aún</h3>
                  <p className="text-gray-500">
                    Los participantes aparecerán aquí una vez que se registren para el evento.
                  </p>
                </div>
              </div>
            )}
          </div>
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

export default Admin;