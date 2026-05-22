# Especificación Técnica: Interactividad y Personalización Visual

Este documento define el comportamiento, interfaces de comunicación, eventos del chat, bots de IA y el sistema de personalización visual.

---

## 1. Temas Visuales por Diapositiva

Cada diapositiva tendrá su propia paleta de colores y variables CSS para el fondo, texto y acentos:

| Diapositiva | Producto / Tema | Fondo (Gradient/Color) | Acento | Estilo de Tarjetas |
|---|---|---|---|---|
| 1 - Cover | Opita General | `#FAFAFA` | `#c2410c` (Opita Orange) | Líneas finas, minimalismo |
| 2 - Problema | Crítica / Alerta | `#FAFAFA` con tintes rojos suaves | `#dc2626` (Rojo) | Borde de advertencia |
| 3 - SV vs Magd | Geografía y Nube | `#FAFAFA` con degradado azul cielo | `#0284c7` (Azul Nube) | Código IaC en terminal |
| 4 - Pasante Est. | IA / Copiloto | `#FAFAFA` con degradado ámbar | `#d97706` (Ámbar) | Grid de dos columnas |
| 5 - Vibe Studio | Vibe Coding | `#faf5ff` a `#f3e8ff` (Violeta) | `#7c3aed` (Violeta Vibe) | Glassmorphism, código sintaxis |
| 6 - Ecosistema | Corporativo Tech | `#f0fdf4` (Esmeralda suave) | `#16a34a` (Esmeralda) | Grid de 3 tarjetas |
| 7 - Demo en Vivo | Terminal Activa | `#09090B` (Oscuro profundo) | `#22c55e` (Verde Neón) | Cyberpunk, logs activos |
| 8 - Cierre | Premium | `#09090B` a `#1c1917` (Negro/Piedra) | `#ea580c` (Naranja brillante) | Gran contraste y elegancia |

---

## 2. Mensajes y Protocolo de WebSocket (`chat-server.ts`)

El servidor maneja dos tipos principales de flujos: **Chat general** e **Interacciones de la demo**.

### Mensajes del Cliente al Servidor
- **Chat**: Enviar un mensaje de texto.
  ```json
  { "type": "chat", "username": "Nico", "text": "¡Espectacular la conferencia!" }
  ```
- **Demo**: Enviar un rol/perfil para el Slide 7.
  ```json
  { "type": "demo_submit", "role": "DevOps Senior" }
  ```

### Mensajes del Servidor al Cliente
- **Sync Chat**: Historial inicial de mensajes al conectarse.
  ```json
  { "type": "chat_sync", "messages": [...] }
  ```
- **New Chat**: Difusión de un nuevo mensaje.
  ```json
  { "type": "chat_message", "id": "uuid", "username": "Nico", "text": "...", "createdAt": 1779456700000 }
  ```
- **Sync Demo**: Historial de roles de la demo para el Viewer.
  ```json
  { "type": "demo_sync", "roles": [...] }
  ```
- **New Demo Submit**: Difusión de un nuevo rol ingresado.
  ```json
  { "type": "demo_role", "role": "DevOps Senior" }
  ```
- **Admin Reset**: Limpiar el chat o las respuestas de la demo desde el Panel de Control.
  ```json
  { "type": "reset" }
  ```

---

## 3. Comportamiento del Bot Moderador de IA ("OpitaBot")

El servidor de chat disparará mensajes automáticos imitando a un bot de soporte técnico en el chat:
- **Al cambiar al Slide 5 (Vibe Studio)**: `"🤖 OpitaBot: ¿Listos para programar con vibras? He liberado el cupón de Vibe Studio en sus pantallas. ¡A canjearlo!"`
- **Al cambiar al Slide 6 (Ecosistema)**: `"🤖 OpitaBot: En la variedad está el placer. Canjeen su cupón de Trabajos Pro para buscar su próximo reto tech."`
- **Al cambiar al Slide 7 (Demo en Vivo)**: `"🤖 OpitaBot: ¡Llegó la hora de la verdad! Escriban su perfil soñado en su móvil. Cuidado con romper la base de datos... 💥"`
- **Al enviar un rol en el Slide 7**: Un mensaje de IA aleatorio agradeciendo el envío: `"🤖 OpitaBot: ¡Buen rol! Se agregó a la visualización principal."`

---

## 4. Filtrado de Contenido (Profanity Filter)

Para evitar incidentes desagradables en vivo, la vista del Viewer y el Servidor de Chat aplicarán un filtro client-side sencillo pero efectivo para bloquear palabras groseras habituales en español y expresiones ofensivas antes de renderizarlas en el proyector. Las palabras ofensivas se reemplazarán por emojis como `✨`, `💻` o `🚀`.
