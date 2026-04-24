export const config = {
  runtime: 'edge',
};

interface EarliestSlot {
  date: string;
  time: string;
  text: string;
}

interface Review {
  author: string;
  date: string;
  rating: number;
  text: string;
}

interface SuperDocData {
  earliestSlot: EarliestSlot | null;
  rating: number | null;
  ratingCount: number | null;
  reviews: Review[];
  scrapedAt: string;
}

const SOURCE_URL = 'https://superdoc.bg/lekar/magdalena-mladenova';
const CACHE_SECONDS = 15 * 60;
const STALE_SECONDS = 60 * 60;
const MAX_REVIEWS = 6;

function extractEarliestSlot(html: string): EarliestSlot | null {
  const match = html.match(/"earliestSlot"\s*:\s*(\{[^}]+\})/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1]);
    if (typeof parsed.date === 'string' && typeof parsed.time === 'string') {
      return {
        date: parsed.date,
        time: parsed.time,
        text: typeof parsed.text === 'string' ? parsed.text : `${parsed.date} ${parsed.time}`,
      };
    }
  } catch {}
  return null;
}

// Extracts the aggregate rating from the microdata block:
// <div itemprop="aggregateRating" ...>
//   <meta itemprop="ratingValue" content="4.94">
//   <meta itemprop="ratingCount" content="824">
// </div>
function extractAggregate(html: string): { rating: number | null; ratingCount: number | null } {
  const blockMatch = html.match(/itemprop="aggregateRating"[\s\S]{0,600}?<\/div>/);
  if (!blockMatch) return { rating: null, ratingCount: null };
  const block = blockMatch[0];

  const ratingMatch = block.match(/itemprop="ratingValue"\s+content="([^"]+)"/);
  const countMatch = block.match(/itemprop="ratingCount"\s+content="(\d+)"/);

  const ratingRaw = ratingMatch ? parseFloat(ratingMatch[1].replace(',', '.')) : NaN;
  const countRaw = countMatch ? parseInt(countMatch[1], 10) : NaN;

  return {
    rating: !Number.isNaN(ratingRaw) && ratingRaw >= 0 && ratingRaw <= 5 ? ratingRaw : null,
    ratingCount: !Number.isNaN(countRaw) && countRaw >= 0 ? countRaw : null,
  };
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripTags(s: string): string {
  return decodeHtml(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

// Each review on SuperDoc is rendered as:
// <div class="review" itemprop="reviews" itemscope itemtype="http://schema.org/Review">
//   <span itemprop="name">AUTHOR</span>
//   <span itemprop="datePublished">DATE</span>
//   <div itemprop="reviewRating">
//     <meta itemprop="ratingValue" content="5">
//   </div>
//   <div class="content">REVIEW TEXT</div>
// </div>
function extractReviews(html: string, limit: number): Review[] {
  const reviewRegex = /<div\s+class="review"\s+itemprop="reviews"[\s\S]*?<div class="content">([\s\S]*?)<\/div>/g;
  const reviews: Review[] = [];
  let match: RegExpExecArray | null;

  while ((match = reviewRegex.exec(html)) !== null && reviews.length < limit) {
    const block = match[0];
    const text = stripTags(match[1]);
    if (!text) continue;

    const authorMatch = block.match(/<span itemprop="name">([^<]+)<\/span>/);
    const dateMatch = block.match(/itemprop="datePublished"[^>]*>([^<]+)</);
    const ratingMatch = block.match(/itemprop="reviewRating"[\s\S]*?itemprop="ratingValue"\s+content="(\d+(?:\.\d+)?)"/);

    if (!authorMatch) continue;

    reviews.push({
      author: stripTags(authorMatch[1]),
      date: dateMatch ? stripTags(dateMatch[1]) : '',
      rating: ratingMatch ? parseFloat(ratingMatch[1]) : 5,
      text,
    });
  }

  return reviews;
}

async function fetchSuperDoc(): Promise<SuperDocData> {
  const response = await fetch(SOURCE_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; EyeClinicBot/1.0; +https://mladenova-oftalmolog.bg)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'bg-BG,bg;q=0.9,en;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`SuperDoc fetch failed: ${response.status}`);
  }

  const html = await response.text();
  const { rating, ratingCount } = extractAggregate(html);

  return {
    earliestSlot: extractEarliestSlot(html),
    rating,
    ratingCount,
    reviews: extractReviews(html, MAX_REVIEWS),
    scrapedAt: new Date().toISOString(),
  };
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const data = await fetchSuperDoc();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}`,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'scrape_failed', message }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, s-maxage=60',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
}
