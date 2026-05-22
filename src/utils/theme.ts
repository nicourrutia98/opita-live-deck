export interface SlideTheme {
  background: string;
  text: string;
  logo: string;
  qrBg: string;
  qrFg: string;
  statusBg: string;
  footerText: string;
  border: string;
}

export const getSlideTheme = (slide: number): SlideTheme => {
  if (slide <= 4) {
    return {
      background: "bg-[#FAFAFA] text-[#09090B]",
      text: "text-[#09090B]",
      logo: "/opita-code-horizontal-black-v4.png",
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
      logo: "/opita-code-horizontal-white-v4.png",
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
      logo: "/opita-code-horizontal-white-v4.png",
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
      logo: "/opita-code-horizontal-white-v4.png",
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
    logo: "/opita-code-horizontal-white-v4.png",
    qrBg: "bg-zinc-900 border-zinc-800",
    qrFg: "#ea580c",
    statusBg: "bg-zinc-900 border-zinc-800 text-orange-400",
    footerText: "text-orange-950",
    border: "border-orange-900/30"
  };
};
