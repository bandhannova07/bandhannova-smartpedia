import { NextRequest, NextResponse } from 'next/server';
import { getSmartpediaResults } from '@/lib/searchLogic';
import { generateAIAnswer } from '@/lib/ai';
import type { AnswerMode } from '@/components/AnswerModeSelector';
import type { Perspective } from '@/components/PerspectiveSwitch';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: 'https://star-dog-98160.upstash.io',
  token: 'gQAAAAAAAX9wAAIgcDJmNjZjOTNlOGMzNTE0YjI5OTJmOWI1ZTMzMWQ0MDc3OQ',
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query, mode = 'detailed', perspective = 'fact', category = 'general', page = 1 } = body as {
            query: string;
            mode?: AnswerMode;
            perspective?: Perspective;
            category?: string;
            page?: number;
        };

        if (!query || query.trim().length === 0) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        const cacheKey = `smartpedia:search:${encodeURIComponent(query.trim().toLowerCase())}:${mode}:${perspective}:${category}:${page}`;
        const cachedResponse = await redis.get(cacheKey);

        if (cachedResponse) {
            return NextResponse.json(cachedResponse);
        }

        // 1. Fetch search results (with source metadata, suggestions, infoboxes)
        const searchResponse = await getSmartpediaResults(query.trim(), category, page);
        const results = searchResponse.results;

        // 2. Separate results by source
        const source1Results = results.filter(r => r.source === 'source1');
        const source2Results = results.filter(r => r.source === 'source2');
        const source3Results = results.filter(r => r.source === 'source3');

        // 3. Build context from top results (all sources for AI)
        const context = results
            .slice(0, 5)
            .map((r) => `Source: ${r.title}\nURL: ${r.url}\nContent: ${r.snippet}`)
            .join('\n\n---\n\n');

        // 4. Generate AI answer with the selected mode and perspective
        let aiResponse = { answer: '', followUpQuestions: [] as string[] };
        if (results.length > 0) {
            aiResponse = await generateAIAnswer(query.trim(), context, mode, perspective);
        }

        // 5. Return structured response with separated sources
        const finalPayload = {
            query: query.trim(),
            mode,
            perspective,
            knowledgeResults: source1Results.map((r) => ({
                id: r.$id || null,
                title: r.title,
                url: r.url,
                snippet: r.snippet,
            })),
            webResults: source2Results.map((r) => ({
                id: r.$id || null,
                title: r.title,
                url: r.url,
                snippet: r.snippet,
            })),
            metaResults: source3Results.map((r) => ({
                id: r.$id || null,
                title: r.title,
                url: r.url,
                snippet: r.snippet,
                img_src: r.img_src,
                thumbnail_src: r.thumbnail_src,
                publishedDate: r.publishedDate,
            })),
            aiAnswer: aiResponse.answer,
            followUpQuestions: aiResponse.followUpQuestions,
            suggestions: searchResponse.suggestions,
            infoboxes: searchResponse.infoboxes,
            sources: results.slice(0, 5).map((r) => ({
                title: r.title,
                url: r.url,
            })),
            timestamp: new Date().toISOString(),
        };

        // Cache in Upstash Redis (set expiration to 24 hours: 86400 seconds)
        await redis.set(cacheKey, finalPayload, { ex: 86400 });

        return NextResponse.json(finalPayload);
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'An error occurred while processing your search' },
            { status: 500 }
        );
    }
}
