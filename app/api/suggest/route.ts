import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length < 2) {
        return NextResponse.json({ suggestions: [] });
    }

    const source3Url = process.env.SEARCH_SOURCE3_URL;
    if (!source3Url) {
        return NextResponse.json({ suggestions: [] });
    }

    try {
        // SearXNG autocomplete endpoint
        const endpoint = `${source3Url}/autocompleter?q=${encodeURIComponent(q.trim())}`;

        const response = await fetch(endpoint, {
            headers: {
                'User-Agent': 'BandhanNova-Smartpedia/1.0',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            return NextResponse.json({ suggestions: [] });
        }

        const data = await response.json();

        // SearXNG autocomplete can return nested string arrays
        const suggestions = Array.isArray(data)
            ? data.flatMap((item: any) => Array.isArray(item) ? item : [item]).filter(item => typeof item === 'string' && item.trim()).slice(0, 8)
            : [];

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error('Autocomplete error:', error);
        return NextResponse.json({ suggestions: [] });
    }
}
