'use client';

import Image from 'next/image';

interface AvatarProps {
  imageUrl?: string;
  size?: number;
}

export default function AvatarWithSpiral({ imageUrl = "/assets/logo.png", size = 40 }: AvatarProps) {
  const borderSize = 2;
  const totalSize = size + borderSize * 2;

  console.log("Avatar.tsx → imageUrl recebida:", imageUrl);

  return (
    <div
      className="rounded-full p-[2px]"
      style={{
        background: 'conic-gradient(from 225deg, #28B242 0%, #80C447 5%, #FEA341 25%, #FEA341 38%, #FEA341 40%, #FE2674 50%, #FE2674 62%, #3EA7E0 70%, #3EA7E0 90%, #28B242 100%)',
        width: totalSize,
        height: totalSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="rounded-full bg-gray-100 overflow-hidden"
        style={{ width: size, height: size }}
      >
        <Image
          alt="avatar"
          src={imageUrl && imageUrl.trim() !== '' ? imageUrl : "/assets/logo.png"}
          width={size}
          height={size}
          className="object-cover rounded-full"
        />
      </div>
    </div>
  );
}