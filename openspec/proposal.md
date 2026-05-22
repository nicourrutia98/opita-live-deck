# Propuesta Técnica: Conferencia Premium e Interactividad en Tiempo Real

Propuesta para transformar la conferencia de Opita Code en una experiencia inmersiva, interactiva y premium de 45 minutos. Este plan abarca la sincronización en tiempo real, el chat con moderación por IA, la personalización visual por producto, y la distribución de cupones.

---

## 1. Servidor PartyKit (`chat-server.ts`)

Manejar conexiones concurrentes en la sala de chat y demo.
- Persistir los últimos 30 mensajes en `room.storage`.
- Recibir y difundir respuestas de la demo interactiva.
- Simular respuestas de un bot moderador ("OpitaBot") que interactúa ante cambios de slide.

---

## 2. Aplicación de Acompañamiento Móvil (`Interact.tsx`)

Ubicada en `#/interact`.
- Registro rápido de alias.
- Tarjeta dinámica por slide:
  - Slides 1-4: Bienvenida y enlaces.
  - Slide 5: Cupón de Vibe Studio Pro (`OPITAVIBE45`) con copia automática.
  - Slide 6: Cupón de Trabajos Pro (`OPITATRABAJOS45`) con copia automática.
  - Slide 7: Input interactivo de roles.
  - Slide 8: Cierre y links.
- Chat en vivo.

---

## 3. Visualizador (`Viewer.tsx`) y Diapositivas (`Slides.tsx`)

- El código QR apunta permanentemente a `/#/interact`.
- Chat overlay en la esquina inferior izquierda con fadeout de 6 segundos.
- Diapositiva 7: Grid dinámico con los roles enviados por la audiencia.
- Cambio de color de fondo y temas CSS según el slide activo.

---

## 4. Administrador (`Presenter.tsx`)

- Sidebar colapsable de chat.
- Envío automático de notificaciones a la audiencia sobre cupones/demos al cambiar de slide.
