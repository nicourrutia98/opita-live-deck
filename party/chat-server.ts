import type { Party, PartyKitServer, Connection } from "partykit/server";

interface ChatMessage {
  id: string;
  username: string;
  text: string;
  createdAt: number;
}

const BAD_WORDS_REGEX = /\b(mierda|puta|puto|carajo|gonorrea|hpta|hp|marica|huevon|guevon|pendejo|malparido|culero|cabron|chimba|perra|mierd)\b/gi;
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

const SLIDE_DESCRIPTIONS: Record<number, string> = {
  1: "Portada de la presentación. Tesis: La IA no reemplaza ingenieros, sino a los pica-códigos. El valor real está en la arquitectura.",
  2: "El Problema: Devs copian y pegan código sin entender bases conceptuales (Event Loop, CD, Garbage Collection).",
  3: "Silicon Valley vs. El Magdalena: Clean Architecture, modularidad, puertos y adaptadores. Competir globalmente desde Neiva.",
  4: "Tu Pasante Estrella: La IA es como un pasante rápido pero sin contexto de negocio. Se necesita TDD y contratos claros.",
  5: "Vibe Studio: Plataforma de vibe-coding en español con deploy automático e integración rápida (ej. WhatsApp).",
  6: "Ecosistema Opita Code: SaaS reales como Vibe Studio, Opita Trabajos, Cuentas, Barber, Sync. Altos estándares.",
  7: "Demo en Vivo: La audiencia envía sus roles a la pantalla en tiempo real mediante QR.",
  8: "Cierre: La IA potencia a quienes tienen bases sólidas. Visitar opitacode.com.",
};

function getLocalFallbackBotMessage(slide: number, chatRecent: ChatMessage[]): string {
  const fallbacks: Record<number, string[]> = {
    1: [
      "¡Bienvenidos todos! La IA es una herramienta brutal si sabés arquitectura.",
      "Qué bueno ver gente apasionada. ¡Hoy hablamos de conceptos sólidos!"
    ],
    2: [
      "Copiar y pegar sin entender te hace esclavo del código. ¡A estudiar los fundamentos!",
      "La arquitectura es la clave para dominar la complejidad."
    ],
    3: [
      "Desde el Huila exportamos software de calidad mundial. ¡Pensá en grande!",
      "Clean Architecture no es opcional, es tu seguro de vida como dev."
    ],
    4: [
      "La IA escribe rápido, pero vos sos el que toma las decisiones difíciles.",
      "¿Ya usan TDD? Es el mejor amigo de la inteligencia artificial."
    ],
    5: [
      "Vibe Studio es un golazo para crear apps volando. ¿Ya reclamaron su cupón?",
      "Despliegues al Edge en minutos. Vibe Studio la rompe."
    ],
    6: [
      "En Opita Code creamos soluciones reales para la comunidad.",
      "El talento local tiene espacio de sobra en nuestro ecosistema."
    ],
    7: [
      "¡Lanzá tu rol al proyector! Quiero ver qué perfil tenés.",
      "La demo en vivo está corriendo. ¡Mandá tu stack ahora!"
    ],
    8: [
      "¡Tremenda charla! Gracias por sumarse. A seguir aprendiendo en opitacode.com",
      "El conocimiento es poder. ¡Nos vemos en el próximo evento!"
    ]
  };

  if (chatRecent.length > 0) {
    const lastMsg = chatRecent[chatRecent.length - 1];
    return `¡Grande @${lastMsg.username}! Tenés toda la razón con lo que decís en el chat.`;
  }

  const options = fallbacks[slide] || fallbacks[1];
  return options[Math.floor(Math.random() * options.length)];
}

async function callDeepSeek(
  apiKey: string,
  slide: number,
  chatRecent: ChatMessage[],
  presenterRecent: string[]
): Promise<string> {
  const slideDesc = SLIDE_DESCRIPTIONS[slide] || "Charla de desarrollo de software y arquitectura.";
  const chatContext = chatRecent.map(m => `@${m.username}: ${m.text}`).join("\n");
  const presenterContext = presenterRecent.join("\n");

  const systemPrompt = `Eres "OpitaBot", el asistente virtual amigable de la conferencia técnica "Opita Code".
Estamos en la diapositiva ${slide} del evento.
Temática de la diapositiva: "${slideDesc}"

Tus directrices estrictas:
1. Respuestas de máximo 1 o 2 frases, sumamente conciso (menos de 30 palabras).
2. Tono profesional, motivador, amigable, con el acento argentino/rioplatense natural (usá voseo, ej: "estás", "tenés", "mirá", "dale").
3. Basar tu comentario en lo que dice la audiencia en el chat reciente (si hay) o en lo que acaba de decir el presentador. Priorizá siempre responderle a la audiencia.
4. Jamás uses groserías, palabras obscenas ni insultos.
5. Hablá únicamente sobre desarrollo de software, tecnología, la conferencia y lo que se está discutiendo.

Chat reciente de la audiencia:
${chatContext || "(Sin mensajes de la audiencia por ahora)"}

Voz reciente del orador (Nico):
${presenterContext || "(El orador está en silencio por ahora)"}
`;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generá tu intervención breve ahora." }
        ],
        max_tokens: 60,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error("No content in choices");
    }
    return text.trim();
  } catch (err) {
    console.error("Error calling DeepSeek API, using fallback:", err);
    return getLocalFallbackBotMessage(slide, chatRecent);
  }
}

export default {
  async onConnect(connection: Connection, room: Party) {
    // 1. Cargar historial de chat y roles
    const messages = (await room.storage.get<ChatMessage[]>("messages")) ?? [];
    const demoRoles = (await room.storage.get<string[]>("demoRoles")) ?? [];

    // 2. Sincronizar el nuevo cliente
    connection.send(JSON.stringify({ type: "chat_sync", messages }));
    connection.send(JSON.stringify({ type: "demo_sync", roles: demoRoles }));

    // 3. Programar la alarma si no existe
    const hasAlarm = await room.storage.getAlarm();
    if (hasAlarm === null) {
      await room.storage.setAlarm(Date.now() + 120000); // 2 minutos
    }
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
        if (messages.length > 30) messages.shift();

        await room.storage.put("messages", messages);
        room.broadcast(JSON.stringify({ type: "chat_message", ...newMessage }));
      }

      // ─── Capturar Voz del Presentador ────────────────────────────────────
      if (data.type === "presenter_speech") {
        const text = data.text || "";
        if (text.trim()) {
          const speech = (await room.storage.get<string[]>("presenter_speech")) ?? [];
          speech.push(text);
          if (speech.length > 10) speech.shift();
          await room.storage.put("presenter_speech", speech);
        }
      }

      // ─── Enviar Rol de Demo (Slide 7) ────────────────────────────────────
      if (data.type === "demo_submit") {
        const rawRole = data.role || "";
        if (!rawRole.trim()) return;

        const role = filterProfanity(rawRole).substring(0, 30);
        const demoRoles = (await room.storage.get<string[]>("demoRoles")) ?? [];
        demoRoles.push(role);
        if (demoRoles.length > 50) demoRoles.shift();

        await room.storage.put("demoRoles", demoRoles);
        room.broadcast(JSON.stringify({ type: "demo_role", role }));

        // Mensaje automático del Bot agradeciendo
        const botMessages = [
          `¡Gran rol! Ese "${role}" va a conquistar el Magdalena.`,
          `Registrado "${role}". El futuro tiene acento opita.`,
          `"${role}" agregado. 🚀`,
        ];
        const botText = botMessages[Math.floor(Math.random() * botMessages.length)];
        const botMessage: ChatMessage = {
          id: generateId(),
          username: "OpitaBot",
          text: botText,
          createdAt: Date.now() + 100,
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
        await room.storage.put("current_slide", slide);
        let botText = "";

        if (slide === 5) {
          botText = "¿Listos para programar con buenas vibras? He liberado el cupón de Vibe Studio Pro en sus pantallas. ¡A canjearlo! 🏗️";
        } else if (slide === 6) {
          botText = "El ecosistema es clave. He liberado el cupón de Trabajos Pro para impulsar su carrera. 💼";
        } else if (slide === 7) {
          botText = "¡Llegó la hora de la verdad! Escriban su perfil soñado en su móvil. Cuidado con romper la base de datos... 💥";
        } else if (slide === 8) {
          botText = "¡Tremenda charla! Gracias a todos por acompañarnos. Visiten opitacode.com para seguir construyendo. 🧡";
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
        await room.storage.put("presenter_speech", []);
        await room.storage.put("current_slide", 1);
        room.broadcast(JSON.stringify({ type: "reset" }));
      }

    } catch (err) {
      console.error("Failed to parse chat message:", err);
    }
  },

  async onAlarm(room: Party) {
    const connections = [...room.getConnections()];
    if (connections.length === 0) {
      // Detener bucle de alarmas si nadie está conectado
      await room.storage.deleteAlarm();
      return;
    }

    try {
      // 1. Obtener estado
      const messages = (await room.storage.get<ChatMessage[]>("messages")) ?? [];
      const presenterSpeech = (await room.storage.get<string[]>("presenter_speech")) ?? [];
      const slide = (await room.storage.get<number>("current_slide")) ?? 1;

      // Tomar los últimos 15 mensajes del chat para pasarlos como contexto
      const chatRecent = messages.slice(-15);

      // 2. Generar mensaje por LLM o Local
      const apiKey = room.env.DEEPSEEK_API_KEY as string;
      let text = "";
      if (apiKey) {
        text = await callDeepSeek(apiKey, slide, chatRecent, presenterSpeech);
      } else {
        text = getLocalFallbackBotMessage(slide, chatRecent);
      }

      const filteredText = filterProfanity(text);

      const botMessage: ChatMessage = {
        id: generateId(),
        username: "OpitaBot",
        text: filteredText,
        createdAt: Date.now(),
      };

      messages.push(botMessage);
      if (messages.length > 30) messages.shift();
      await room.storage.put("messages", messages);
      room.broadcast(JSON.stringify({ type: "chat_message", ...botMessage }));
    } catch (err) {
      console.error("Error running alarm cycle:", err);
    }

    // 3. Programar la siguiente alarma para dentro de 2 a 3 minutos (con variación aleatoria)
    const nextDelay = 120000 + Math.random() * 60000;
    await room.storage.setAlarm(Date.now() + nextDelay);
  }
} satisfies PartyKitServer;
