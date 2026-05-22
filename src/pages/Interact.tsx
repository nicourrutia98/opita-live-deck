import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { ChatMessage } from '../store/useAppStore';
import { MessageSquare, Send, User, ExternalLink, Sparkles } from 'lucide-react';
import { getSlideTheme } from '../utils/theme';
import { SlideContent } from '../components/Slides';
import { QRCode } from 'react-qr-code';

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST || "127.0.0.1:1999";

function MiniProjector() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);
  
  const currentSlide = useAppStore((state) => state.currentSlide);
  const isDemoMode = useAppStore((state) => state.isDemoMode);
  const isQRFullscreen = useAppStore((state) => state.isQRFullscreen);
  const qrUrl = useAppStore((state) => state.qrUrl);
  const isConnected = useAppStore((state) => state.isConnected);
  const chatMessages = useAppStore((state) => state.chatMessages);
  const demoRoles = useAppStore((state) => state.demoRoles);

  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const updateVisible = () => {
      const now = Date.now();
      const active = chatMessages.filter(msg => now - msg.createdAt < 6000);
      setVisibleMessages(active.slice(-3));
    };

    updateVisible();
    const interval = setInterval(updateVisible, 1000);
    return () => clearInterval(interval);
  }, [chatMessages]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setScale(width / 960);
      }
    });
    observer.observe(containerRef.current);
    
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0) {
      setScale(rect.width / 960);
    }

    return () => observer.disconnect();
  }, []);

  const theme = getSlideTheme(currentSlide);
  const height = 540 * scale;

  return (
    <div className="w-full bg-[#1C1C1E] border border-zinc-800 rounded-3xl p-3 shadow-2xl transition-all duration-300 hover:border-zinc-700">
      {/* Live Badge & Title bar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-red-500 font-mono tracking-wider uppercase">● EN VIVO</span>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono font-medium">PROYECTOR PRINCIPAL</span>
      </div>

      {/* Screen Frame */}
      <div 
        ref={containerRef} 
        className="w-full relative bg-[#09090B] rounded-2xl overflow-hidden border border-zinc-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"
        style={{ height: `${height}px` }}
      >
        {/* Scaled Projector Content */}
        <div 
          className={`absolute top-0 left-0 w-[960px] h-[540px] ${theme.background} origin-top-left flex flex-col select-none pointer-events-none transition-all duration-700 ease-in-out`}
          style={{ transform: `scale(${scale})` }}
        >
          {/* Top Bar: branding + status */}
          <div className="flex items-center justify-between px-8 pt-6 z-20">
            <img src={theme.logo} alt="Opita Code" className="h-8 object-contain" />
            <div className="flex items-center gap-2">
              <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-mono border shadow-sm ${theme.statusBg}`}>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-600 shadow-[0_0_4px_rgba(22,163,74,0.4)]' : 'bg-[#dc2626] animate-pulse'}`} />
                <span className="font-semibold">{isConnected ? 'LIVE' : 'CONECTANDO'}</span>
              </div>
            </div>
          </div>

          {/* Floating Chat Overlay */}
          <div className="absolute bottom-16 left-6 z-30 max-w-[240px] flex flex-col gap-1.5">
            {visibleMessages.map((msg) => (
              <div
                key={msg.id}
                className="bg-black/90 border border-white/10 text-white rounded-lg px-2.5 py-1.5 shadow-lg flex flex-col gap-0.5 text-[10px]"
              >
                <div className="flex items-center gap-1 font-bold text-zinc-300">
                  <span className={msg.username === "OpitaBot" ? 'text-orange-400' : ''}>
                    {msg.username}
                  </span>
                </div>
                <p className="text-zinc-200 text-[9px] leading-tight">
                  {msg.text}
                </p>
              </div>
            ))}
          </div>

          {/* Main Slide Content */}
          {isQRFullscreen ? (
            <div className="flex-1 bg-[#09090B] flex flex-col items-center justify-center p-4">
              <img src="/opita-code-horizontal-white-v4.png" alt="Opita Code" className="h-6 mb-4 opacity-50 object-contain" />
              <h2 className="text-2xl font-black text-white mb-4 text-center tracking-tight">
                Escanea para <span className="text-[#c2410c]">interactuar</span>
              </h2>
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <QRCode value={qrUrl} size={150} fgColor="#09090B" />
              </div>
              <p className="mt-4 text-[#71717A] font-mono text-xs tracking-wider">
                {qrUrl.replace('https://', '')}
              </p>
            </div>
          ) : isDemoMode ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 z-10 px-6">
              <span className="text-[10px] font-mono text-green-400 bg-green-950/40 px-2 py-0.5 rounded-full border border-green-500/30">
                ● CONEXIONES EN VIVO
              </span>
              <h2 className={`text-2xl font-black ${theme.text} tracking-tight text-center`}>¿Qué sabes hacer?</h2>
              
              {demoRoles.length === 0 ? (
                <div className="w-full max-w-sm p-4 bg-black/40 border border-green-500/20 rounded-xl text-green-500/60 text-xs font-mono text-center animate-pulse">
                  ⚡ Esperando respuestas...
                </div>
              ) : (
                <div className="w-full max-w-2xl flex flex-wrap justify-center gap-2 p-2 overflow-hidden max-h-[220px]">
                  {demoRoles.map((role, index) => {
                    const colors = [
                      "from-violet-500/20 to-purple-500/5 border-violet-500/20 text-violet-300",
                      "from-emerald-500/20 to-teal-500/5 border-emerald-500/20 text-emerald-300",
                      "from-orange-500/20 to-amber-500/5 border-orange-500/20 text-orange-300",
                      "from-blue-500/20 to-indigo-500/5 border-blue-500/20 text-blue-300",
                      "from-pink-500/20 to-rose-500/5 border-pink-500/20 text-rose-300"
                    ];
                    const styleClass = colors[index % colors.length];
                    return (
                      <div
                        key={index}
                        className={`px-2.5 py-1 rounded-lg border bg-gradient-to-r ${styleClass} text-[10px] font-bold`}
                      >
                        {role}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center z-10">
              <div className="w-full max-w-4xl flex items-center justify-center">
                <SlideContent slide={currentSlide} />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-8 pb-4 z-20 mt-auto">
            <span className={`${theme.footerText} font-mono text-[9px]`}>
              En vivo desde Neiva, Huila 🇨🇴
            </span>
            <span className={`${theme.text} font-mono text-xs font-bold`}>
              {currentSlide} <span className="opacity-40">/ 8</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Interact() {
  const {
    currentSlide,
    isConnected,
    isChatConnected,
    chatMessages,
    initializePartySocket,
    initializeChatSocket,
    sendChatMessage,
    submitDemoRole,
  } = useAppStore();

  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem("opita_username") || "";
  });
  const [nameInput, setNameInput] = useState("");
  const [msgText, setMsgText] = useState("");
  const [demoInput, setDemoInput] = useState("");
  const [hasSubmittedRole, setHasSubmittedRole] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Conectar sockets al montar
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const room = searchParams.get("room") || "presentation";
    initializePartySocket(PARTYKIT_HOST, room);
    initializeChatSocket(PARTYKIT_HOST, room);
  }, [initializePartySocket, initializeChatSocket]);

  // Scroll automático del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const [prevSlide, setPrevSlide] = useState(currentSlide);
  if (currentSlide !== prevSlide) {
    setPrevSlide(currentSlide);
    if (currentSlide !== 7) {
      setHasSubmittedRole(false);
      setDemoInput("");
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim();
    if (!cleanName) return;
    localStorage.setItem("opita_username", cleanName);
    setUsername(cleanName);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMsg = msgText.trim();
    if (!cleanMsg) return;
    sendChatMessage(username, cleanMsg);
    setMsgText("");
  };

  const handleSendDemo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRole = demoInput.trim();
    if (!cleanRole) return;
    submitDemoRole(cleanRole);
    setHasSubmittedRole(true);
  };

  // ─── PANTALLA DE REGISTRO / LOGIN ──────────────────────────────────────────
  if (!username) {
    return (
      <div className="min-h-screen bg-[#EFEFEB] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#D9D9D3] p-8 shadow-xl flex flex-col items-center">
          <img src="/opita-code-horizontal-black-v4.png" alt="Opita Code" className="h-10 mb-8 opacity-80 object-contain" />
          <h2 className="text-2xl font-black text-[#09090B] tracking-tight mb-2 text-center">
            Únete al Live
          </h2>
          <p className="text-[#71717A] text-sm mb-6 text-center">
            Ingresa tu alias para participar en el chat en tiempo real y canjear los beneficios.
          </p>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#71717A]">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                maxLength={15}
                required
                placeholder="Tu apodo o iniciales"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-[#09090B] placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/50 focus:border-[#ea580c] transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-[#ea580c] hover:bg-[#c2410c] active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-md shadow-orange-500/20"
            >
              Conectarse
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── PANTALLA PRINCIPAL DE INTERACCIÓN ──────────────────────────────────────
  return (
    <div className="h-screen bg-[#EFEFEB] flex flex-col overflow-hidden max-w-md mx-auto relative border-x border-[#D9D9D3]">
      {/* Header */}
      <header className="bg-white border-b border-[#D9D9D3] px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-2">
          <img src="/opita-code-horizontal-black-v4.png" alt="Opita Code" className="h-6 object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-1.5 bg-[#FAFAFA] px-3 py-1 rounded-full text-[10px] font-mono border border-[#E4E4E7]">
            <span className={`w-2 h-2 rounded-full ${isConnected && isChatConnected ? 'bg-green-600 animate-pulse' : 'bg-[#dc2626]'}`} />
            <span className="text-[#09090B] font-bold">{isConnected && isChatConnected ? 'LIVE' : 'SYNCING'}</span>
          </div>
          <span className="text-[11px] font-bold text-[#71717A]">@{username}</span>
        </div>
      </header>

      {/* Tarjeta Contextual Dinámica (Zona 1) */}
      <div className="p-4 z-10">
        <div className="transition-all duration-500 transform scale-100">
          {currentSlide >= 1 && currentSlide <= 4 && (
            <MiniProjector />
          )}

          {currentSlide === 5 && (
            <div className="bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white p-5 rounded-2xl shadow-lg border border-indigo-500/20 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-15">
                <Sparkles className="w-24 h-24 text-white" />
              </div>
              <span className="inline-block text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md mb-2">BENEFICIO EXCLUSIVO</span>
              <h3 className="font-black text-xl tracking-tight">1 Mes Gratis de Vibe Studio Pro</h3>
              <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
                Desbloquea el poder del desarrollo con IA en español. Activa tu beneficio al registrarte o iniciar sesión en Opita Cuentas.
              </p>

              <div className="mt-4 bg-white/10 border border-white/20 px-3 py-2 rounded-xl flex items-center justify-between">
                <span className="text-[11px] text-indigo-200 font-medium">Cupón del Live</span>
                <code className="text-xs font-mono font-bold tracking-wider bg-white/10 px-2 py-0.5 rounded">OPITAVIBE45</code>
              </div>

              <a
                href="https://cuentas.opitacode.com/promocion?code=OPITAVIBE45&app=vibe"
                target="_blank"
                rel="noreferrer"
                className="w-full mt-4 py-2.5 bg-white hover:bg-indigo-50 text-indigo-700 active:scale-[0.98] font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Activar en Opita Cuentas</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {currentSlide === 6 && (
            <div className="bg-gradient-to-br from-[#059669] to-[#047857] text-white p-5 rounded-2xl shadow-lg border border-emerald-500/20 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-15">
                <Sparkles className="w-24 h-24 text-white" />
              </div>
              <span className="inline-block text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md mb-2">OPITA TRABAJOS</span>
              <h3 className="font-black text-xl tracking-tight">1 Mes Gratis de Trabajos Pro</h3>
              <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                Impulsa tu carrera tech y conecta con mejores empresas. Activa tu beneficio al registrarte o iniciar sesión en Opita Cuentas.
              </p>

              <div className="mt-4 bg-white/10 border border-white/20 px-3 py-2 rounded-xl flex items-center justify-between">
                <span className="text-[11px] text-emerald-200 font-medium">Cupón del Live</span>
                <code className="text-xs font-mono font-bold tracking-wider bg-white/10 px-2 py-0.5 rounded">OPITATRABAJOS45</code>
              </div>

              <a
                href="https://cuentas.opitacode.com/promocion?code=OPITATRABAJOS45&app=trabajos"
                target="_blank"
                rel="noreferrer"
                className="w-full mt-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-700 active:scale-[0.98] font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Activar en Opita Cuentas</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {currentSlide === 7 && (
            <div className="bg-[#09090B] border border-[#27272A] p-5 rounded-2xl shadow-lg text-white">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase">MODO DEMO ACTIVO</span>
              </div>
              <h3 className="font-black text-lg tracking-tight">¿Cuál es tu rol ideal en tecnología?</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Ingresa tu perfil y aparecerá en vivo en la pantalla del proyector.
              </p>

              {hasSubmittedRole ? (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-center text-xs font-semibold">
                  🚀 ¡Enviado con éxito! Revisa la pantalla principal.
                </div>
              ) : (
                <form onSubmit={handleSendDemo} className="mt-4 space-y-3">
                  <input
                    type="text"
                    maxLength={30}
                    required
                    placeholder="Ej: DevOps Lead, Fullstack, Frontend Jr"
                    value={demoInput}
                    onChange={(e) => setDemoInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#18181B] border border-[#27272A] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-green-600 hover:bg-green-500 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md shadow-green-900/20 transition-all"
                  >
                    Enviar a la Demo
                  </button>
                </form>
              )}
            </div>
          )}

          {currentSlide === 8 && (
            <div className="bg-white border border-[#D9D9D3] p-5 rounded-2xl shadow-sm text-center">
              <h3 className="font-black text-lg text-[#09090B] tracking-tight">¡Muchas Gracias!</h3>
              <p className="text-xs text-[#71717A] mt-2 leading-relaxed">
                Las APIs no piden visa. Es momento de competir globalmente desde Neiva y todo el Magdalena.
              </p>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <a
                  href="https://opitacode.com"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#FAFAFA] border border-[#E4E4E7] hover:bg-gray-50 p-2.5 rounded-xl text-[10px] font-bold text-[#ea580c] transition-all"
                >
                  Opita Code
                </a>
                <a
                  href="https://vibe.opitacode.com"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#FAFAFA] border border-[#E4E4E7] hover:bg-gray-50 p-2.5 rounded-xl text-[10px] font-bold text-indigo-600 transition-all"
                >
                  Vibe Studio
                </a>
                <a
                  href="https://trabajos.opitacode.com"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#FAFAFA] border border-[#E4E4E7] hover:bg-gray-50 p-2.5 rounded-xl text-[10px] font-bold text-emerald-600 transition-all"
                >
                  Trabajos
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feed de Chat (Zona 2) */}
      <div className="flex-1 min-h-0 bg-white border-t border-[#D9D9D3] flex flex-col">
        {/* Chat Header */}
        <div className="px-5 py-2 border-b border-[#F4F4F5] bg-gray-50/50 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#71717A]" />
          <span className="text-xs font-bold text-[#71717A] uppercase tracking-wide">Preguntas y Reacciones</span>
        </div>

        {/* Scrollable messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-4">
              <MessageSquare className="w-8 h-8 opacity-45 mb-2" />
              <p className="text-xs">¡Sé el primero en enviar un mensaje en el Live!</p>
            </div>
          ) : (
            chatMessages.map((msg) => {
              const isMe = msg.username === username;
              const isBot = msg.username === "OpitaBot";
              
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <span className={`text-[10px] font-semibold mb-0.5 ${isBot ? 'text-[#c2410c]' : 'text-gray-400'}`}>
                    {msg.username}
                  </span>
                  <div
                    className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#ea580c] text-white rounded-tr-none'
                        : isBot
                        ? 'bg-orange-50 border border-orange-200 text-[#09090B] rounded-tl-none font-medium'
                        : 'bg-[#FAFAFA] border border-[#E4E4E7] text-[#09090B] rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendChat} className="p-3 border-t border-[#F4F4F5] bg-white flex gap-2">
          <input
            type="text"
            maxLength={100}
            required
            placeholder="Haz una pregunta o reacciona..."
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#09090B] placeholder-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#ea580c] focus:border-[#ea580c]"
          />
          <button
            type="submit"
            className="p-2.5 bg-[#ea580c] hover:bg-[#c2410c] active:scale-95 text-white rounded-xl shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
