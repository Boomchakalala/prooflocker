export default function Footer() {
  return (
    <footer className="border-t border-gray-800/50 bg-[#000000] relative z-10">
      <div className="max-w-[1280px] mx-auto px-6 py-10 md:py-12">
        <div className="text-center space-y-3">
          <p className="text-sm md:text-base text-white/60 font-medium">
            Built on Constellation DAG
          </p>
          <p className="text-xs md:text-sm text-white/40">
            Every lock is immutable. Every proof is permanent.
          </p>
          <p className="text-xs text-gray-500 mt-4">
            © 2026 ProofLocker
          </p>
        </div>
      </div>
    </footer>
  );
}
