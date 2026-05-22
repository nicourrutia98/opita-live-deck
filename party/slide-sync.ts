import type { Party, PartyKitServer, Connection } from "partykit/server";

// ── Estado sincronizado de la presentación ───────────────────────────────────
interface PresentationState {
  currentSlide: number;
  isDemoMode: boolean;
  isQRFullscreen: boolean;
  qrUrl: string;
}

const DEFAULT_STATE: PresentationState = {
  currentSlide: 1,
  isDemoMode: false,
  isQRFullscreen: false,
  qrUrl: "https://d3k6c6srmxps7z.cloudfront.net/#/interact",
};

export default {
  async onConnect(connection: Connection, room: Party) {
    // Enviar estado actual al nuevo cliente (elimina desincronización)
    const state = (await room.storage.get<PresentationState>("state")) ?? DEFAULT_STATE;
    connection.send(JSON.stringify({ type: "sync", ...state }));
  },

  async onMessage(message: string, connection: Connection, room: Party) {
    try {
      const data = JSON.parse(message);

      if (data.type === "ping") return;

      if (data.type === "update") {
        // Actualizar estado persistente
        const current = (await room.storage.get<PresentationState>("state")) ?? DEFAULT_STATE;
        const newState: PresentationState = {
          currentSlide: data.currentSlide ?? current.currentSlide,
          isDemoMode: data.isDemoMode ?? current.isDemoMode,
          isQRFullscreen: data.isQRFullscreen ?? current.isQRFullscreen,
          qrUrl: data.qrUrl ?? current.qrUrl,
        };
        await room.storage.put("state", newState);

        // Broadcast a TODOS excepto al emisor (elimina echo)
        room.broadcast(JSON.stringify({ type: "sync", ...newState }), [connection.id]);
      }
    } catch (err) {
      console.error("Failed to parse message:", err);
    }
  },
} satisfies PartyKitServer;
