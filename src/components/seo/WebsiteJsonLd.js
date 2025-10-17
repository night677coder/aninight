export default function WebsiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VoidAnime',
    alternateName: 'Void Anime',
    url: 'https://voidanime.live',
    description: 'Watch anime online and read manga free. Stream the latest anime episodes with English subtitles and dubs. Discover trending anime, popular manga, and seasonal releases.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://voidanime.live/anime/catalog?search={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'VoidAnime',
      logo: {
        '@type': 'ImageObject',
        url: 'https://voidanime.live/android-chrome-512x512.png'
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
