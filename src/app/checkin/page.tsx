'use client'

import { useUser } from '@/contexts/UserContext';
import useIsClient from "@/hooks/useIsClient";
import { AnimatePresence, motion } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera } from 'lucide-react';
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

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!devices || devices.length === 0) {
          console.warn("Nenhuma câmera disponível ou permissão negada.");
          setMessage("⚠️ Não conseguimos acessar sua câmera. Verifique as permissões do navegador.");
          setLoading(false);
          setScanning(false);
          return;
        }

        html5QrCode
          .start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: 250 },
            async () => {
              await html5QrCode.stop();
              await html5QrCode.clear();
              setLoading(false);
              setScanning(false);
              try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkin`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                });

                let data = {};
                try {
                  data = await res.json();
                } catch (jsonError) {
                  console.warn('Falha ao interpretar JSON de resposta:', jsonError);
                }

                const successMessage = typeof data === 'object' && 'message' in data && typeof data.message === 'string'
                  ? data.message
                  : '✅ Check-in realizado com sucesso! /br Hora de servir com alegria!';

                setMessage(successMessage);
              } catch (error) {
                console.error('Erro ao registrar check-in:', error);
                setMessage('Erro ao registrar check-in.');
              }
            },
            (errorMessage) => {
              console.warn('QR Error', errorMessage);
            }
          )
          .then(() => {
            setLoading(false);
          })
          .catch((err) => {
            console.error('Erro ao iniciar scanner:', err);
            setScanning(false);
            setLoading(false);
          });
      })
      .catch((err) => {
        console.error('Erro ao acessar câmeras:', err);
        setMessage("⚠️ Não conseguimos acessar sua câmera. Verifique as permissões do navegador.");
        setLoading(false);
        setScanning(false);
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
              className="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700 transition flex items-center"
            >
              <Camera className="mr-2" size={24} />  {/* Ícone de câmera */}
              Escanear QR Code
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

          {loading && scanning && (
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="text-gray-500 text-sm"
            >
              Pelejando...
            </motion.p>
          )}
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