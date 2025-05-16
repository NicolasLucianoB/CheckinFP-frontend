import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full py-6 flex flex-col items-center justify-center text-center text-sm text-white-600">
      <Image
        src="/assets/logo.png"
        alt="Logo Igreja"
        width={50}
        height={50}
        className="mb-2"
      />
      <p className="text-base">
        Made with <span className="mx-1">✝️</span> by Nícolas
      </p>
    </footer>
  );
}