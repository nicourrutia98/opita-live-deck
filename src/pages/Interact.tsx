import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MessageSquare, Send, User, ExternalLink, Copy, Check, Compass, Sparkles } from 'lucide-react';

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST || "127.0.0.1:1999";

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
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

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

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  // ─── PANTALLA DE REGISTRO / LOGIN ──────────────────────────────────────────
  if (!username) {
    return (
      <div className="min-h-screen bg-[#EFEFEB] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#D9D9D3] p-8 shadow-xl flex flex-col items-center">
          <img src="/opita-horizontal-dark.svg" alt="Opita Code" className="h-10 mb-8 opacity-80" />
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
          <img src="/opita-horizontal-dark.svg" alt="Opita Code" className="h-6" />
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
            <div className="bg-white border border-[#D9D9D3] p-5 rounded-2xl shadow-sm text-center">
              <span className="inline-block p-3 bg-orange-50 rounded-xl mb-3 border border-orange-100 text-[#ea580c]">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </span>
              <h3 className="font-black text-lg text-[#09090B] tracking-tight">¡Bienvenido a la Conferencia!</h3>
              <p className="text-xs text-[#71717A] mt-2 leading-relaxed">
                Estamos en vivo en Neiva. Quédate conectado para ver demostraciones e interactuar con la pantalla principal.
              </p>
              <a
                href="https://opitacode.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 mt-4 px-4 py-2 text-xs font-bold text-[#ea580c] bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-xl transition-all"
              >
                <span>opitacode.com</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {currentSlide === 5 && (
            <div className="bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white p-5 rounded-2xl shadow-lg border border-indigo-500/20 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-15">
                <Sparkles className="w-24 h-24 text-white" />
              </div>
              <span className="inline-block text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md mb-2">BENEFICIO EXCLUSIVO</span>
              <h3 className="font-black text-xl tracking-tight">1 Mes Gratis de Vibe Studio Pro</h3>
              <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
                Desbloquea el poder del desarrollo con IA gobernada en español.
              </p>

              <div className="mt-4 flex items-center justify-between bg-white/10 border border-white/20 p-2.5 rounded-xl">
                <code className="text-sm font-mono font-bold tracking-wider">OPITAVIBE45</code>
                <button
                  onClick={() => copyToClipboard("OPITAVIBE45")}
                  className="p-2 hover:bg-white/10 active:scale-95 rounded-lg transition-all"
                >
                  {copiedCoupon === "OPITAVIBE45" ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <a
                href="https://vibe.opitacode.com?promo=OPITAVIBE45"
                target="_blank"
                rel="noreferrer"
                className="w-full mt-4 py-2.5 bg-white hover:bg-indigo-50 text-indigo-700 active:scale-[0.98] font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Ir a Vibe Studio</span>
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
                Impulsa tu carrera tech y conecta con mejores empresas internacionales.
              </p>

              <div className="mt-4 flex items-center justify-between bg-white/10 border border-white/20 p-2.5 rounded-xl">
                <code className="text-sm font-mono font-bold tracking-wider">OPITATRABAJOS45</code>
                <button
                  onClick={() => copyToClipboard("OPITATRABAJOS45")}
                  className="p-2 hover:bg-white/10 active:scale-95 rounded-lg transition-all"
                >
                  {copiedCoupon === "OPITATRABAJOS45" ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <a
                href="https://trabajos.opitacode.com?promo=OPITATRABAJOS45"
                target="_blank"
                rel="noreferrer"
                className="w-full mt-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-700 active:scale-[0.98] font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Ir a Opita Trabajos</span>
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
