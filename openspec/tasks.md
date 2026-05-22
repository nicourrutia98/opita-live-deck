# Tareas de Implementación: Bot Inteligente y QR Dinámico

Lista de tareas para seguir el flujo de desarrollo de la interactividad premium.

---

## Plan de Commits / Unidades de Trabajo

### Unidad 1: QR Dinámico Local sin Pisado del Servidor
- [x] Agregar helper `getDynamicQrUrl` en `src/store/useAppStore.ts` para calcular la URL del interactivo en base a `window.location.origin` y `room`.
- [x] Modificar `initializePartySocket` y `sendUpdate` en `useAppStore.ts` para ignorar `qrUrl` y no pisarlo con el del servidor.
- [x] Eliminar `setQrUrl` y su llamada en `src/pages/Presenter.tsx`.
- [x] Simplificar `src/pages/Viewer.tsx` para que lea `qrUrl` directamente del store de Zustand sin lógicas de fallback complejas.

### Unidad 2: Lógica de Voz del Presentador y Estado de Chat
- [x] Modificar `src/store/useAppStore.ts` para añadir la acción `sendPresenterSpeech(text: string)`.
- [x] Modificar `src/pages/Presenter.tsx` para llamar a `sendPresenterSpeech` cuando la transcripción de Deepgram sea final (`received.is_final`).
- [x] Modificar `party/chat-server.ts` para capturar el mensaje `presenter_speech` y almacenarlo en Durable Storage (máximo 10 enunciados). Guardar el slide activo en `room.storage` ante cambios de diapositiva.

### Unidad 3: Temporizador, LLM y Moderación del Bot
- [x] Modificar `party/chat-server.ts` para implementar el ciclo de alarmas en `onConnect` y `onAlarm`.
- [x] Implementar la llamada a la API de DeepSeek en `onAlarm` pasando la diapositiva, chat de audiencia y voz del presentador como contexto.
- [x] Añadir un fallback local robusto para generar mensajes si falla el LLM o no hay API Key.
- [x] Asegurar que toda respuesta del bot y mensajes del chat pasen por el regex de profanidad `BAD_WORDS_REGEX` y el filtro estricto.

### Unidad 4: Verificación y Compilación
- [x] Ejecutar `npm run build` para asegurar la compilación limpia del proyecto completo.
- [x] Validar linting y corregir cualquier advertencia de TypeScript.
- [ ] Desplegar los cambios y verificar el funcionamiento local/remoto de las salas.
