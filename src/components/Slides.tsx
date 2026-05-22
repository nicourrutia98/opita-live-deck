export const SLIDES_COUNT = 8;

// ── Brand Tokens (opitacode.com light theme) ─────────────────────────────────
// bg:       #FAFAFA (off-white)
// surface:  #FFFFFF
// text:     #09090B (zinc-950)
// muted:    #71717A (zinc-500)
// accent:   #c2410c (Opita Orange)
// border:   #E4E4E7 (zinc-200)

export const SlideContent = ({ slide }: { slide: number }) => {
  switch (slide) {
    // ─── SLIDE 1: Cover ──────────────────────────────────────────────────────
    case 1:
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8 md:px-16 space-y-6">
          <img src="/opita-horizontal-dark.svg" alt="Opita Code" className="h-8 md:h-10 opacity-60 mb-2" />
          <h1 className="text-5xl md:text-8xl font-black text-[#09090B] tracking-tight leading-[0.95]">
            El Futuro tiene<br />
            <span className="text-[#c2410c]">Acento Opita</span>
          </h1>
          <p className="text-lg md:text-2xl text-[#71717A] max-w-2xl font-medium leading-relaxed">
            Cómo la IA está nivelando la cancha<br className="hidden md:block" /> para los que saben construir.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <span className="text-sm font-mono text-[#71717A] bg-[#F4F4F5] px-4 py-2 rounded-full border border-[#E4E4E7]">
              Juan Nicolás Urrutia · Opita Code
            </span>
          </div>
        </div>
      );

    // ─── SLIDE 2: El Problema ────────────────────────────────────────────────
    case 2:
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8 md:px-16 space-y-8">
          <span className="text-sm font-mono text-[#71717A] bg-[#F4F4F5] px-3 py-1.5 rounded-lg border border-[#E4E4E7]">01 / EL PROBLEMA</span>
          <h2 className="text-4xl md:text-7xl font-black text-[#09090B] tracking-tight leading-[0.95]">
            Escribir código<br />
            <span className="text-[#c2410c]">≠ Ingeniería</span>
          </h2>
          <p className="text-lg md:text-2xl text-[#71717A] max-w-3xl font-medium leading-relaxed">
            El hype de la IA está creando desarrolladores que copian<br className="hidden md:block" />
            sin entender. Eso no es construir software.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {['Event Loop', 'Dependency Injection', 'Garbage Collection', 'Estado', 'Escalabilidad'].map((tag) => (
              <span key={tag} className="text-xs font-mono font-semibold text-[#09090B] bg-[#F4F4F5] px-3 py-1.5 rounded-lg border border-[#E4E4E7]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      );

    // ─── SLIDE 3: Silicon Valley vs. El Magdalena ────────────────────────────
    case 3:
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8 md:px-16 space-y-8">
          <span className="text-sm font-mono text-[#71717A] bg-[#F4F4F5] px-3 py-1.5 rounded-lg border border-[#E4E4E7]">02 / CONTEXTO</span>
          <h2 className="text-4xl md:text-7xl font-black text-[#09090B] tracking-tight leading-[0.95]">
            Silicon Valley vs.<br />
            <span className="text-[#c2410c]">El Magdalena</span>
          </h2>
          <p className="text-lg md:text-2xl text-[#71717A] max-w-3xl font-medium leading-relaxed">
            La diferencia competitiva ya no es el acceso a los fierros.<br className="hidden md:block" />
            Es saber qué pedirle a la máquina.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {['AWS CDK', 'Terraform', 'SST', 'API Gateway', 'DynamoDB', 'SQS', 'IaC'].map((tag) => (
              <span key={tag} className="text-xs font-mono font-semibold text-[#09090B] bg-[#F4F4F5] px-3 py-1.5 rounded-lg border border-[#E4E4E7]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      );

    // ─── SLIDE 4: Tu Pasante Estrella ────────────────────────────────────────
    case 4:
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8 md:px-16 space-y-8">
          <span className="text-sm font-mono text-[#71717A] bg-[#F4F4F5] px-3 py-1.5 rounded-lg border border-[#E4E4E7]">03 / IA + INGENIERÍA</span>
          <h2 className="text-4xl md:text-7xl font-black text-[#09090B] tracking-tight leading-[0.95]">
            Tu <span className="text-[#c2410c]">Pasante</span> Estrella
          </h2>
          <p className="text-lg md:text-2xl text-[#71717A] max-w-3xl font-medium leading-relaxed">
            Se leyó toda la documentación. Trabaja a 1000 tokens/seg.<br className="hidden md:block" />
            Pero alucina y no conoce tu negocio.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4 max-w-lg w-full">
            <div className="bg-[#F4F4F5] border border-[#E4E4E7] rounded-2xl p-4 text-left">
              <span className="text-2xl">📋</span>
              <p className="text-sm font-bold text-[#09090B] mt-2">Contexto</p>
              <p className="text-xs text-[#71717A] mt-1">Esquema de BD + arquitectura + reglas de negocio en el System Prompt.</p>
            </div>
            <div className="bg-[#F4F4F5] border border-[#E4E4E7] rounded-2xl p-4 text-left">
              <span className="text-2xl">🧪</span>
              <p className="text-sm font-bold text-[#09090B] mt-2">TDD + IA</p>
              <p className="text-xs text-[#71717A] mt-1">Escribes la prueba, la IA escribe el código que la pase.</p>
            </div>
          </div>
        </div>
      );

    // ─── SLIDE 5: Vibe Studio ────────────────────────────────────────────────
    case 5:
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8 md:px-16 space-y-8">
          <span className="text-sm font-mono text-violet-300 bg-violet-950/40 px-3 py-1.5 rounded-lg border border-violet-800/40">
            04 / PRODUCTO FLAGSHIP
          </span>
          <h2 className="text-5xl md:text-8xl font-black text-white tracking-tight">
            Vibe <span className="text-violet-400">Studio</span>
          </h2>
          <p className="text-lg md:text-2xl text-violet-200/80 max-w-3xl font-medium leading-relaxed">
            El código fluye en español. Inteligencia Artificial gobernada por la arquitectura.<br className="hidden md:block" />
            El humano dirige, la IA ejecuta con tests y despliegue continuo.
          </p>
          <div className="bg-zinc-950/80 border border-violet-500/30 rounded-2xl p-4 max-w-2xl w-full text-left shadow-2xl backdrop-blur font-mono text-xs md:text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-zinc-500 ml-2">vibe-studio // prompt.vibe</span>
              </div>
              <span className="text-violet-400 text-xs">● Conectado a PartyKit</span>
            </div>
            <div className="space-y-1 text-zinc-300">
              <p className="text-zinc-500">// Describe tu app en español e implementa con TDD</p>
              <p><span className="text-violet-400">const</span> app = <span className="text-blue-400">vibe</span>.<span className="text-yellow-400">createApp</span>(<span className="text-emerald-400">"Suscripción VIP para Vibe Studio"</span>);</p>
              <p>app.<span className="text-yellow-400">onTrigger</span>(<span className="text-emerald-400">"slide_change"</span>, (slide) =&gt; &#123;</p>
              <p className="pl-4"><span className="text-blue-400">bot</span>.<span className="text-yellow-400">say</span>(<span className="text-emerald-400">`¡Liberado cupón: OPITAVIBE45 para Slide $&#123;slide&#125;!`</span>);</p>
              <p>&#125;);</p>
            </div>
          </div>
        </div>
      );

    // ─── SLIDE 6: Opita Code - Ecosistema ────────────────────────────────────
    case 6:
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8 md:px-16 space-y-8">
          <span className="text-sm font-mono text-emerald-300 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/40">
            05 / ECOSISTEMA GLOBAL
          </span>
          <h2 className="text-5xl md:text-8xl font-black text-white tracking-tight">
            Opita <span className="text-emerald-400">Code</span>
          </h2>
          <p className="text-lg md:text-2xl text-emerald-200/80 max-w-3xl font-medium leading-relaxed">
            Software de nivel mundial construido desde Neiva.<br className="hidden md:block" />
            Soluciones integradas con bases de datos en tiempo real y flujos automatizados por IA.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 max-w-4xl w-full">
            <div className="bg-zinc-900/60 border border-violet-500/20 hover:border-violet-500/50 rounded-2xl p-6 text-left shadow-lg backdrop-blur transition-all hover:scale-[1.02] duration-300">
              <div className="w-10 h-10 rounded-xl bg-violet-950/50 border border-violet-500/30 flex items-center justify-center text-xl mb-4">🔮</div>
              <p className="text-lg font-bold text-white">Vibe Studio</p>
              <p className="text-sm text-zinc-400 mt-2">Vibe-coding interactivo. Traduce ideas a código de producción en español.</p>
              <span className="inline-block mt-4 text-xs font-mono font-bold text-violet-400">CUPÓN: OPITAVIBE45</span>
            </div>
            <div className="bg-zinc-900/60 border border-emerald-500/20 hover:border-emerald-500/50 rounded-2xl p-6 text-left shadow-lg backdrop-blur transition-all hover:scale-[1.02] duration-300">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-xl mb-4">💼</div>
              <p className="text-lg font-bold text-white">Opita Trabajos</p>
              <p className="text-sm text-zinc-400 mt-2">Bolsa de empleo tecnológica que empareja vacantes globales usando IA.</p>
              <span className="inline-block mt-4 text-xs font-mono font-bold text-emerald-400">CUPÓN: OPITATRABAJOS45</span>
            </div>
            <div className="bg-zinc-900/60 border border-amber-500/20 hover:border-amber-500/50 rounded-2xl p-6 text-left shadow-lg backdrop-blur transition-all hover:scale-[1.02] duration-300">
              <div className="w-10 h-10 rounded-xl bg-amber-950/50 border border-amber-500/30 flex items-center justify-center text-xl mb-4">💈</div>
              <p className="text-lg font-bold text-white">Opita Barber</p>
              <p className="text-sm text-zinc-400 mt-2">Plataforma SaaS para agendamiento inteligente de citas y fidelización.</p>
              <span className="inline-block mt-4 text-xs font-mono text-zinc-500">PRÓXIMAMENTE</span>
            </div>
          </div>
        </div>
      );

    // ─── SLIDE 7: Demo en Vivo ───────────────────────────────────────────────
    case 7:
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8 md:px-16 space-y-8">
          <span className="text-sm font-mono text-green-400 bg-green-950/40 px-3 py-1.5 rounded-lg border border-green-500/30 animate-pulse">
            ● DEMO EN VIVO: CONEXIONES REAL-TIME
          </span>
          <h2 className="text-5xl md:text-8xl font-black text-white tracking-tight leading-[0.95]">
            Del Código al<br />
            <span className="text-green-500 font-mono">&lt;Mercado Global/&gt;</span>
          </h2>
          <p className="text-lg md:text-2xl text-zinc-400 max-w-3xl font-medium leading-relaxed">
            React, Serverless WebSockets en el Edge con PartyKit.<br className="hidden md:block" />
            Escribe tu rol en el móvil y la IA lo categorizará en vivo en la pantalla del proyector.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4 text-green-400 font-mono text-sm bg-black/60 px-6 py-3 rounded-xl border border-green-500/20 max-w-md w-full shadow-[0_0_20px_rgba(34,197,94,0.05)]">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
            <span>Escanea el QR e ingresa tu rol en la app móvil</span>
          </div>
        </div>
      );

    // ─── SLIDE 8: Cierre ─────────────────────────────────────────────────────
    case 8:
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8 md:px-16 space-y-8">
          <img src="/opita-horizontal-light.svg" alt="Opita Code" className="h-12 md:h-16 opacity-90 mb-2" />
          <h2 className="text-4xl md:text-7xl font-black text-white tracking-tight leading-[0.95]">
            Las APIs<br />
            <span className="text-[#c2410c] drop-shadow-[0_0_25px_rgba(194,65,12,0.3)]">no piden visa.</span>
          </h2>
          <p className="text-lg md:text-2xl text-zinc-300 max-w-3xl font-medium leading-relaxed">
            La barrera competitiva hoy es pura: criterio y arquitectura.<br className="hidden md:block" />
            Lo demás está a una petición HTTP. ¡El futuro tecnológico se construye desde Neiva!
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <a href="https://opitacode.com" target="_blank" rel="noreferrer" className="text-sm font-mono text-orange-400 bg-orange-950/30 px-6 py-3 rounded-xl border border-orange-500/30 shadow-md hover:bg-orange-950/50 transition-colors">
              opitacode.com
            </a>
            <a href="https://vibe.opitacode.com" target="_blank" rel="noreferrer" className="text-sm font-mono text-orange-400 bg-orange-950/30 px-6 py-3 rounded-xl border border-orange-500/30 shadow-md hover:bg-orange-950/50 transition-colors">
              vibe.opitacode.com
            </a>
            <a href="https://trabajos.opitacode.com" target="_blank" rel="noreferrer" className="text-sm font-mono text-orange-400 bg-orange-950/30 px-6 py-3 rounded-xl border border-orange-500/30 shadow-md hover:bg-orange-950/50 transition-colors">
              trabajos.opitacode.com
            </a>
          </div>
        </div>
      );

    default:
      return null;
  }
};
