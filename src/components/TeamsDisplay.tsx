import React from 'react';
import { AlertCircle, User } from 'lucide-react';
import { Participant, Team } from '../lib/supabase';

interface TeamsDisplayProps {
  teams: Team[];
  participants: Participant[];
  isLoading: boolean;
  generateTeams: () => Promise<void>;
  setShowTeams: (show: boolean) => void;
}

const TeamsDisplay: React.FC<TeamsDisplayProps> = ({
  teams,
  participants,
  isLoading,
  generateTeams,
  setShowTeams,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Equipos Finales</h2>
        <button
          className="btn btn-outline"
          onClick={() => setShowTeams(false)}
        >
          Ver Matches
        </button>
      </div>

      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            const teamParticipants = participants.filter(p =>
              team.participant_ids.includes(p.id!)
            );

            return (
              <div key={team.id} className="team-card">
                <h3 className="text-lg font-bold mb-3">{team.name}</h3>
                <ul className="space-y-2">
                  {teamParticipants.map(participant => (
                    <li key={participant.id} className="flex items-center space-x-2">
                      {participant.photo_url ? (
                        <img
                          src={participant.photo_url}
                          alt={`${participant.name} ${participant.surname}`}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User size={14} className="text-gray-500" />
                        </div>
                      )}
                      <span>{participant.name} {participant.surname}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="font-semibold">Fortalezas:</p>
                      <ul className="text-gray-600">
                        {Array.from(new Set(teamParticipants.flatMap(p => p.strengths || [])))
                          .slice(0, 3)
                          .map(strength => (
                            <li key={strength}>{strength}</li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Necesidades:</p>
                      <ul className="text-gray-600">
                        {Array.from(new Set(teamParticipants.flatMap(p => p.needs || [])))
                          .slice(0, 3)
                          .map(need => (
                            <li key={need}>{need}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No hay equipos generados</h3>
            <p className="text-gray-500 mb-4">
              Espera que el administrador genere los equipos. 
              Los equipos se generaran después de completar las 3 rondas de matching.
            </p>

          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsDisplay;