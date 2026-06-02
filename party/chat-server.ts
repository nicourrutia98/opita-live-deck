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
  1: "Inicio de la charla. Tesis: La inteligencia artificial automatiza la escritura de código básica, pero el verdadero valor humano está en planear cómo se estructuran y conectan las aplicaciones de manera estable.",
  2: "El desafío: A veces usamos la tecnología copiando soluciones rápidas sin entender cómo funciona realmente por dentro (por ejemplo, cómo maneja la memoria o el orden de las tareas).",
  3: "Talento global: Cómo diseñar software ordenado y de alta calidad para competir a nivel mundial desde Neiva, Huila y toda la región del Magdalena.",
  4: "La IA como asistente: La inteligencia artificial escribe muy rápido pero le falta entender el contexto del negocio y de las personas. Se necesitan reglas claras para guiarla correctamente.",
  5: "Vibe Studio: Nuestra plataforma moderna que permite crear y poner en línea aplicaciones de forma sencilla y veloz, facilitando la integración con servicios cotidianos como WhatsApp.",
  6: "Ecosistema Opita Code: Productos y plataformas locales creadas con alta calidad para impulsar el desarrollo tecnológico de nuestra comunidad.",
  7: "Demostración en vivo: Un espacio interactivo donde las personas de la audiencia usan sus celulares para enviar su perfil o lo que quieren hacer en tecnología en tiempo real.",
  8: "Cierre: La tecnología potencia a quienes comprenden las bases fundamentales y diseñan con orden. Invitación a visitar opitacode.com.",
};

function getLocalFallbackBotMessage(slide: number, chatRecent: ChatMessage[]): string {
  const fallbacks: Record<number, string[]> = {
    1: [
      "¡Bienvenidos a todos! La tecnología es asombrosa si entendemos cómo estructurar nuestras ideas.",
      "¡Qué alegría verlos aquí! Compartan sus opiniones y preguntas en el chat desde ya."
    ],
    2: [
      "Copiar y pegar sin entender es como construir una casa sin planos. ¡Es clave comprender las bases!",
      "La tecnología funciona mejor cuando sabemos qué pasa detrás de escena."
    ],
    3: [
      "¡Desde nuestra región podemos crear tecnología de clase mundial para todo el planeta!",
      "Diseñar con buenas bases nos permite crear soluciones estables y duraderas."
    ],
    4: [
      "La inteligencia artificial nos da velocidad, pero nosotros decidimos el rumbo y el propósito.",
      "La IA es como un asistente veloz; la dirección y el contexto los pones tú."
    ],
    5: [
      "Vibe Studio es ideal para crear aplicaciones muy rápido. ¿Ya tienen su beneficio activo?",
      "Crear y lanzar proyectos digitales ahora es más fácil que nunca con herramientas modernas."
    ],
    6: [
      "En Opita Code creamos soluciones reales para impulsar el talento de nuestra comunidad.",
      "Hay un mundo de oportunidades para todos en el ecosistema tecnológico local."
    ],
    7: [
      "¡Comparte tu rol o lo que te gustaría hacer en tecnología para verlo en pantalla!",
      "La demostración en vivo está lista. ¡Envía tu perfil ahora mismo!"
    ],
    8: [
      "¡Increíble encuentro! Gracias por acompañarnos. Sigamos construyendo juntos en opitacode.com",
      "El aprendizaje nunca termina. ¡Nos vemos en el próximo evento!"
    ]
  };

  const humanRecent = chatRecent.filter(m => m.username !== "OpitaBot");
  if (humanRecent.length > 0) {
    const lastMsg = humanRecent[humanRecent.length - 1];
    const interactiveResponses = [
      `¡Totalmente de acuerdo, @${lastMsg.username}! La tecnología nos abre muchas puertas si la usamos con propósito. 🚀`,
      `Excelente punto, @${lastMsg.username}. Justo sobre eso, ¿qué opinan los demás en el chat? 💻`,
      `¡Así se habla, @${lastMsg.username}! En nuestra región hay muchísimo talento para lograr grandes proyectos. 🧡`,
      `Buen aporte, @${lastMsg.username}. Ese enfoque ayuda mucho a entender cómo estructurar soluciones reales. ⚡`,
      `¡Gran comentario, @${lastMsg.username}! La clave está en no tener miedo de experimentar y aprender algo nuevo. 🌟`
    ];
    return interactiveResponses[Math.floor(Math.random() * interactiveResponses.length)];
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

  const systemPrompt = `Eres "OpitaBot", el asistente virtual amigable de la conferencia "Opita Code".
Estamos en la diapositiva ${slide} del evento.
Temática de la diapositiva: "${slideDesc}"

Tus directrices estrictas:
1. Respuestas de máximo 1 o 2 frases, sumamente conciso (menos de 30 palabras).
2. Tono muy cálido, motivador, amigable e inclusivo, en español latinoamericano neutro y estándar (sin modismos regionales, voseo o jergas).
3. Actúa como un anfitrión que anima a toda la audiencia (público general no técnico) a participar e interactuar en el chat.
4. Explica cualquier concepto técnico mencionado en el chat o por el presentador usando analogías cotidianas y sencillas que cualquiera entienda.
5. Prioriza siempre interactuar con el chat reciente de la audiencia respondiendo a sus preguntas o comentarios de manera amigable.
6. Jamás uses groserías, palabras obscenas ni insultos.
7. Habla únicamente sobre tecnología, desarrollo de proyectos y lo que se está viviendo en la conferencia.
8. NO te respondas a ti mismo ni interactúes con tus propios mensajes anteriores. Enfócate únicamente en responder a la audiencia o comentar lo que dice el orador.

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
          { role: "user", content: "Genera tu intervención breve ahora." }
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

        // Programar respuesta rápida en 5-10 segundos si no hay una alarma inminente
        const currentAlarm = await room.storage.getAlarm();
        const now = Date.now();
        if (currentAlarm === null || currentAlarm > now + 10000) {
          await room.storage.setAlarm(now + 5000 + Math.random() * 5000);
        }
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
          botText = "¡Excelente charla! Gracias a todos por acompañarnos. Visiten opitacode.com para seguir construyendo. 🧡";
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

      // Evitar responder si el último mensaje ya es de OpitaBot
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.username === "OpitaBot") {
        const nextDelay = 120000 + Math.random() * 60000;
        await room.storage.setAlarm(Date.now() + nextDelay);
        return;
      }

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
