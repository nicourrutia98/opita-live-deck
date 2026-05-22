import { create } from 'zustand';

interface AINote {
  id: string;
  text: string;
  createdAt: number;
}

interface AINotesState {
  notes: AINote[];
  currentNote: AINote | null;
  addNote: (text: string) => void;
  dismissCurrentNote: () => void;
}

export const useAINotesStore = create<AINotesState>((set) => ({
  notes: [],
  currentNote: null, // Legacy, kept for compatibility if needed, but we will use `notes` array

  addNote: (text: string) => {
    const newNote: AINote = {
      id: Math.random().toString(36).substring(7),
      text,
      createdAt: Date.now(),
    };

    set((state) => {
      // Mantenemos un máximo de 20 notas en el historial para evitar memory leaks
      const updatedNotes = [newNote, ...state.notes].slice(0, 20);
      return { notes: updatedNotes, currentNote: newNote };
    });
  },

  dismissCurrentNote: () => {
    set({ currentNote: null, notes: [] });
  },
}));
