export default function MangaJsonLd({ data }) {
  if (!data) return null;

  const title = data.title?.english || data.title?.romaji || data.title?.native;
  const description = data.description?.replace(/<[^>]*>/g, '').slice(0, 200);
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': `https://voidanime.live/manga/info/${data.id}`,
    name: title,
    description: description,
    image: data.coverImage?.extraLarge || data.coverImage?.large,
    genre: data.genres || [],
    datePublished: data.startDate ? `${data.startDate.year}-${String(data.startDate.month).padStart(2, '0')}-${String(data.startDate.day).padStart(2, '0')}` : undefined,
    numberOfPages: data.chapters,
    bookFormat: 'GraphicNovel',
    inLanguage: 'ja',
    aggregateRating: data.averageScore ? {
      '@type': 'AggregateRating',
      ratingValue: data.averageScore / 10,
      bestRating: 10,
      ratingCount: data.popularity
    } : undefined,
    ...(data.staff?.edges?.[0] && {
      author: {
        '@type': 'Person',
        name: data.staff.edges[0].node.name.full
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
