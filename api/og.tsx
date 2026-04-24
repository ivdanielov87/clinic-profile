import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

const CACHE_SECONDS = 60 * 60 * 24;
const STALE_SECONDS = 60 * 60 * 24 * 7;

async function loadFont(path: string): Promise<ArrayBuffer> {
  const response = await fetch(new URL(path, import.meta.url));
  return response.arrayBuffer();
}

export default async function handler(request: Request): Promise<Response> {
  try {
    const origin = new URL(request.url).origin;
    const photoUrl = `${origin}/Mladenova.jpg`;

    const [regular, bold] = await Promise.all([
      loadFont('./fonts/NotoSans-Regular.ttf'),
      loadFont('./fonts/NotoSans-Bold.ttf'),
    ]);

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            backgroundImage:
              'linear-gradient(135deg, #0F1F36 0%, #1B2E4B 55%, #24496E 100%)',
            color: '#F1F5F9',
            padding: '64px 72px',
            fontFamily: 'Noto Sans',
            position: 'relative',
          }}
        >
          {/* Decorative accent ring */}
          <div
            style={{
              position: 'absolute',
              top: -220,
              right: -220,
              width: 520,
              height: 520,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at center, rgba(245,158,11,0.22) 0%, rgba(245,158,11,0) 70%)',
              display: 'flex',
            }}
          />

          {/* Left: doctor photo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 56,
            }}
          >
            <div
              style={{
                width: 360,
                height: 360,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '6px solid rgba(245,158,11,0.55)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
                overflow: 'hidden',
                background: '#0F1F36',
              }}
            >
              <img
                src={photoUrl}
                width={360}
                height={360}
                style={{
                  width: 360,
                  height: 360,
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>

          {/* Right: text */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                letterSpacing: 6,
                textTransform: 'uppercase',
                color: '#F59E0B',
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              Очен кабинет · Русе
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.05,
                marginBottom: 14,
              }}
            >
              Д-р Магдалена
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.05,
                marginBottom: 28,
              }}
            >
              Младенова
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: 26,
                color: '#94A3B8',
                marginBottom: 36,
              }}
            >
              Офталмолог · Специалист очни болести
            </div>

            {/* Rating badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 22px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(245,158,11,0.4)',
                alignSelf: 'flex-start',
              }}
            >
              <div style={{ display: 'flex', gap: 4, fontSize: 30, color: '#F59E0B' }}>
                ★★★★★
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#F1F5F9',
                }}
              >
                4.9
              </div>
              <div style={{ display: 'flex', fontSize: 22, color: '#CBD5F5' }}>
                · над 800 отзива в SuperDoc
              </div>
            </div>

            {/* Domain footer */}
            <div
              style={{
                display: 'flex',
                marginTop: 44,
                fontSize: 22,
                color: '#94A3B8',
                letterSpacing: 1,
              }}
            >
              mladenova-oftalmolog.bg
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: 'Noto Sans', data: regular, style: 'normal', weight: 400 },
          { name: 'Noto Sans', data: bold, style: 'normal', weight: 700 },
        ],
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}`,
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(`OG generation failed: ${message}`, { status: 500 });
  }
}
