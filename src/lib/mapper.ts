// utils/participantMapper.ts
import { Participant } from './supabase';

export const transformParticipants = (participants: Participant[]) => {
    return participants.map(participant => ({
      id: participant.id || '',
      name: `${participant.name} ${participant.surname}`,
      knowledgeArea: participant.business_type || 'Sin área',
      strengths: participant.strengths || [],
      needs: participant.needs || []
    }));
  };