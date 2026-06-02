import { create } from 'zustand';
import PartySocket from 'partysocket';

export interface ChatMessage {
  id: string;
  username: string;
  text: string;
  createdAt: number;
}

interface AppState {
  currentSlide: number;
  isDemoMode: boolean;
  isQRFullscreen: boolean;
  qrUrl: string;
  isConnected: boolean;
  
  // Chat & Demo State
  chatMessages: ChatMessage[];
  demoRoles: string[];
  isChatConnected: boolean;

  setSlide: (slide: number) => void;
  toggleDemoMode: () => void;
  toggleQRFullscreen: () => void;
  initializePartySocket: (host: string, room: string) => void;
  
  // Chat & Demo Actions
  initializeChatSocket: (host: string, room: string) => void;
  sendChatMessage: (username: string, text: string) => void;
  sendPresenterSpeech: (text: string) => void;
  submitDemoRole: (role: string) => void;
  resetChatAndDemo: () => void;
}

import { getRoomParam } from '../utils/url';

let ps: PartySocket | null = null;
let chatPs: PartySocket | null = null;

const getDynamicQrUrl = () => {
  if (typeof window === 'undefined') return "https://d3k6c6srmxps7z.cloudfront.net/#/interact";
  const room = getRoomParam();
  return `${window.location.origin}/#/interact?room=${room}`;
};

// ── Helper: enviar update al servidor ────────────────────────────────────────
function sendUpdate(state: Partial<AppState>) {
  if (ps?.readyState === WebSocket.OPEN) {
    ps.send(JSON.stringify({
      type: "update",
      currentSlide: state.currentSlide,
      isDemoMode: state.isDemoMode,
      isQRFullscreen: state.isQRFullscreen,
    }));
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  currentSlide: 1,
  isDemoMode: false,
  isQRFullscreen: false,
  qrUrl: getDynamicQrUrl(),
  isConnected: false,

  // Chat & Demo
  chatMessages: [],
  demoRoles: [],
  isChatConnected: false,

  initializePartySocket: (host: string, room: string) => {
    if (ps) ps.close();

    ps = new PartySocket({ host, room });

    ps.addEventListener("open", () => {
      console.log("PartySocket connected.");
      set({ isConnected: true });
    });

    let adminSynced = false;

    ps.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        const isAdmin = window.location.hash.includes('/admin');

        if (data.type === "sync") {
          if (isAdmin) {
            if (adminSynced) return;
            adminSynced = true;
            set({
              currentSlide: data.currentSlide ?? get().currentSlide,
              isDemoMode: data.isDemoMode ?? get().isDemoMode,
              isQRFullscreen: data.isQRFullscreen ?? get().isQRFullscreen,
            });
            sendUpdate({ ...get() });
            return;
          }
          set({
            currentSlide: data.currentSlide ?? get().currentSlide,
            isDemoMode: data.isDemoMode ?? get().isDemoMode,
            isQRFullscreen: data.isQRFullscreen ?? get().isQRFullscreen,
          });
        }
      } catch (err) {
        console.error("Failed to parse PartySocket message:", err);
      }
    });

    ps.addEventListener("close", () => {
      console.warn("PartySocket disconnected. Reconnecting automatically...");
      set({ isConnected: false });
    });

    ps.addEventListener("error", (err) => {
      console.error("PartySocket error:", err);
    });
  },

  initializeChatSocket: (host: string, room: string) => {
    if (chatPs) chatPs.close();

    chatPs = new PartySocket({ host, room, party: "chat" });

    chatPs.addEventListener("open", () => {
      console.log("Chat PartySocket connected.");
      set({ isChatConnected: true });
    });

    chatPs.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "chat_sync") {
          set({ chatMessages: data.messages });
        } else if (data.type === "demo_sync") {
          set({ demoRoles: data.roles });
        } else if (data.type === "chat_message") {
          set((state) => ({
            chatMessages: [...state.chatMessages, {
              id: data.id,
              username: data.username,
              text: data.text,
              createdAt: data.createdAt
            }].slice(-30)
          }));
        } else if (data.type === "demo_role") {
          set((state) => ({
            demoRoles: [...state.demoRoles, data.role].slice(-50)
          }));
        } else if (data.type === "reset") {
          set({ chatMessages: [], demoRoles: [] });
        }
      } catch (err) {
        console.error("Failed to parse Chat message:", err);
      }
    });

    chatPs.addEventListener("close", () => {
      console.warn("Chat PartySocket disconnected. Reconnecting automatically...");
      set({ isChatConnected: false });
    });

    chatPs.addEventListener("error", (err) => {
      console.error("Chat PartySocket error:", err);
    });
  },

  sendChatMessage: (username: string, text: string) => {
    if (chatPs?.readyState === WebSocket.OPEN) {
      chatPs.send(JSON.stringify({ type: "chat", username, text }));
    }
  },

  sendPresenterSpeech: (text: string) => {
    if (chatPs?.readyState === WebSocket.OPEN) {
      chatPs.send(JSON.stringify({ type: "presenter_speech", text }));
    }
  },

  submitDemoRole: (role: string) => {
    if (chatPs?.readyState === WebSocket.OPEN) {
      chatPs.send(JSON.stringify({ type: "demo_submit", role }));
    }
  },

  resetChatAndDemo: () => {
    if (chatPs?.readyState === WebSocket.OPEN) {
      chatPs.send(JSON.stringify({ type: "reset" }));
    }
  },

  setSlide: (slide: number) => {
    set({ currentSlide: slide });
    sendUpdate({ ...get(), currentSlide: slide });
    // Notificar al chat para que el bot responda
    if (chatPs?.readyState === WebSocket.OPEN) {
      chatPs.send(JSON.stringify({ type: "admin_slide_change", slide }));
    }
  },

  toggleDemoMode: () => {
    const newDemoMode = !get().isDemoMode;
    set({ isDemoMode: newDemoMode });
    sendUpdate({ ...get(), isDemoMode: newDemoMode });
  },

  toggleQRFullscreen: () => {
    const newQRMode = !get().isQRFullscreen;
    set({ isQRFullscreen: newQRMode });
    sendUpdate({ ...get(), isQRFullscreen: newQRMode });
  },
}));
