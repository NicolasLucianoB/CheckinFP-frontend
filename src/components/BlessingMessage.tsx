'use client';

import { BookOpenCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

type Blessing = {
  verse: string;
  reference: string;
};

const blessings: Blessing[] = [
  {
    verse: 'Servi uns aos outros, cada um conforme o dom que recebeu.',
    reference: '1 Pedro 4:10',
  },
  {
    verse: 'E tudo quanto fizerdes, fazei-o de coração, como ao Senhor e não aos homens.',
    reference: 'Colossenses 3:23',
  },
  {
    verse: 'Porque Deus não é injusto para se esquecer da vossa obra e do amor que para com o seu nome mostrastes.',
    reference: 'Hebreus 6:10',
  },
  {
    verse: 'Melhor é servir do que ser servido.',
    reference: 'Mateus 20:28 (adaptado)',
  },
  {
    verse: 'Alegrei-me quando me disseram: Vamos à casa do Senhor.',
    reference: 'Salmos 122:1',
  },
  {
    verse: 'Quem quiser tornar-se grande entre vocês deverá ser servo.',
    reference: 'Mateus 20:26',
  },
  {
    verse: 'Portanto, meus amados irmãos, sejam firmes e constantes, sempre abundantes na obra do Senhor.',
    reference: '1 Coríntios 15:58',
  },
  {
    verse: 'O maior entre vocês deverá ser servo.',
    reference: 'Mateus 23:11',
  },
  {
    verse: 'Sirvam uns aos outros mediante o amor.',
    reference: 'Gálatas 5:13',
  },
];

export default function BlessingMessage() {
  const [blessing, setBlessing] = useState<Blessing | null>(null);

  useEffect(() => {
    const random = Math.floor(Math.random() * blessings.length);
    setBlessing(blessings[random]);
  }, []);

  if (!blessing) return null;

  return (
    <div className="bg-white shadow-md rounded-lg p-8 text-center max-w-xl mx-auto border-l-4 border-amber-500">
      <BookOpenCheck className="mx-auto mb-6 h-8 w-8 text-amber-500" />
      <p className="italic text-gray-800 text-lg">&ldquo;{blessing.verse}&rdquo;</p>
      <p className="text-sm text-gray-600 mt-6">— {blessing.reference}</p>
    </div>
  );
}
