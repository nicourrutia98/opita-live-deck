# Especificación Técnica: Bot de Chat y QR Dinámico

Este documento especifica los contratos de datos, comportamiento del bot e interfaces del sistema de moderación y sincronización de URL.

---

## 1. Mensajes de WebSocket de Chat Adicionales (`chat-server.ts`)

### Presenter Speech (Cliente Administrador -> Servidor)
- Evento para reportar frases finalizadas de la voz del presentador recopiladas por Deepgram.
- Contrato:
  ```json
  { "type": "presenter_speech", "text": "La arquitectura hexagonal nos permite desacoplar los puertos de los adaptadores." }
  ```

---

## 2. Ciclo de Alarmas de PartyKit
- **Inicialización**: En `onConnect`, si no existe alarma programada (`await room.storage.getAlarm() === null`), se programa una en `Date.now() + 120000` (2 minutos).
- **Ejecución (`onAlarm`)**:
  1. Obtener número de conexiones activas.
  2. Si es 0, no hacer nada y borrar/no reprogramar la alarma.
  3. Si es mayor a 0:
     - Recopilar estado de la sala (chat reciente, current_slide, presenter_speech).
     - Ejecutar llamada de IA a DeepSeek.
     - Pasar el resultado por `filterProfanity`.
     - Hacer broadcast del mensaje a la sala con `type: "chat_message"` y username `"OpitaBot"`.
     - Programar la siguiente alarma en `Date.now() + 120000 + Math.random() * 60000` (2 a 3 minutos).

---

## 3. Directivas de Prompting y Moderación del Bot (System Prompt)

El system prompt del LLM contendrá las siguientes instrucciones:
- **Rol**: Asistente virtual amigable del evento técnico Opita Code.
- **Formato**: 1 a 2 frases máximas, conciso (menos de 30 palabras).
- **Tono**: Profesional, motivador, con toques de español natural/amigable.
- **Acción**: Comentar en base al chat de la audiencia (si hay mensajes recientes) o sobre el slide/discurso del presentador. Priorizar siempre lo que dice la audiencia.
- **Seguridad**: NUNCA utilizar lenguaje vulgar, insultos, ni comentarios políticos o fuera de lugar. Permanecer strictly neutral y positivo.

---

## 4. Filtro de Groserías en Servidor y Cliente

El regex `BAD_WORDS_REGEX` se actualiza para asegurar un filtro robusto:
```ts
const BAD_WORDS_REGEX = /\b(mierda|puta|puto|carajo|gonorrea|hpta|hp|marica|huevon|guevon|pendejo|malparido|culero|cabron|chimba|perra|mierd)\b/gi;
```
Cualquier mensaje enviado por usuarios o generado por el bot que coincida con este patrón verá la palabra ofensiva reemplazada por un emoji del array de marca (`["✨", "💻", "🚀", "🔥", "⚡", "🔮"]`).
