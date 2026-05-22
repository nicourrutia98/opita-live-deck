# Diseño Técnico: Estructura del Bot y QR Dinámico

Este documento define la estructura y flujos de datos específicos para la integración del bot y el QR dinámico.

---

## 1. Modificaciones en el Estado y Acciones de Zustand (`src/store/useAppStore.ts`)

- **Acción Adicional**:
  - `sendPresenterSpeech(text: string)`:
    ```ts
    sendPresenterSpeech: (text: string) => {
      if (chatPs?.readyState === WebSocket.OPEN) {
        chatPs.send(JSON.stringify({ type: "presenter_speech", text }));
      }
    }
    ```

---

## 2. Inicialización Dinámica del QR (`src/store/useAppStore.ts`)

En el store se define una función auxiliar para calcular el QR localmente en base a `window` al cargar el módulo:
```ts
const getDynamicQrUrl = () => {
  if (typeof window === 'undefined') return "https://d3k6c6srmxps7z.cloudfront.net/#/interact";
  const searchParams = new URLSearchParams(window.location.search);
  const room = searchParams.get("room") || "presentation";
  return `${window.location.origin}/?room=${room}#/interact`;
};
```
Este valor inicializa `qrUrl` en el store. Al recibir un evento `"sync"`, el cliente omite actualizar `qrUrl` con los datos del servidor para evitar pisar el estado local con datos desactualizados o de otros entornos (como localhost). El visualizador y el presentador leen directamente del store.

---

## 3. Lógica Interna del Servidor de Chat (`party/chat-server.ts`)

### onConnect:
- Si no hay alarma, programar una alarma para dentro de 120,000ms.
- Guardar `current_slide` en storage si no existe (inicializar en 1).

### onAlarm:
1. Comprobar conexiones activas con `[...room.getConnections()].length`.
2. Si es `0`, borrar alarma (`await room.storage.deleteAlarm()`) y finalizar.
3. Recuperar `messages`, `presenter_speech` y `current_slide` de `room.storage`.
4. Preparar Prompt para DeepSeek:
   - Mapear el `current_slide` a una descripción temática concisa.
   - Formatear los últimos 15 mensajes del chat.
   - Formatear los últimos enunciados de voz del presentador.
5. Hacer llamada HTTP POST a `https://api.deepseek.com/chat/completions`.
   - Timeout de 8 segundos.
   - Headers: `Authorization: Bearer ${apiKey}`.
6. Sanitizar la respuesta con `filterProfanity`.
7. Broadcast del nuevo mensaje de chat `{ type: "chat_message", id, username: "OpitaBot", text, createdAt }`.
8. Programar la siguiente alarma para dentro de `120000 + Math.random() * 60000` milisegundos.

### Fallback en caso de error del LLM:
Si la llamada a la API falla o `DEEPSEEK_API_KEY` no está configurada, el bot elegirá un mensaje de forma pseudo-aleatoria según el slide actual y el chat (por ejemplo, si el slide es 7 y no hay mensajes, invita a la audiencia a participar con un chiste técnico o instrucción del slide).
