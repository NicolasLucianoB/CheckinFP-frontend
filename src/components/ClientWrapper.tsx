"use client";

import useIsClient from "@/hooks/useIsClient";
import { ReactNode } from "react";

interface ClientWrapperProps {
  children: ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const isClient = useIsClient();

  if (!isClient)
    return (
      <div className="min-h-screen bg-gray-100" aria-hidden="true" />
    );

  return <>{children}</>;
}