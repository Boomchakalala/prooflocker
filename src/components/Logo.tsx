import Image from "next/image";

export default function ProofLockerLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className="relative group">
      <Image
        src="/logo.png"
        alt="ProofLocker"
        width={40}
        height={40}
        className={`${className} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
        priority
      />
    </div>
  );
}
