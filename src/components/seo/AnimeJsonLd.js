export default function AnimeJsonLd({ data }) {
  if (!data) return null;

  const title = data.title?.english || data.title?.romaji || data.title?.native;
  const description = data.description?.replace(/<[^>]*>/g, '').slice(0, 200);
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: title,
    description: description,
    image: data.coverImage?.extraLarge || data.coverImage?.large,
    genre: data.genres || [],
    datePublished: data.startDate ? `${data.startDate.year}-${String(data.startDate.month).padStart(2, '0')}-${String(data.startDate.day).padStart(2, '0')}` : undefined,
    numberOfEpisodes: data.episodes,
    aggregateRating: data.averageScore ? {
      '@type': 'AggregateRating',
      ratingValue: data.averageScore / 10,
      bestRating: 10,
      ratingCount: data.popularity
    } : undefined,
    contentRating: data.isAdult ? 'R' : 'PG-13',
    inLanguage: 'ja',
    countryOfOrigin: {
      '@type': 'Country',
      name: 'Japan'
    },
    ...(data.studios?.nodes?.[0] && {
      productionCompany: {
        '@type': 'Organization',
        name: data.studios.nodes[0].name
      }
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
