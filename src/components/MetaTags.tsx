import Head from 'next/head';

export default function MetaTags() {
  return (
    <Head>
      <title>Checkin-FP</title>
      <meta name="description" content="Sistema de check-in para voluntários do ministério de Mídia da Família Plena" />

      {/* Open Graph */}
      <meta property="og:title" content="Checkin-FP" />
      <meta property="og:description" content="Sistema de check-in para voluntários do ministério de Mídia da Família Plena" />
      <meta property="og:url" content="https://checkin-fp-frontend.vercel.app" />
      <meta property="og:site_name" content="Checkin-FP" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://res.cloudinary.com/dwvrcpasa/image/upload/v1751125763/open-graph-image_oilt0h.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Capa do Checkin-FP" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Checkin-FP" />
      <meta name="twitter:description" content="Sistema de check-in para voluntários do ministério de Mídia da Família Plena" />
      <meta name="twitter:image" content="https://res.cloudinary.com/dwvrcpasa/image/upload/v1751125763/open-graph-image_oilt0h.png" />
    </Head>
  );
}