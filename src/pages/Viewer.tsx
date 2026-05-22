import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SlideContent } from '../components/Slides';
import { QRCode } from 'react-qr-code';

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST || "127.0.0.1:1999";

interface ChatMessage {
  id: string;
  username: string;
  text: string;
  createdAt: number;
}

interface SlideTheme {
  background: string;
  text: string;
  logo: string;
  qrBg: string;
  qrFg: string;
  statusBg: string;
  footerText: string;
  border: string;
}

const getSlideTheme = (slide: number): SlideTheme => {
  if (slide <= 4) {
    return {
      background: "bg-[#FAFAFA] text-[#09090B]",
      text: "text-[#09090B]",
      logo: "/opita-horizontal-dark.svg",
      qrBg: "bg-white border-[#E4E4E7]",
      qrFg: "#09090B",
      statusBg: "bg-white border-[#E4E4E7] text-[#09090B]",
      footerText: "text-[#71717A]",
      border: "border-[#E4E4E7]"
    };
  }
  if (slide === 5) {
    return {
      background: "bg-gradient-to-br from-[#1e1b4b] via-[#311042] to-[#0f051d] text-white",
      text: "text-zinc-100",
      logo: "/opita-horizontal-light.svg",
      qrBg: "bg-zinc-900 border-zinc-800",
      qrFg: "#FAFAFA",
      statusBg: "bg-zinc-900 border-zinc-800 text-zinc-300",
      footerText: "text-zinc-500",
      border: "border-zinc-800"
    };
  }
  if (slide === 6) {
    return {
      background: "bg-gradient-to-br from-[#064e3b] via-[#022c22] to-[#041a16] text-white",
      text: "text-emerald-50",
      logo: "/opita-horizontal-light.svg",
      qrBg: "bg-zinc-900 border-zinc-800",
      qrFg: "#FAFAFA",
      statusBg: "bg-zinc-900 border-zinc-800 text-emerald-300",
      footerText: "text-emerald-600/80",
      border: "border-emerald-800/30"
    };
  }
  if (slide === 7) {
    return {
      background: "bg-[#020205] text-green-400",
      text: "text-green-400",
      logo: "/opita-horizontal-light.svg",
      qrBg: "bg-black border-green-500/30",
      qrFg: "#22c55e",
      statusBg: "bg-black border-green-500/30 text-green-400",
      footerText: "text-green-600",
      border: "border-green-500/20"
    };
  }
  // slide === 8
  return {
    background: "bg-gradient-to-br from-[#09090B] via-[#1c0d02] to-[#09090B] text-white",
    text: "text-orange-50",
    logo: "/opita-horizontal-light.svg",
    qrBg: "bg-zinc-900 border-zinc-800",
    qrFg: "#ea580c",
    statusBg: "bg-zinc-900 border-zinc-800 text-orange-400",
    footerText: "text-orange-950",
    border: "border-orange-900/30"
  };
};

export default function Viewer() {
  const currentSlide = useAppStore((state) => state.currentSlide);
  const isDemoMode = useAppStore((state) => state.isDemoMode);
  const isQRFullscreen = useAppStore((state) => state.isQRFullscreen);
  const qrUrl = useAppStore((state) => state.qrUrl);
  const isConnected = useAppStore((state) => state.isConnected);
  const chatMessages = useAppStore((state) => state.chatMessages);
  const demoRoles = useAppStore((state) => state.demoRoles);
  
  const initializePartySocket = useAppStore((state) => state.initializePartySocket);
  const initializeChatSocket = useAppStore((state) => state.initializeChatSocket);

  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const room = searchParams.get("room") || "presentation";
    initializePartySocket(PARTYKIT_HOST, room);
    initializeChatSocket(PARTYKIT_HOST, room);
  }, [initializePartySocket, initializeChatSocket]);

  // Manejar el desvanecimiento de mensajes tras 6 segundos
  useEffect(() => {
    const updateVisible = () => {
      const now = Date.now();
      const active = chatMessages.filter(msg => now - msg.createdAt < 6000);
      setVisibleMessages(active.slice(-4));
    };

    updateVisible();
    const interval = setInterval(updateVisible, 1000);
    return () => clearInterval(interval);
  }, [chatMessages]);

  const theme = getSlideTheme(currentSlide);

  return (
    <div className={`min-h-screen ${theme.background} transition-all duration-700 ease-in-out flex flex-col`}>
      <div className="flex-1 relative overflow-hidden flex flex-col">
        
        {/* Top Bar: branding + status */}
        <div className="flex items-center justify-between px-8 md:px-12 pt-6 z-20">
          <img src={theme.logo} alt="Opita Code" className="h-8 md:h-10 opacity-80 transition-all duration-300" />
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl shadow-sm border ${theme.qrBg} hover:scale-105 transition-all duration-300`}>
              <QRCode value={qrUrl} size={72} fgColor={theme.qrFg} bgColor="transparent" />
            </div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-mono border shadow-sm ${theme.statusBg} transition-all duration-300`}>
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-600 shadow-[0_0_8px_rgba(22,163,74,0.4)]' : 'bg-[#dc2626] animate-pulse'}`} />
              <span className="font-semibold">{isConnected ? 'LIVE' : 'CONECTANDO'}</span>
            </div>
          </div>
        </div>

        {/* Floating Chat Overlay (Twitch-style) */}
        <div className="absolute bottom-20 left-8 z-30 max-w-sm pointer-events-none flex flex-col gap-2 transition-all duration-300">
          {visibleMessages.map((msg) => (
            <div
              key={msg.id}
              className="bg-black/80 backdrop-blur-md border border-white/10 text-white rounded-xl px-4 py-2.5 shadow-2xl flex flex-col gap-1 transition-all duration-300 animate-slide-in text-sm"
            >
              <div className="flex items-center gap-1.5">
                <span className={`font-bold font-mono ${msg.username === "OpitaBot" ? 'text-orange-400' : 'text-zinc-300'}`}>
                  {msg.username}
                </span>
                <span className="text-white/40 text-[10px] font-mono">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-zinc-200 leading-tight">
                {msg.text}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        {isQRFullscreen ? (
          <div className="fixed inset-0 z-[200] bg-[#09090B] flex flex-col items-center justify-center p-8">
            <img src="/opita-horizontal-light.svg" alt="Opita Code" className="h-8 mb-8 opacity-60" />
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 text-center tracking-tight">
              Escanea para <span className="text-[#c2410c]">interactuar</span>
            </h2>
            <div className="bg-white p-8 rounded-3xl shadow-[0_0_60px_rgba(194,65,12,0.15)]">
              <QRCode value={qrUrl} size={360} className="w-full h-auto max-w-[360px] md:max-w-[500px]" fgColor="#09090B" />
            </div>
            <p className="mt-8 text-[#71717A] font-mono text-lg md:text-xl tracking-widest">
              {qrUrl.replace('https://', '')}
            </p>
          </div>
        ) : isDemoMode ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 z-10 px-8">
            <span className="text-xs font-mono text-green-400 bg-green-950/40 px-3 py-1 rounded-full border border-green-500/30 animate-pulse">
              ● CONEXIONES EN VIVO
            </span>
            <h2 className={`text-4xl md:text-6xl font-black ${theme.text} tracking-tight text-center`}>¿Qué sabes hacer?</h2>
            <p className="text-zinc-400 text-lg md:text-xl text-center max-w-2xl leading-relaxed">
              Escanea el QR e ingresa tu rol. Los resultados se actualizarán al instante en esta pantalla.
            </p>
            
            {demoRoles.length === 0 ? (
              <div className="w-full max-w-xl px-8 py-8 bg-black/40 border border-green-500/20 rounded-2xl text-green-500/60 text-lg font-mono text-center shadow-lg animate-pulse">
                ⚡ Esperando respuestas de la audiencia...
              </div>
            ) : (
              <div className="w-full max-w-4xl flex flex-wrap justify-center gap-3 p-4 overflow-y-auto max-h-[50vh] scrollbar-thin">
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
                      className={`px-4 py-2 rounded-xl border bg-gradient-to-r ${styleClass} text-sm md:text-base font-bold shadow-md hover:scale-105 hover:border-white/30 transition-all duration-300 animate-slide-in`}
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
            <div className="w-full max-w-6xl">
              <SlideContent slide={currentSlide} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-8 md:px-12 pb-6 z-20">
          <span className={`${theme.footerText} font-mono text-xs md:text-sm transition-all duration-300`}>
            En vivo desde Neiva, Huila 🇨🇴
          </span>
          <span className={`${theme.text} font-mono text-base md:text-lg font-bold transition-all duration-300`}>
            {currentSlide} <span className="opacity-40">/ 8</span>
          </span>
        </div>
      </div>
    </div>
  );
}
