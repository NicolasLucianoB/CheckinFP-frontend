'use client'

import LoadingMessage from '@/components/LoadingMessage';
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart2, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function WelcomeInfo() {
  return (
    <section className="w-full max-w-xl bg-white/90 rounded-xl p-6 shadow-lg text-center text-black">
      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-col items-center">
          <QrCode className="w-10 h-10 text-[#FE2674] mb-2" />
          <h3 className="font-semibold mb-1">Check-in Ágil</h3>
          <p>Registre sua presença com facilidade escaneando o QR Code.</p>
        </div>
        <div className="flex flex-col items-center">
          <BarChart2 className="w-10 h-10 text-[#3EA7E0] mb-2" />
          <h3 className="font-semibold mb-1">Análises e Gráficos</h3>
          <p>Acompanhe pontualidade, assiduidade e rankings em tempo real.</p>
        </div>
        <div className="flex flex-col items-center">
          <CheckCircleIcon className="w-10 h-10 text-[#28B242] mb-2" />
          <h3 className="font-semibold mb-1">Perfil Personalizado</h3>
          <p>Gerencie seus dados pessoais e acompanhe seu desempenho.</p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const router = useRouter();
  const [loading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/home");
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] text-black">
      <AnimatePresence>
        <main className="flex flex-col items-center justify-center flex-grow px-6 gap-10 mb-25">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto mt-10 flex flex-col items-center gap-6"
          >
            <h1 className="text-4xl font-extrabold drop-shadow-lg text-center mb-7">
              Bem-vindo ao <span className="text-black">Checkin-FP</span>
            </h1>
            {loading && (
              <div className="text-center">
                <LoadingMessage />
              </div>
            )}
            <WelcomeInfo />
          </motion.div>
        </main>
      </AnimatePresence>
    </div>
  );
}
