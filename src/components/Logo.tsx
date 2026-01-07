import Image from "next/image";

export default function ProofLockerLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="ProofLocker"
      width={32}
      height={32}
      className={className}
      priority
    />
  );
}
