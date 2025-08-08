import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!isSupabaseConfigured) {
  console.warn('Supabase configuration missing. Please click "Connect to Supabase" button to set up your database.');
}

// Type definitions for database tables
export type Participant = {
  id?: string;
  created_at?: string;
  name: string;
  surname: string;
  photo_url?: string;
  phone: string;
  strengths: string[];
  needs: string[];
  business_type: string;
  social_media: {
    network1?: string;
    network2?: string;
  };
};

export interface Match {
  id: string;
  participant1_id: string;
  participant2_id: string;
  round: number;
  score?: number;
  created_at: string;
}

export type Team = {
  id?: string;
  created_at?: string;
  name: string;
  participant_ids: string[];
};

// Database operations with error handling
export const fetchParticipants = async () => {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('participants')
    .select('*');

  if (error) {
    console.error('Error fetching participants:', error);
    return [];
  }

  return data;
};

export const createParticipant = async (participant: Participant) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('participants')
    .insert(participant)
    .select();

  if (error) {
    console.error('Error creating participant:', error);
    throw error;
  }

  return data[0];
};

export const fetchMatches = async (round?: number) => {
  if (!isSupabaseConfigured) return [];

  let query = supabase
    .from('matches')
    .select('*, participant1:participant1_id(id, name, surname, photo_url), participant2:participant2_id(id, name, surname, photo_url)');

  if (round !== undefined) {
    query = query.eq('round', round);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  return data;
};

export const createMatches = async (matches: Omit<Match, 'id' | 'created_at'>[]) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('matches')
    .insert(matches)
    .select();

  if (error) {
    console.error('Error creating matches:', error);
    throw error;
  }

  return data;
};

export const fetchTeams = async () => {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('teams')
    .select('*');

  if (error) {
    console.error('Error fetching teams:', error);
    return [];
  }

  return data;
};

export const createTeams = async (teams: Omit<Team, 'id' | 'created_at'>[]) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('teams')
    .insert(teams)
    .select();

  if (error) {
    console.error('Error creating teams:', error);
    throw error;
  }

  return data;
};

export const authenticateUser = async (name: string, surname: string) => {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('name', name)
    .eq('surname', surname)
    .single();

  if (error) {
    console.error('Authentication error:', error);
    return null;
  }

  return data;
};

// Función para limpiar todos los matches
export const clearMatches = async (): Promise<void> => {
  const { error } = await supabase
    .from('matches')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Borra todos los registros

  if (error) {
    throw new Error(`Error clearing matches: ${error.message}`);
  }
};

// Función para limpiar todos los teams
export const clearTeams = async (): Promise<void> => {
  const { error } = await supabase
    .from('teams')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Borra todos los registros

  if (error) {
    throw new Error(`Error clearing teams: ${error.message}`);
  }
};