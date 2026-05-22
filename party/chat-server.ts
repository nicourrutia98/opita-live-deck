import type { Party, PartyKitServer, Connection } from "partykit/server";

interface ChatMessage {
  id: string;
  username: string;
  text: string;
  createdAt: number;
}

const BAD_WORDS_REGEX = /\b(mierda|puta|puto|carajo|gonorrea|hpta|hp|marica|huevon|guevon|pendejo|malparido|culero|cabron)\b/gi;
const REPLACEMENTS = ["✨", "💻", "🚀", "🔥", "⚡", "🛸"];

function filterProfanity(text: string): string {
  let counter = 0;
  return text.replace(BAD_WORDS_REGEX, () => {
    return REPLACEMENTS[counter++ % REPLACEMENTS.length];
  });
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export default {
  async onConnect(connection: Connection, room: Party) {
    // 1. Cargar historial de chat y roles
    const messages = (await room.storage.get<ChatMessage[]>("messages")) ?? [];
    const demoRoles = (await room.storage.get<string[]>("demoRoles")) ?? [];

    // 2. Sincronizar el nuevo cliente
    connection.send(JSON.stringify({ type: "chat_sync", messages }));
    connection.send(JSON.stringify({ type: "demo_sync", roles: demoRoles }));
  },

  async onMessage(message: string, connection: Connection, room: Party) {
    try {
      const data = JSON.parse(message);

      // ─── Enviar Mensaje de Chat ──────────────────────────────────────────
      if (data.type === "chat") {
        const username = filterProfanity(data.username || "Anónimo").substring(0, 15);
        const rawText = data.text || "";
        if (!rawText.trim()) return;

        const text = filterProfanity(rawText).substring(0, 100);
        const newMessage: ChatMessage = {
          id: generateId(),
          username,
          text,
          createdAt: Date.now(),
        };

        const messages = (await room.storage.get<ChatMessage[]>("messages")) ?? [];
        messages.push(newMessage);
        if (messages.length > 30) messages.shift(); // Limitar historial

        await room.storage.put("messages", messages);
        room.broadcast(JSON.stringify({ type: "chat_message", ...newMessage }));
      }

      // ─── Enviar Rol de Demo (Slide 7) ────────────────────────────────────
      if (data.type === "demo_submit") {
        const rawRole = data.role || "";
        if (!rawRole.trim()) return;

        const role = filterProfanity(rawRole).substring(0, 30);
        const demoRoles = (await room.storage.get<string[]>("demoRoles")) ?? [];
        demoRoles.push(role);
        if (demoRoles.length > 50) demoRoles.shift(); // Limitar roles

        await room.storage.put("demoRoles", demoRoles);
        room.broadcast(JSON.stringify({ type: "demo_role", role }));

        // Mensaje automático del Bot agradeciendo
        const botMessages = [
          `🤖 OpitaBot: ¡Gran rol! Ese "${role}" va a conquistar el Magdalena.`,
          `🤖 OpitaBot: Registrado "${role}". El futuro tiene acento opita.`,
          `🤖 OpitaBot: "${role}" agregado. 🚀`,
        ];
        const botText = botMessages[Math.floor(Math.random() * botMessages.length)];
        const botMessage: ChatMessage = {
          id: generateId(),
          username: "OpitaBot",
          text: botText,
          createdAt: Date.now() + 100, // Leve delay
        };
        const messages = (await room.storage.get<ChatMessage[]>("messages")) ?? [];
        messages.push(botMessage);
        if (messages.length > 30) messages.shift();
        await room.storage.put("messages", messages);
        room.broadcast(JSON.stringify({ type: "chat_message", ...botMessage }));
      }

      // ─── Notificación de Cambio de Slide (desde Admin) ────────────────────
      if (data.type === "admin_slide_change") {
        const slide = data.slide;
        let botText = "";

        if (slide === 5) {
          botText = "🤖 OpitaBot: ¿Listos para programar con buenas vibras? He liberado el cupón de Vibe Studio Pro en sus pantallas. ¡A canjearlo! 🏗️";
        } else if (slide === 6) {
          botText = "🤖 OpitaBot: El ecosistema es clave. He liberado el cupón de Trabajos Pro para impulsar su carrera. 💼";
        } else if (slide === 7) {
          botText = "🤖 OpitaBot: ¡Llegó la hora de la verdad! Escriban su perfil soñado en su móvil. Cuidado con romper la base de datos... 💥";
        } else if (slide === 8) {
          botText = "🤖 OpitaBot: ¡Tremenda charla! Gracias a todos por acompañarnos. Visiten opitacode.com para seguir construyendo. 🧡";
        }

        if (botText) {
          const botMessage: ChatMessage = {
            id: generateId(),
            username: "OpitaBot",
            text: botText,
            createdAt: Date.now(),
          };
          const messages = (await room.storage.get<ChatMessage[]>("messages")) ?? [];
          messages.push(botMessage);
          if (messages.length > 30) messages.shift();
          await room.storage.put("messages", messages);
          room.broadcast(JSON.stringify({ type: "chat_message", ...botMessage }));
        }
      }

      // ─── Reset (Admin o Test) ─────────────────────────────────────────────
      if (data.type === "reset") {
        await room.storage.put("messages", []);
        await room.storage.put("demoRoles", []);
        room.broadcast(JSON.stringify({ type: "reset" }));
      }

    } catch (err) {
      console.error("Failed to parse chat message:", err);
    }
  },
} satisfies PartyKitServer;
