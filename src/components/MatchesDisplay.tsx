import React from 'react';
import { CheckCircle2, AlertCircle, User, TrendingUp } from 'lucide-react';
import { Match, Participant, Team } from '../lib/supabase';

interface MatchesDisplayProps {
  currentRound: number;
  currentRoundMatches: Match[];
  participants: Participant[];
  teams: Team[];
  isLoading: boolean;
  generateMatches: () => Promise<void>;
  setShowTeams: (show: boolean) => void;
}

const MatchesDisplay: React.FC<MatchesDisplayProps> = ({
  currentRound,
  currentRoundMatches,
  participants,
  teams,
  isLoading,
  generateMatches,
  setShowTeams,
}) => {
  const renderParticipantInMatch = (participant: Participant) => (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        {participant.photo_url ? (
          <img
            src={participant.photo_url}
            alt={`${participant.name} ${participant.surname}`}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <User size={18} className="text-gray-500" />
          </div>
        )}
        <span className="font-medium">{participant.name} {participant.surname}</span>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">
            {currentRound === 0 ? 'Esperando Inicio' : `Ronda ${currentRound} - Matches`}
          </h2>
          {currentRoundMatches.length > 0 && (
            <div className="flex items-center text-gray-600 mt-2">
              <TrendingUp size={20} className="mr-2" />
              <span>
                Puntaje Promedio: {
                  (currentRoundMatches.reduce((sum, m) => sum + (m.score || 0), 0) / currentRoundMatches.length).toFixed(1)
                }
              </span>
            </div>
          )}
        </div>
        {currentRound === 3 && teams.length > 0 && (
          <button
            className="btn btn-secondary"
            onClick={() => setShowTeams(true)}
          >
            Ver Equipos
          </button>
        )}
      </div>

      {currentRound === 0 ? (
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No hay matches aún</h3>
            <p className="text-gray-500 mb-4">
              Inicia la primera ronda para generar matches.
            </p>
            <button
              className="btn btn-primary"
              onClick={generateMatches}
              disabled={isLoading}
            >
              Comenzar Ronda 1
            </button>
          </div>
        </div>
      ) : currentRoundMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentRoundMatches.map(match => (
            <div key={match.id} className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Match</span>
                {match.score !== undefined && (
                  <span className="text-sm font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                    Score: {match.score}
                  </span>
                )}
              </div>

              
              <div className="flex items-center space-x-3">
                {renderParticipantInMatch(participants.find(p => p.id === match.participant1_id)!)}

                <div className="flex items-center">
                  <div className="h-0.5 w-6 bg-gray-300 mx-2"></div>
                  <CheckCircle2 size={16} className="text-yellow-500" />
                  <div className="h-0.5 w-6 bg-gray-300 mx-2"></div>
                </div>

                {renderParticipantInMatch(participants.find(p => p.id === match.participant2_id)!)}
              </div>
              
              {/* 
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 bg-yellow-100 border border-yellow-400 text-black rounded-lg p-4 shadow w-full max-w-md break-words">
                <div className="flex justify-center mb-2 sm:mb-0">
                  {renderParticipantInMatch(participants.find(p => p.id === match.participant1_id)!)}
                </div>

                <div className="flex items-center justify-center my-2 sm:my-0">
                  <div className="h-0.5 w-6 bg-gray-300 mx-2"></div>
                  <CheckCircle2 size={16} className="text-yellow-500" />
                  <div className="h-0.5 w-6 bg-gray-300 mx-2"></div>
                </div>

                <div className="flex justify-center">
                  {renderParticipantInMatch(participants.find(p => p.id === match.participant2_id)!)}
                </div>
              </div>

              */}
              
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No se encontraron matches para la ronda actual.
          </p>
        </div>
      )}
    </div>
  );
};

export default MatchesDisplay;