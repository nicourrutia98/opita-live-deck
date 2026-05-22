# Propuesta Técnica: Bot de Chat Inteligente y QR Dinámico

Esta propuesta detalla la corrección del flujo del QR de interactividad y el desarrollo de un bot de chat para la audiencia (`OpitaBot`) que se comunica de forma asíncrona, moderada y contextualizada.

---

## 1. Servidor PartyKit (`chat-server.ts` & `slide-sync.ts`)

### Sincronización del QR:
- Actualizar `slide-sync.ts` para establecer por defecto la URL en la subruta interactiva `https://d3k6c6srmxps7z.cloudfront.net/#/interact`.

### Automatización de OpitaBot:
- **Almacenamiento Persistente (`room.storage`)**:
  - `messages`: Historial de chat (últimos 30).
  - `presenter_speech`: Historial de discurso hablado (últimos 10 enunciados).
  - `current_slide`: Diapositiva actual (entero, por defecto 1).
- **Planificación por Alarmas (`onAlarm`)**:
  - Un bucle de alarmas que se activa al primer cliente conectado y se ejecuta cada **2 a 3 minutos** (120,000ms a 180,000ms con variación aleatoria para simular respuesta humana).
  - Si no quedan conexiones activas, la alarma se detiene para evitar desperdicio de cómputo y se reprograma al reconectarse un usuario.
- **Integración de IA (DeepSeek)**:
  - Llamadas a la API de chat completions utilizando `room.env.DEEPSEEK_API_KEY`.
  - Fallback local ante fallos o ausencia de API Key.
- **Filtro de Moderación**:
  - Aplicación de `filterProfanity` en el servidor antes de hacer broadcast de cualquier mensaje de OpitaBot o de usuarios de la audiencia.

---

## 2. Cliente del Administrador (`Presenter.tsx`)

- **Envío de Voz**:
  - Enviar el texto transcrito de la voz del presentador mediante `{ type: "presenter_speech", text: transcript }` por el WebSocket del chat cuando finalice una frase.
- **Configuración del QR**:
  - Se elimina la llamada redundante a `setQrUrl` y el cálculo en el montaje. El panel de administración lee su propia URL de QR calculada localmente.

---

## 3. Cliente del Visualizador (`Viewer.tsx`)

- **Sincronización de URL del QR**:
  - El visualizador lee la URL del QR directamente desde el store local de Zustand, el cual calcula dinámicamente el valor en base a `window.location.origin` y el parámetro de sala `room`. Se ignora la URL transmitida por el servidor para evitar que entornos locales sobreescriban la producción.
