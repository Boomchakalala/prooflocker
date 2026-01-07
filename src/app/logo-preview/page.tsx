import Image from "next/image";
import ProofLockerLogo from "@/components/Logo";
import FullLogo from "@/components/FullLogo";

export default function LogoPreviewPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <h1 className="text-3xl font-bold text-white mb-8">ProofLocker Logo Preview</h1>

        {/* React Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">React Components</h2>

          <div className="glass rounded-lg p-8 border border-white/10">
            <h3 className="text-sm text-neutral-400 mb-4 uppercase tracking-wider">Full Logo Component</h3>
            <FullLogo />
          </div>

          <div className="glass rounded-lg p-8 border border-white/10">
            <h3 className="text-sm text-neutral-400 mb-4 uppercase tracking-wider">Icon Component (Various Sizes)</h3>
            <div className="flex items-center gap-8">
              <ProofLockerLogo className="w-6 h-6" />
              <ProofLockerLogo className="w-8 h-8" />
              <ProofLockerLogo className="w-10 h-10" />
              <ProofLockerLogo className="w-16 h-16" />
            </div>
          </div>
        </section>

        {/* PNG Exports */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">PNG Exports</h2>

          <div className="glass rounded-lg p-8 border border-white/10">
            <h3 className="text-sm text-neutral-400 mb-4 uppercase tracking-wider">Horizontal Logo PNG (1000x200)</h3>
            <Image
              src="/logo-horizontal.png"
              alt="ProofLocker Horizontal Logo"
              width={1000}
              height={200}
              className="max-w-full h-auto"
            />
          </div>

          <div className="glass rounded-lg p-8 border border-white/10">
            <h3 className="text-sm text-neutral-400 mb-4 uppercase tracking-wider">Icon PNG (512x512)</h3>
            <Image
              src="/logo-icon.png"
              alt="ProofLocker Icon"
              width={128}
              height={128}
            />
          </div>

          <div className="glass rounded-lg p-8 border border-white/10">
            <h3 className="text-sm text-neutral-400 mb-4 uppercase tracking-wider">Favicon (32x32)</h3>
            <Image
              src="/icon.png"
              alt="ProofLocker Favicon"
              width={32}
              height={32}
              className="image-rendering-pixelated"
            />
          </div>
        </section>

        {/* SVG Files */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">SVG Files</h2>

          <div className="glass rounded-lg p-8 border border-white/10">
            <h3 className="text-sm text-neutral-400 mb-4 uppercase tracking-wider">Horizontal Logo SVG</h3>
            <Image
              src="/logo-horizontal.svg"
              alt="ProofLocker Horizontal Logo SVG"
              width={400}
              height={80}
              className="max-w-full h-auto"
            />
          </div>

          <div className="glass rounded-lg p-8 border border-white/10">
            <h3 className="text-sm text-neutral-400 mb-4 uppercase tracking-wider">Icon SVG</h3>
            <Image
              src="/logo-icon.svg"
              alt="ProofLocker Icon SVG"
              width={100}
              height={100}
            />
          </div>
        </section>

        {/* Download Links */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Download Assets</h2>
          <div className="glass rounded-lg p-6 border border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <a href="/logo-horizontal.png" download className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-center transition-all">
                Download Horizontal PNG
              </a>
              <a href="/logo-icon.png" download className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-center transition-all">
                Download Icon PNG
              </a>
              <a href="/logo-horizontal.svg" download className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-center transition-all">
                Download Horizontal SVG
              </a>
              <a href="/logo-icon.svg" download className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-center transition-all">
                Download Icon SVG
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
