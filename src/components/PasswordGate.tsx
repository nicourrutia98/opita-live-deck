import { useState, type ReactNode } from 'react';

const SESSION_KEY = 'opita_admin_auth';
const PIN = '8822';

export function PasswordGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true');
  const [value, setValue] = useState('');
  const [shake, setShake] = useState(false);

  const submit = () => {
    if (value === PIN) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setUnlocked(true);
    } else {
      setValue('');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-8">
      <div
        className={`flex flex-col items-center gap-6 transition-all ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}
        style={shake ? { animation: 'shake 0.4s ease' } : {}}
      >
        <img src="/opita-horizontal-dark.svg" alt="Opita Code" className="h-8 invert opacity-90" />

        <form
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          className="flex flex-col items-center gap-4 w-full max-w-xs"
        >
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={`w-full text-center text-3xl tracking-[1rem] font-mono bg-[#1a1a1a] text-white border-2 rounded-2xl px-6 py-5 outline-none transition-colors focus:border-[#c2410c] ${shake ? 'border-red-500' : 'border-[#2A2A2A]'}`}
            maxLength={8}
          />
          <button
            type="submit"
            className="w-full py-4 bg-[#c2410c] hover:bg-[#ea580c] active:bg-[#9a3412] text-white font-bold text-lg rounded-2xl transition-colors"
          >
            →
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-12px); }
          40% { transform: translateX(12px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
