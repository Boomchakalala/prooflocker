export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#0a0a0a] via-[#1A0033]/40 to-[#0F001A] py-10 px-8 border-t border-[#A78BFA]/20">
      {/* Premium holographic glow at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00E0FF]/50 to-transparent" />

      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] rounded-full blur-3xl bg-gradient-to-r from-[#A78BFA]/30 to-[#00E0FF]/30" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Main content grid */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          {/* Left: Brand tagline with gradient */}
          <div className="text-center md:text-left">
            <p className="text-base md:text-lg font-bold mb-1 bg-gradient-to-r from-[#00E0FF] to-[#C084FC] bg-clip-text text-transparent">
              ProofLocker
            </p>
            <p className="text-xs md:text-sm text-white/60 flex items-center justify-center md:justify-start gap-2">
              <svg className="w-3.5 h-3.5 text-[#00E0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
              <span>Powered by <span className="text-[#A78BFA] font-semibold">Constellation DAG</span></span>
            </p>
          </div>

          {/* Center: Links with cyber hover */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm">
            <a href="/legal/privacy" className="text-white/60 hover:text-[#00E0FF] transition-all hover:drop-shadow-[0_0_6px_rgba(0,224,255,0.6)]">
              Privacy
            </a>
            <a href="/legal/terms" className="text-white/60 hover:text-[#00E0FF] transition-all hover:drop-shadow-[0_0_6px_rgba(0,224,255,0.6)]">
              Terms
            </a>
            <a href="/legal/disclaimer" className="text-white/60 hover:text-[#00E0FF] transition-all hover:drop-shadow-[0_0_6px_rgba(0,224,255,0.6)]">
              Disclaimer
            </a>
          </div>

          {/* Right: Social icons with neon hover glow */}
          <div className="flex items-center gap-5">
            <a
              href="https://twitter.com/prooflocker"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-[#00E0FF] transition-all hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(0,224,255,0.8)]"
              aria-label="X (Twitter)"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://discord.gg/prooflocker"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-[#A78BFA] transition-all hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(167,139,250,0.8)]"
              aria-label="Discord"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
              </svg>
            </a>
            <a
              href="https://t.me/prooflocker"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-[#00E0FF] transition-all hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(0,224,255,0.8)]"
              aria-label="Telegram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L8.08 13.768l-2.91-.908c-.632-.196-.644-.632.133-.936l11.372-4.382c.528-.196.99.123.82.877z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Copyright bar with subtle gradient border */}
        <div className="pt-6 border-t border-[#A78BFA]/10 text-center">
          <p className="text-xs text-white/40">
            © 2026 ProofLocker — Immutable accountability for the future
          </p>
        </div>
      </div>
    </footer>
  );
}
