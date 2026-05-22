import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAINotesStore } from '../store/useAINotesStore';

import { SLIDES_COUNT, SlideContent } from '../components/Slides';
import { ArrowLeft, ArrowRight, Play, MonitorSmartphone, Mic, MicOff, Bot, ChevronDown, ChevronUp, QrCode, X, MessageSquare, Trash2 } from 'lucide-react';

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST || "127.0.0.1:1999";

// ── Teleprompter: Notas ultra-compactas y concisas por diapositiva ────────────
const SPEAKER_NOTES: { label: string; content: string }[][] = [
  // ─── Slide 1: Cover ───────────────────────────────────────────────────────
  [
    { label: "🎤 Rompe hielo", content: "¿Quién copió error en ChatGPT sin saber por qué funciona? (Pausa y risas)" },
    { label: "⚡ Tesis", content: "Código base = comoditizado por IA. Valor real = Arquitectura y ESTRUCTURA." },
    { label: "🌐 Gancho", content: "JSON vuela igual desde Neiva que desde Silicon Valley. Barrera es mental." },
    { label: "💡 Cierre", content: "La IA no reemplaza ingenieros, reemplaza pica-códigos. Al senior le da superpoderes." },
  ],

  // ─── Slide 2: El Problema ─────────────────────────────────────────────────
  [
    { label: "🔥 Problema", content: "Devs copian sin entender Event Loop/CD/Garbage Collection -> sistemas frágiles." },
    { label: "🏛️ Solución", content: "Humano = Diseña contratos y límites (Arquitecto). IA = Escribe boilerplate (Coder)." },
    { label: "🎯 Ancla", content: "Ingeniería = control de complejidad a escala. ESCRIBIR código NO es INGENIERÍA." },
  ],

  // ─── Slide 3: Silicon Valley vs. El Magdalena ────────────────────────────
  [
    { label: "🔧 Stack hoy", content: "Dev en el Magdalena: CDK + Lambda + DynamoDB. Antes team DevOps, hoy un dev con IA." },
    { label: "🗺️ Clean Arch", content: "Evita acoplamiento. Diseña entidad con puertos y adaptadores. Sé el Senior." },
    { label: "📐 Teorema CAP", content: "La IA no salva base de datos mal diseñada. Conceptos > Código." },
  ],

  // ─── Slide 4: Tu Pasante Estrella ─────────────────────────────────────────
  [
    { label: "🤖 Metáfora", content: "IA = pasante veloz (1000 tok/s). Sabe toda la doc pero no entiende tu negocio." },
    { label: "📋 Contexto", content: "Contexto es TODO: esquemas + reglas + arquitectura = precisión." },
    { label: "🧪 TDD", content: "Escribe test -> pásalo a la IA -> 'haz que pase'. Software robusto rápido." },
  ],

  // ─── Slide 5: Vibe Studio ─────────────────────────────────────────────────
  [
    { label: "🏗️ Transición", content: "De teoría a producción. Conceptos convertidos en herramientas." },
    { label: "⚡ Qué es", content: "Vibe Studio: vibe-coding en español. Humano dirige, IA ejecuta con tests y deploy." },
    { label: "🔌 Ejemplo", content: "WhatsApp -> descuento stock. Conexión en horas, sin preocuparse por Kubernetes." },
  ],

  // ─── Slide 6: Ecosistema Opita Code ───────────────────────────────────────
  [
    { label: "🏢 Nosotros", content: "SaaS reales con APIs, Webhooks, GraphQL. No demos de juguete." },
    { label: "⚙️ Stack", content: "React/Vite + Serverless AWS. Componentes desacoplados." },
    { label: "🚀 Productos", content: "Vibe Studio, Trabajos (empleo tech), Cuentas (SSO), Barber, Sync. Mismos estándares." },
  ],

  // ─── Slide 7: Demo en Vivo ────────────────────────────────────────────────
  [
    { label: "🎯 Intro demo", content: "Prueba de estrés real en el Edge con la audiencia." },
    { label: "📱 Acción", content: "Activar input -> Mostrar QR -> Audiencia ingresa rol en tiempo real." },
    { label: "🚨 Plan B", content: "Si falla WiFi: activa modo demo. Resiliencia, retries y logs transparentes." },
  ],

  // ─── Slide 8: Cierre ──────────────────────────────────────────────────────
  [
    { label: "💬 Recap", content: "IA no reemplaza, potencia. Sin bases = copy-paster. Con bases = arquitecto." },
    { label: "🌎 Regional", content: "Competimos globalmente con lógica. Criterio se construye desde Neiva." },
    { label: "🎓 CTA", content: "opitacode.com (aprender), vibe.opitacode.com (crear), trabajos.opitacode.com (talent)." },
  ],
];

export default function Presenter() {
  const { 
    currentSlide, 
    setSlide, 
    isDemoMode, 
    toggleDemoMode, 
    isQRFullscreen, 
    toggleQRFullscreen, 
    isConnected, 
    initializePartySocket,
    // Chat values extracted from store
    chatMessages,
    isChatConnected,
    initializeChatSocket,
    sendChatMessage,
    resetChatAndDemo
  } = useAppStore();

  const [isRecording, setIsRecording] = useState(false);
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const deepgramSocketRef = useRef<WebSocket | null>(null);
  
  // Throttle refs para DeepSeek
  const transcriptBufferRef = useRef<string>("");
  const lastDeepSeekCallRef = useRef<number>(0);
  // Ref para leer el beat actual dentro del closure de Deepgram sin stale state
  const noteStepRef = useRef<number>(0);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const room = searchParams.get("room") || "presentation";
    initializePartySocket(PARTYKIT_HOST, room);
    initializeChatSocket(PARTYKIT_HOST, room);
    
    // Listener de prueba E2E (Shift+A) para inyectar nota simulada
    const handleTestKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'A') {
        useAINotesStore.getState().addNote("Nota de prueba inyectada por TDD");
      }
    };
    window.addEventListener('keydown', handleTestKey);
    return () => window.removeEventListener('keydown', handleTestKey);
  }, [initializePartySocket, initializeChatSocket]);

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      if (deepgramSocketRef.current) deepgramSocketRef.current.close();
      setIsRecording(false);
      return;
    }

    try {
      const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
      if (!apiKey) {
        alert("Falta la API Key de Deepgram en el archivo .env");
        return;
      }

      // Validación crucial de HTTPS / Soporte de Micrófono
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Tu navegador no permite acceso al micrófono. Esto ocurre si usas HTTP en lugar de HTTPS (ej. red local sin certificado) o si los permisos están denegados.");
        return;
      }

      // Conectar a Deepgram
      const socket = new WebSocket('wss://api.deepgram.com/v1/listen?model=nova-2&language=es&smart_format=true&interim_results=true', [
        'token',
        apiKey
      ]);

      socket.onopen = () => {
        console.log('✅ Conectado a Deepgram STT');
        deepgramSocketRef.current = socket;
        
        // Iniciar captura de micrófono
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0 && socket.readyState === 1) {
              socket.send(event.data);
            }
          };

          mediaRecorder.start(250); // Enviar chunk cada 250ms
          setIsRecording(true);
        });
      };

      socket.onmessage = async (message) => {
        const received = JSON.parse(message.data);
        const transcript = received.channel?.alternatives[0]?.transcript;
        if (transcript && received.is_final) {
          console.log('🎙️ Orador (Final):', transcript);
          
          // Acumular el texto para darle contexto real a DeepSeek
          transcriptBufferRef.current += " " + transcript;
          
          const now = Date.now();
          // Lógica de Throttle: Llamar a la IA máximo cada 15 segundos y solo si hay suficiente contexto hablado
          if (now - lastDeepSeekCallRef.current > 15000 && transcriptBufferRef.current.length > 30) {
            lastDeepSeekCallRef.current = now;
            const textToAnalyze = transcriptBufferRef.current;
            transcriptBufferRef.current = ""; // Limpiamos el buffer
            
            try {
              const dsKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
              if (!dsKey) {
                console.warn("Falta VITE_DEEPSEEK_API_KEY, simulando nota...");
                useAINotesStore.getState().addNote("Simulación: Conecta esta idea con la diapositiva " + useAppStore.getState().currentSlide);
                return;
              }

              const response = await fetch("https://api.deepseek.com/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${dsKey}`
                },
                body: JSON.stringify({
                  model: "deepseek-chat",
                  messages: [
                    { 
                      role: "system", 
                      content: (() => {
                        const slide = useAppStore.getState().currentSlide;
                        const beat = SPEAKER_NOTES[slide - 1]?.[noteStepRef.current];
                        const beatContext = beat
                          ? `\n\nBeat actual en el guion: "${beat.label}" — Contexto: "${beat.content}"`
                          : '';
                        return `Eres un copiloto técnico para un orador en vivo. El orador (Nico) está en la Diapositiva ${slide}.${beatContext}\n\nNico es un improvisador técnico. Acaba de decir algo. Tu misión: darle UNA sola dirección de máximo 10 palabras que lo ayude a conectar lo que dijo con el beat donde está, o a cerrar/avanzar con ritmo. Ejemplos: "Cierra la idea técnica", "Conecta con el Webhook", "Acelera, la audiencia está enganchada". NO le dictes qué decir palabra a palabra.`;
                      })()
                    },
                    { role: "user", content: textToAnalyze }
                  ]
                })
              });
              const data = await response.json();
              const aiNote = data.choices[0].message.content;
              useAINotesStore.getState().addNote(aiNote);
            } catch (err) {
              console.error("Error llamando a DeepSeek:", err);
            }
          }

        } else if (transcript) {
          console.log('🎙️ Orador (Intermedio):', transcript);
        }
      };

      socket.onclose = () => {
        console.log('❌ Desconectado de Deepgram');
        setIsRecording(false);
      };

    } catch (error) {
      console.error("Error accediendo al micrófono:", error);
      alert("Error accediendo al micrófono. Revisa los permisos.");
    }
  };

  const [noteStep, setNoteStep] = useState(0);
  const [prevSlide, setPrevSlide] = useState(currentSlide);
  if (currentSlide !== prevSlide) {
    setPrevSlide(currentSlide);
    setNoteStep(0);
  }

  // Mantener la ref sincronizada siempre con el state
  useEffect(() => {
    noteStepRef.current = noteStep;
  }, [noteStep]);

  const handleNext = () => {
    if (currentSlide < SLIDES_COUNT) setSlide(currentSlide + 1);
  };

  const handlePrev = () => {
    if (currentSlide > 1) setSlide(currentSlide - 1);
  };

  return (
    <div className="min-h-screen bg-[#EFEFEB] flex flex-col md:flex-row relative">
      {/* Columna Principal */}
      <div className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto max-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center bg-[#F7F7F4] p-4 rounded-2xl border border-[#D9D9D3] shadow-sm">
          <div>
            <img src="/opita-horizontal-dark.svg" alt="Opita Code" className="h-6 mb-2" />
            <h1 className="text-xl font-bold text-[#111111] leading-none">Admin Panel</h1>
          </div>
          <div className="flex gap-3">
            <button 
              id="chat-toggle-btn"
              onClick={() => setIsChatSidebarOpen(!isChatSidebarOpen)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                isChatSidebarOpen
                  ? 'bg-[#c2410c] text-white border-[#ea580c]'
                  : 'bg-white text-[#111111] border-[#D9D9D3] hover:bg-gray-50'
              }`}
            >
              <MessageSquare className={`w-4 h-4 ${isChatSidebarOpen ? 'text-white' : 'text-gray-700'}`} />
              <span className="hidden md:inline">Chat</span>
              {chatMessages.length > 0 && !isChatSidebarOpen && (
                <span className="ml-1 bg-[#ea580c] text-white rounded-full text-xs px-1.5 py-0.5 animate-bounce">
                  {chatMessages.length}
                </span>
              )}
            </button>

            <button 
              id="qr-toggle-btn"
              onClick={toggleQRFullscreen}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                isQRFullscreen
                  ? 'bg-[#c2410c] text-white border-[#ea580c]'
                  : 'bg-white text-[#111111] border-[#D9D9D3] hover:bg-gray-50'
              }`}
            >
              <QrCode className={`w-4 h-4 ${isQRFullscreen ? 'text-white' : 'text-gray-700'}`} />
              <span className="hidden md:inline">{isQRFullscreen ? 'Ocultar QR' : 'Mostrar QR'}</span>
            </button>

            <button 
              id="mic-toggle-btn"
              onClick={toggleRecording}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                isRecording 
                  ? 'bg-red-100 text-red-700 border-red-300' 
                  : 'bg-white text-[#111111] border-[#D9D9D3] hover:bg-gray-50'
              }`}
            >
              {isRecording ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4 text-gray-500" />}
              <span>{isRecording ? 'Escuchando IA...' : 'Micrófono IA'}</span>
            </button>

            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg text-sm font-medium border border-[#D9D9D3]">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-600 animate-pulse' : 'bg-[#dc2626]'}`} />
              <span className="text-[#111111]">{isConnected ? 'LIVE' : 'OFF'}</span>
            </div>
          </div>
        </header>

        {/* Navigation Controls (HUGE for mobile) */}
        <div className="bg-[#F7F7F4] p-4 rounded-2xl border border-[#D9D9D3] shadow-sm flex flex-col gap-4">
          <div className="text-center font-mono text-[#72726D] font-bold text-xl">
            Diapositiva {currentSlide} <span className="opacity-50">/ {SLIDES_COUNT}</span>
          </div>
          <div className="flex gap-4">
            <button 
              id="prev-slide-btn"
              onClick={handlePrev}
              disabled={currentSlide === 1}
              className="flex-1 py-8 bg-white border border-[#D9D9D3] hover:bg-[#EFEFEB] active:bg-[#D9D9D3] disabled:opacity-50 rounded-xl transition-colors flex flex-col items-center justify-center gap-2"
            >
              <ArrowLeft className="w-8 h-8 text-[#111111]" />
              <span className="text-[#111111] font-medium text-lg">Anterior</span>
            </button>

            <button 
              id="next-slide-btn"
              onClick={handleNext}
              disabled={currentSlide === SLIDES_COUNT}
              className="flex-1 py-8 bg-[#c2410c] hover:bg-[#ea580c] active:bg-[#9a3412] disabled:opacity-50 rounded-xl transition-colors shadow-lg shadow-orange-500/20 flex flex-col items-center justify-center gap-2"
            >
              <ArrowRight className="w-8 h-8 text-white" />
              <span className="text-white font-medium text-lg">Siguiente</span>
            </button>
          </div>
        </div>

        {/* Copiloto IA (Feed Colapsable) */}
        <AIFeedPanel />

        {/* Notes (Guion Dinámico) */}
        <SpeakerNotes
          slide={currentSlide}
          step={noteStep}
          onStep={setNoteStep}
        />

        {/* Action Triggers */}
        <div className="bg-[#F7F7F4] p-5 rounded-2xl border border-[#D9D9D3] shadow-sm flex flex-col gap-4">
          <h3 className="text-[#111111] font-medium">Acciones Especiales</h3>
          <button 
            id="demo-toggle-btn"
            onClick={toggleDemoMode}
            className={`w-full py-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
              isDemoMode 
                ? 'bg-[#fef2f2] text-[#dc2626] border border-[#f87171] active:bg-[#fee2e2]' 
                : 'bg-[#111111] text-white border border-[#2A2A2A] active:bg-[#2A2A2A]'
            }`}
          >
            <Play className="w-6 h-6" />
            <span>{isDemoMode ? 'Detener Demo Input' : 'Lanzar Input Interactivo'}</span>
          </button>
        </div>

        {/* Preview Panel (Oculto en móvil por espacio, visible en desktop) */}
        <div className="hidden md:flex bg-[#F7F7F4] p-6 rounded-2xl border border-[#D9D9D3] flex-col items-center shadow-sm">
          <h3 className="text-[#72726D] mb-4 flex items-center gap-2">
            <MonitorSmartphone className="w-5 h-5" />
            <span>Previsualización (Audiencia)</span>
          </h3>
          <div className="w-full aspect-video bg-[#EFEFEB] rounded-xl border border-[#D9D9D3] overflow-hidden transform scale-90 origin-top">
             <div className="h-full w-full pointer-events-none p-4">
                <SlideContent slide={currentSlide} />
             </div>
          </div>
        </div>

        {/* QR confirmación inline (solo feedback visual, el fullscreen va al Viewer) */}
        {isQRFullscreen && (
          <div className="bg-[#c2410c] text-white p-4 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <QrCode className="w-6 h-6" />
              <div>
                <p className="font-bold text-base">QR visible en pantalla</p>
                <p className="text-sm text-orange-200">La audiencia puede escanear el código.</p>
              </div>
            </div>
            <button 
              onClick={toggleQRFullscreen}
              className="bg-white/20 hover:bg-white/30 active:bg-white/40 p-2 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Sidebar de Chat de la Audiencia (Collapsible) */}
      {isChatSidebarOpen && (
        <div className="w-full md:w-[350px] lg:w-[400px] border-l border-[#D9D9D3] bg-[#F7F7F4] flex flex-col h-screen shadow-lg sticky top-0 right-0 z-40">
          {/* Header de la Sidebar */}
          <div className="p-4 border-b border-[#D9D9D3] flex justify-between items-center bg-[#EFEFEB]">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#c2410c]" />
              <h2 className="font-bold text-[#111111] text-lg">Canal Audiencia</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isChatConnected ? 'bg-green-600 animate-pulse' : 'bg-[#dc2626]'}`} />
              <span className="text-xs text-gray-500 font-mono">{chatMessages.length} msgs</span>
              <button 
                onClick={() => setIsChatSidebarOpen(false)}
                className="p-1 rounded hover:bg-gray-200 transition-colors ml-2 cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Preset AI/Bot Triggers y Acciones de Limpieza */}
          <div className="p-4 border-b border-[#D9D9D3] bg-[#FDFDFB] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#72726D] uppercase tracking-wide">Acciones de Bot</span>
              <button
                id="clear-all-btn"
                onClick={resetChatAndDemo}
                className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Limpiar chat y roles"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar Todo</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => sendChatMessage("OpitaBot", "🤖 OpitaBot: ¡Bienvenidos a Opita Code Live! Prepárense para llevar su ingeniería al siguiente nivel. 🚀")}
                className="py-2 px-1 text-center bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Saludo Bot
              </button>
              <button 
                onClick={() => sendChatMessage("OpitaBot", "🤖 OpitaBot: Escaneen el QR en pantalla o visiten /interact en sus celulares para interactuar y ganar cupones en tiempo real. 📲")}
                className="py-2 px-1 text-center bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Promocionar QR
              </button>
              <button 
                onClick={() => sendChatMessage("OpitaBot", "🤖 OpitaBot: ¿Por qué los programadores prefieren el modo oscuro? ¡Porque la luz atrae a los bichos! 🐛")}
                className="py-2 px-1 text-center bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Chiste Tech
              </button>
            </div>
          </div>

          {/* Listado de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin">
            {chatMessages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
                <MessageSquare className="w-12 h-12 opacity-30 mb-2" />
                <p className="text-sm">No hay mensajes aún.</p>
                <p className="text-xs">¡Pídele a la audiencia que envíe mensajes desde la página de interacción móvil!</p>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isBot = msg.username === "OpitaBot";
                const isHost = msg.username === "Nico" || msg.username === "Host" || msg.username === "Admin";
                return (
                  <div 
                    key={msg.id} 
                    className={`p-3 rounded-xl border transition-all ${
                      isBot 
                        ? 'bg-purple-50/70 border-purple-200 shadow-sm'
                        : isHost
                          ? 'bg-orange-50/70 border-orange-200 shadow-sm'
                          : 'bg-white border-[#D9D9D3]'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-gray-800">{msg.username}</span>
                        {isBot && (
                          <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-purple-200">
                            BOT
                          </span>
                        )}
                        {isHost && (
                          <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-orange-200">
                            HOST
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-snug break-words">
                      {msg.text}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Formulario para chatear como Host */}
          <div className="p-4 border-t border-[#D9D9D3] bg-[#EFEFEB]">
            <form 
              id="host-chat-form"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem("messageText") as HTMLInputElement;
                if (input.value.trim()) {
                  sendChatMessage("Nico", input.value.trim());
                  input.value = "";
                }
              }}
              className="flex gap-2"
            >
              <input 
                type="text" 
                name="messageText"
                placeholder="Escribe como Nico..." 
                className="flex-1 bg-white border border-[#D9D9D3] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#ea580c] text-gray-800"
              />
              <button 
                type="submit" 
                className="bg-[#c2410c] hover:bg-[#ea580c] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponente para el Feed de Historial de Notas IA
function AIFeedPanel() {
  const { notes } = useAINotesStore();
  const [isOpen, setIsOpen] = useState(true);

  if (notes.length === 0) return null;

  return (
    <div className="bg-[#111111] rounded-2xl border border-[#2A2A2A] shadow-lg flex flex-col overflow-hidden transition-all duration-300">
      {/* Header Interactivo para Colapsar */}
      <button 
        id="ai-feed-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 bg-[#111111] hover:bg-[#1a1a1a] active:bg-[#222222] transition-colors text-left w-full cursor-pointer"
      >
        <div className="flex items-center gap-2 text-[#c2410c] font-bold">
          <Bot className="w-5 h-5" />
          <span>Copiloto IA (Historial)</span>
          <span className="text-xs bg-[#2A2A2A] text-gray-300 px-2 py-0.5 rounded-full ml-2">
            {notes.length}
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {/* Área Scrollable del Feed */}
      {isOpen && (
        <div 
          className="p-4 pt-0 max-h-64 overflow-y-auto flex flex-col gap-3"
          style={{ WebkitOverflowScrolling: 'touch' }} // Optimización Orion/iOS
        >
          {notes.map((note, idx) => (
            <div 
              key={note.id} 
              className={`p-3 rounded-lg border ${
                idx === 0 
                  ? 'bg-[#2A2A2A] border-[#c2410c]/50 shadow-inner' // Resaltar la nota más reciente
                  : 'bg-[#1a1a1a] border-[#2A2A2A] opacity-75'
              }`}
            >
              <p className={`text-white leading-tight ${idx === 0 ? 'text-xl font-semibold' : 'text-md'}`}>
                {note.text}
              </p>
              <span className="text-xs text-gray-500 mt-2 block">
                {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Teleprompter dinámico con navegación por beats ────────────────────────────
function SpeakerNotes({
  slide,
  step,
  onStep,
}: {
  slide: number;
  step: number;
  onStep: (s: number) => void;
 }) {
  const beats = SPEAKER_NOTES[slide - 1] ?? [];
  const current = beats[step];
  const total = beats.length;

  if (!current) return null;

  return (
    <div className="bg-[#F7F7F4] rounded-2xl border border-[#D9D9D3] shadow-sm overflow-hidden">
      {/* Header con progreso */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h2 className="text-sm font-semibold text-[#72726D] uppercase tracking-wide">Notas de Orador</h2>
        <div className="flex items-center gap-1">
          {beats.map((_, i) => (
            <button
              key={i}
              onClick={() => onStep(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'bg-[#c2410c] w-4' : 'bg-[#D9D9D3] hover:bg-[#72726D]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Beat Label */}
      <div className="px-5 pb-1">
        <span className="text-xs font-mono font-bold text-[#c2410c] bg-orange-50 px-2 py-0.5 rounded-md">
          {current.label} &nbsp;·&nbsp; {step + 1} / {total}
        </span>
      </div>

      {/* Contenido del beat */}
      <div className="px-5 pb-4 pt-2">
        <p className="text-[#111111] text-xl leading-relaxed font-medium">
          {current.content}
        </p>
      </div>

      {/* Navegación ← → */}
      <div className="flex border-t border-[#D9D9D3]">
        <button
          id="prev-note-btn"
          onClick={() => onStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="flex-1 py-4 flex items-center justify-center gap-2 text-[#111111] font-semibold text-base active:bg-[#EFEFEB] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Anterior</span>
        </button>
        <div className="w-px bg-[#D9D9D3]" />
        <button
          id="next-note-btn"
          onClick={() => onStep(Math.min(total - 1, step + 1))}
          disabled={step === total - 1}
          className="flex-1 py-4 flex items-center justify-center gap-2 text-[#c2410c] font-semibold text-base active:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <span>Siguiente</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
