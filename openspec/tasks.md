# Plan de Trabajo (Tasks) - Interactividad Premium

## Unidades de Trabajo y Commits

### Unidad 1: Backend de Chat y Estado Zustand
- [ ] Crear `party/chat-server.ts` para gestionar mensajes y demo
- [ ] Modificar `partykit.json` para declarar el servidor de chat
- [ ] Modificar `src/store/useAppStore.ts` con estado y acciones del chat
- [ ] Agregar ruta `/interact` en `src/App.tsx`

### Unidad 2: Vista de Acompañamiento Audiencia (`Interact.tsx`)
- [ ] Crear la página `src/pages/Interact.tsx`
- [ ] Integrar el panel de chat con input en el dispositivo móvil
- [ ] Diseñar tarjetas contextuales dinámicas por slide

### Unidad 3: Temas de Presentación, Chat en Viewer y Admin
- [ ] Crear variables de temas visuales por slide en `src/components/Slides.tsx`
- [ ] Añadir transiciones fluidas de color de fondo en `src/pages/Viewer.tsx`
- [ ] Integrar ticker de chat flotante en el Viewer
- [ ] Mostrar grilla animada de perfiles en el Slide 7 (Demo)
- [ ] Agregar sidebar colapsable de chat en `src/pages/Presenter.tsx`
- [ ] Conectar gatillos automáticos del Bot y reset desde el Admin

### Unidad 4: Control de Calidad y Pruebas E2E
- [ ] Crear pruebas de integración en `tests/prod/interact.spec.ts`
- [ ] Validar suite con `npx playwright test`
- [ ] Validar calidad de código con `npm run lint` y `npm run build`
