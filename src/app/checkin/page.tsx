'use client'


import { useUser } from '@/contexts/UserContext';
import useIsClient from "@/hooks/useIsClient";
import { AnimatePresence, motion } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';

export default function CheckinPage() {
  const isClient = useIsClient();
  const { user } = useUser();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scanning || !scannerRef.current) return;

    const qrRegionId = 'qr-reader';
    const html5QrCode = new Html5Qrcode(qrRegionId);
    setLoading(true);

    html5QrCode
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          setScanning(false);
          await html5QrCode.stop();
          await html5QrCode.clear();
          setLoading(false);
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkin/${decodedText}`);
            const data = await res.json();
            setMessage(data.message || 'Check-in realizado com sucesso! /br Hora de servir com alegria!');
          } catch (error) {
            setMessage('Erro ao registrar check-in.');
          }
        },
        (errorMessage) => {
          console.warn('QR Error', errorMessage);
        }
      )
      .catch((err) => {
        console.error('Erro ao iniciar scanner:', err);
        setScanning(false);
        setLoading(false);
      });

    return () => {
      html5QrCode
        .stop()
        .then(() => html5QrCode.clear())
        .catch(console.error);
    };
  }, [scanning]);

  if (!isClient) return null;

  const firstName = user?.name?.split(' ')[0];

  return (
    <AnimatePresence>
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center w-full space-y-6"
        >


          <h1 className="text-3xl font-bold text-black">
            {firstName}, registre seu check-in!
          </h1>

          <p className="text-lg text-gray-600 text-center">
            Clique no ícone de câmera e escaneie o QR Code.
          </p>

          {!scanning ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setScanning(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700 transition"
            >
              📷 Escanear QR Code
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full text-black text-center max-w-sm"
            >
              <div ref={scannerRef} id="qr-reader" className="w-full" />
              <button
                onClick={() => setScanning(false)}
                className="mt-4 text-base text-red-500 underline"
              >
                Bater em retirada ❌
              </button>
            </motion.div>
          )}

          {loading && <p className="text-gray-500 text-sm">Carregando...</p>}
          {message && (
            <motion.p
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-blue-600 font-medium text-center"
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      </main>
    </AnimatePresence>
  );
}