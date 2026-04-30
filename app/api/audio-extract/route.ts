import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const scraperUrl = process.env.NEWS_SCRAPER_URL || 'http://localhost:7860';

    try {
        const response = await fetch(`${scraperUrl}/music/extract?url=${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json({ error: errorData.detail || 'Extraction failed' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Audio extraction proxy error:', error);
        return NextResponse.json({ error: 'Failed to connect to audio extraction service' }, { status: 500 });
    }
}
