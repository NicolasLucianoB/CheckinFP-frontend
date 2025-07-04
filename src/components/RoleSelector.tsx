import { LightBulbIcon } from '@heroicons/react/24/solid';
import {
  Camera,
  GraduationCap,
  Instagram,
  Projector,
  Video,
  Youtube,
} from 'lucide-react';
import { useEffect, useRef, useState } from "react";

const ICONS: Record<string, React.ElementType> = {
  Video,
  Youtube,
  Projector,
  Camera,
  Instagram,
  GraduationCap,
};

interface RoleSelectorProps {
  selectedRoles: string[];
  onChange: (roles: string[]) => void;
  hasError?: boolean;
  isAdmin?: boolean;
}

const ROLES = [
  { name: "Câmera", icon: "Video", color: "#60BDF2" },
  { name: "Transmissão", icon: "Youtube", color: "#FF0000" },
  { name: "Projeção", icon: "Projector", color: "#9F7AEA" },
  { name: "Fotografia", icon: "Camera", color: "#3CA37B" },
  { name: "Redes Sociais", icon: "Instagram", color: "#FE2674" },
  { name: "Iluminação", icon: "heroic-lightbulb", color: "#FECF41" },
  { name: "Em treinamento", icon: "GraduationCap", color: "#FEA341" },
];

export default function RoleSelector({ selectedRoles, onChange, hasError, isAdmin = false }: RoleSelectorProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      onChange(selectedRoles.filter(r => r !== role));
    } else {
      onChange([...selectedRoles, role]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full px-3 py-2 rounded text-left flex justify-between items-center ${hasError ? 'border border-red-600' : 'border border-zinc-400'}`}
      >
        <span className={selectedRoles.length === 0 ? "text-gray-400" : "text-black"}>
          {selectedRoles.length > 0
            ? selectedRoles.join(', ')
            : isAdmin
              ? "Admin"
              : "Funções"}
        </span>
        <span className="text-blue-500">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-full border rounded bg-white shadow-md max-h-60 overflow-y-auto">
          {ROLES.map(({ name, icon, color }) => {
            const Icon = ICONS[icon];
            const selected = selectedRoles.includes(name);

            return (
              <label
                key={name}
                className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleRole(name)}
                  className="accent-black"
                />
                {name === "Iluminação" ? (
                  <LightBulbIcon className="w-5 h-5 text-yellow-300" />
                ) : (
                  <Icon size={20} color={color} />
                )}
                <span className="text-sm text-black">{name}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
