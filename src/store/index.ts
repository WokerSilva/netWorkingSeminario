import { create } from 'zustand';
import { Participant, Match, Team, supabase } from '../lib/supabase';

type UserState = {
  currentUser: Participant | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminData: { id: string; name: string; identification_number: string } | null;
  setCurrentUser: (user: Participant | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setAdminData: (adminData: { id: string; name: string; identification_number: string } | null) => void;
  logout: () => void;
  logoutAdmin: () => void;
  checkAuth: () => Promise<void>;
  checkAdminAuth: () => Promise<void>;
};

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  isAdmin: false,
  adminData: null,
  
  setCurrentUser: (user) => set({ 
    currentUser: user, 
    isAuthenticated: !!user 
  }),
  
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  
  setAdminData: (adminData) => set({ adminData }),
  
  logout: () => {
    // Logout para usuarios normales (directorio)
    set({ 
      currentUser: null, 
      isAuthenticated: false
    });
    localStorage.removeItem('user_data');
  },
  
  logoutAdmin: () => {
    // Logout específico para admin
    set({ 
      isAdmin: false,
      adminData: null
    });
    localStorage.removeItem('admin_id');
    localStorage.removeItem('admin_data');
  },
  
  checkAuth: async () => {
    // Verificar autenticación de usuarios normales (para directorio)
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        set({
          currentUser: user,
          isAuthenticated: true
        });
      } else {
        set({
          currentUser: null,
          isAuthenticated: false
        });
      }
    } catch (error) {
      console.error('Error checking user auth:', error);
      set({
        currentUser: null,
        isAuthenticated: false
      });
    }
  },
  
  checkAdminAuth: async () => {
    // Verificar autenticación de admin (método personalizado)
    try {
      const adminId = localStorage.getItem('admin_id');
      const adminDataStr = localStorage.getItem('admin_data');
      
      if (adminId && adminDataStr) {
        // Verificar que el admin aún existe en la base de datos
        const { data: adminData, error } = await supabase
          .from('admins')
          .select('*')
          .eq('id', adminId)
          .single();

        if (adminData && !error) {
          set({
            isAdmin: true,
            adminData: {
              id: adminData.id,
              name: adminData.name,
              identification_number: adminData.identification_number
            }
          });
        } else {
          // Si no existe, limpiar localStorage
          localStorage.removeItem('admin_id');
          localStorage.removeItem('admin_data');
          set({
            isAdmin: false,
            adminData: null
          });
        }
      } else {
        set({
          isAdmin: false,
          adminData: null
        });
      }
    } catch (error) {
      console.error('Error checking admin auth:', error);
      set({
        isAdmin: false,
        adminData: null
      });
    }
  }
}));

type EventState = {
  participants: Participant[];
  currentRound: number;
  matches: Match[];
  teams: Team[];
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  setCurrentRound: (round: number) => void;
  setMatches: (matches: Match[]) => void;
  setTeams: (teams: Team[]) => void;
};

export const useEventStore = create<EventState>((set) => ({
  participants: [],
  currentRound: 0,
  matches: [],
  teams: [],
  setParticipants: (participants) => set({ participants }),
  addParticipant: (participant) => set((state) => ({
    participants: [...state.participants, participant]
  })),
  setCurrentRound: (round) => set({ currentRound: round }),
  setMatches: (matches) => set({ matches }),
  setTeams: (teams) => set({ teams }),
}));

// Form state for registration
type FormState = {
  isOpen: boolean;
  openForm: () => void;
  closeForm: () => void;
};

export const useFormStore = create<FormState>((set) => ({
  isOpen: false,
  openForm: () => set({ isOpen: true }),
  closeForm: () => set({ isOpen: false }),
}));