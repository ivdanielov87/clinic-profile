export const config = {
  runtime: 'edge',
};

interface EarliestSlot {
  date: string;
  time: string;
  text: string;
}

interface SuperDocData {
  earliestSlot: EarliestSlot | null;
  rating: number | null;
  ratingCount: number | null;
  scrapedAt: string;
}

const SOURCE_URL = 'https://superdoc.bg/lekar/magdalena-mladenova';
const CACHE_SECONDS = 15 * 60;
const STALE_SECONDS = 60 * 60;

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

function extractRating(html: string): number | null {
  // SuperDoc renders the aggregate rating as <h3>4.9</h3> in the reviews block.
  // Also try JSON-LD / data-rating fallbacks.
  const ldMatch = html.match(/"ratingValue"\s*:\s*"?(\d+(?:[.,]\d+)?)"?/);
  if (ldMatch) {
    const value = parseFloat(ldMatch[1].replace(',', '.'));
    if (!Number.isNaN(value) && value >= 0 && value <= 5) return value;
  }

  const h3Match = html.match(/<h3[^>]*>\s*(\d(?:[.,]\d)?)\s*<\/h3>/);
  if (h3Match) {
    const value = parseFloat(h3Match[1].replace(',', '.'));
    if (!Number.isNaN(value) && value >= 0 && value <= 5) return value;
  }

  return null;
}

function extractRatingCount(html: string): number | null {
  const ldMatch = html.match(/"reviewCount"\s*:\s*"?(\d+)"?/);
  if (ldMatch) {
    const value = parseInt(ldMatch[1], 10);
    if (!Number.isNaN(value)) return value;
  }

  const textMatch = html.match(/(\d{1,6})\s*оценки/);
  if (textMatch) {
    const value = parseInt(textMatch[1], 10);
    if (!Number.isNaN(value)) return value;
  }

  return null;
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

  return {
    earliestSlot: extractEarliestSlot(html),
    rating: extractRating(html),
    ratingCount: extractRatingCount(html),
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
