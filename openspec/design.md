# Diseño Técnico: Estructura de Componentes y Estado

Este documento define la estructura de clases, archivos y el flujo de datos del frontend y backend para el ciclo SDD de Interactividad Premium.

---

## 1. Diseño del Servidor PartyKit (`party/chat-server.ts`)

El servidor maneja dos listas persistentes en Durable Storage:
- `messages`: Un array de objetos `{ id, username, text, createdAt }`.
- `demoRoles`: Un array de strings con los roles enviados por la audiencia.

### Lógica de Conexión (`onConnect`)
1. Enviar el historial de chat con `{ type: "chat_sync", messages }`.
2. Enviar el historial de roles con `{ type: "demo_sync", roles: demoRoles }`.

### Lógica de Mensajes (`onMessage`)
- Si `data.type === "chat"`:
  - Validar y sanitizar texto (filtro de profanidad).
  - Añadir ID, timestamp y almacenar. Limitar a 30 elementos.
  - Guardar en almacenamiento: `room.storage.put("messages", messages)`.
  - Broadcast a todos: `{ type: "chat_message", ...message }`.
- Si `data.type === "demo_submit"`:
  - Validar y sanitizar el string.
  - Añadir al array `demoRoles`. Limitar a 50 elementos para evitar sobrecarga en pantalla.
  - Guardar en almacenamiento.
  - Broadcast a todos: `{ type: "demo_role", role: data.role }`.
- Si `data.type === "reset"`:
  - Vaciar `messages` y `demoRoles`.
  - Guardar y hacer broadcast de `{ type: "reset" }`.

---

## 2. Cambios en el Estado Zustand (`src/store/useAppStore.ts`)

Agregaremos soporte para conectarse a la Party de Chat:
- **Estado**:
  - `chatMessages`: Array de `{ id, username, text, createdAt }`.
  - `demoRoles`: Array de strings.
  - `isChatConnected`: Boolean.
- **Acciones**:
  - `initializeChatSocket(host: string, room: string)`: Conectar a la party `chat`.
  - `sendChatMessage(username: string, text: string)`: Enviar un mensaje de chat.
  - `submitDemoRole(role: string)`: Enviar un rol de la demo.
  - `resetChatAndDemo()`: Enviar un mensaje de reset (solo admin).

---

## 3. Flujo en la Vista de Acompañamiento (`src/pages/Interact.tsx`)

- **Persistencia**: Leer y escribir `username` de `localStorage`.
- **Estructura del Componente**:
  - Si `!username`: Mostrar pantalla de login con un input elegante (Opita Orange tokens) y botón "Entrar al Live".
  - Si `username`: Mostrar layout móvil con:
    - **Header**: Logo de Opita Code, indicador de estado de conexión.
    - **Tarjeta del Slide Activo (Zona 1)**: Cambia automáticamente basado en `currentSlide` de la store.
      - Renderiza subcomponentes: `<WelcomeCard />`, `<VibePromo />`, `<TrabajosPromo />`, `<DemoForm />`, `<FooterLinks />`.
    - **Feed de Chat (Zona 2)**:
      - Lista de mensajes con scroll automático hacia el final al recibir mensajes nuevos.
      - Caja de texto para enviar con límite de 100 caracteres para evitar spam.

---

## 4. Animaciones CSS y Estilos Premium (`index.css` / `App.css`)

- **Suavizado de Temas**: Transición suave en el contenedor principal de `Viewer.tsx`:
  ```css
  .viewer-container {
    transition: background-color 0.8s ease-in-out, color 0.5s ease-in-out;
  }
  ```
- **Chat Bubbles Ticker**: Los mensajes flotantes en el Viewer tendrán una animación de slide-up y fade-in de Tailwind/CSS, y desaparecerán después de 6 segundos.
- **Micro-animaciones**:
  - Botones con efecto hover de escala leve (`hover:scale-[1.02] active:scale-[0.98]`).
  - Tarjetas promocionales con sombras degradadas suaves y transiciones.
  - Confetti en el canjeo usando una micro-animación CSS local o partículas.
