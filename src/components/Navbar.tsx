'use client';

import { useUser } from "@/contexts/UserContext";
import { Church } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const { user, logout } = useUser();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.refresh();
    router.push("/login");
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-gray-200 border-b">
      <button
        onClick={() => router.push('/home')}
        className="flex items-center gap-2 text-gray-700 hover:text-black"
      >
        <Church className="h-6 w-6" />
        <span className="font-medium hidden sm:inline">Home</span>
      </button>
      <div className="relative" ref={menuRef}>
        <div
          className="rounded-full p-[2px] cursor-pointer"
          style={{
            background: 'conic-gradient(from 225deg, #28B242 0%, #80C447 5%, #FEA341 25%, #FEA341 38%, #FEA341 40%, #FE2674 50%, #FE2674 62%, #3EA7E0 70%, #3EA7E0 90%, #28B242 100%)'
          }}
          onClick={() => setOpen(!open)}
        >
          <div className="rounded-full bg-gray-100 overflow-hidden w-10 h-10">
            <Image
              alt=""
              src={user?.avatarUrl || "/assets/logo.png"}
              width={40}
              height={40}
              className="object-cover w-full h-full"
              key={user?.avatarUrl || "default-avatar"}
            />
          </div>
        </div>
        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-50">
            <button
              onClick={() => router.push("/profile")}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-black"
            >
              Ver perfil
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
            >
              Fazer logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}