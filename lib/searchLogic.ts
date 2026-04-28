import { api, SearchResult } from './appwrite';

// Extended result type with generic source tracking
export interface SmartpediaResult extends SearchResult {
    source: 'source1' | 'source2' | 'source3';
    img_src?: string;
    thumbnail_src?: string;
    publishedDate?: string;
}

export interface InfoboxData {
    infobox: string;
    content?: string;
    img_src?: string;
    urls?: { title: string; url: string }[];
}

export interface SmartpediaSearchResponse {
    results: SmartpediaResult[];
    suggestions: string[];
    infoboxes: InfoboxData[];
}
import * as cheerio from 'cheerio';

// --- Cluster Management Utility (Mirrored from ai.ts) ---
function getGatewayCluster(): string[] {
    const cluster = process.env.API_HUNTER_CLUSTER || "";
    // Robust parsing: split by comma, trim spaces and strip optional double/single quotes
    return cluster.split(',').map(s => s.trim().replace(/^["'](.+(?=["']$))["']$/, '$1')).filter(s => s !== "");
}

let clusterIndex = 0;
function getNextGateway(cluster: string[]): string {
    if (cluster.length === 0) return "";
    const url = cluster[clusterIndex];
    clusterIndex = (clusterIndex + 1) % cluster.length;
    return url;
}

/**
 * This function handles the core logic of Smartpedia:
 * 1. Check if we already have good results for this query in our Appwrite DB.
 * 2. If not (or if we want fresh data), we search external sources:
 *    - Source 1: Knowledge base (configured via env)
 *    - Source 2: Web search API (configured via env)
 *    - Source 3: Meta-search engine (configured via env)
 * 3. Save new findings to Appwrite for future users.
 * 4. Return the combined results.
 */
export async function getSmartpediaResults(query: string, category: string = 'general', page: number = 1): Promise<SmartpediaSearchResponse> {
    if (!query) return { results: [], suggestions: [], infoboxes: [] };

    // If category is not general, query ONLY Source 3 (SearXNG)
    if (category !== 'general') {
        return await searchSource3Full(query, category, page);
    }

    // 1. Check Local Knowledge Base (Appwrite)
    const dbResults = await api.searchKnowledgeBase(query);

    // Fetch Source 3 with full metadata (suggestions + infoboxes)
    const source3Response = await searchSource3Full(query, 'general', page);

    // If we have fewer than 5 results, fetch from web
    if (dbResults.length < 5) {
        console.log(`Not enough data for "${query}" in DB. Fetching from external sources...`);

        // Run remaining searches in parallel
        const [source1Results, source2Results] = await Promise.all([
            searchSource1(query),
            searchSource2(query),
        ]);

        // Combine results
        const freshResults: SmartpediaResult[] = [...source1Results, ...source2Results, ...source3Response.results];

        // High-Speed Scrape of Top Result (if available) for AI Context
        const topResult = freshResults.find(r => r.source === 'source2');
        if (topResult && topResult.url.startsWith('http')) {
            console.log(`Scraping full content from top result: ${topResult.title}`);
            const fullContent = await fetchFullContent(topResult.url);
            if (fullContent) {
                topResult.snippet = `[FULL CONTENT] ${fullContent.slice(0, 5000)} \n\n ${topResult.snippet}`;
            }
        }

        // Save new results to DB asynchronously
        freshResults.forEach(async (result) => {
            await api.saveResult(result);
        });

        // Dedup results based on URL
        const combined: SmartpediaResult[] = [
            ...dbResults.map(r => ({ ...r, source: 'source2' as const })),
            ...freshResults
        ];
        const unique = Array.from(new Map(combined.map(item => [item.url, item])).values());

        return { results: unique, suggestions: source3Response.suggestions, infoboxes: source3Response.infoboxes };
    }

    return { results: dbResults.map(r => ({ ...r, source: 'source2' as const })), suggestions: source3Response.suggestions, infoboxes: source3Response.infoboxes };
}

/**
 * Source 1: Knowledge Base Search (e.g., Wikipedia)
 * Configuration via environment variables
 */
async function searchSource1(query: string): Promise<SmartpediaResult[]> {
    const source1Url = process.env.SEARCH_SOURCE1_URL;
    const source1Type = process.env.SEARCH_SOURCE1_TYPE || 'wikipedia';

    if (!source1Url) {
        console.warn('SEARCH_SOURCE1_URL not configured');
        return [];
    }

    try {
        if (source1Type === 'wikipedia') {
            const endpoint = `${source1Url}/w/api.php?action=query&generator=search&prop=extracts&exintro=1&explaintext=1&utf8=&format=json&origin=*&gsrlimit=5&gsrsearch=${encodeURIComponent(query)}`;

            const response = await fetch(endpoint, {
                headers: {
                    'User-Agent': 'BandhanNova-Smartpedia/1.0 (mailto:contact@bandhannova.com)'
                }
            });
            const data = await response.json();

            if (!data.query || !data.query.pages) return [];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return Object.values(data.query.pages).map((item: any) => ({
                title: item.title,
                url: `${source1Url}/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
                snippet: item.extract || '',
                keywords: [query, 'encyclopedia', 'knowledge'],
                query_source: query,
                source: 'source1' as const,
            }));
        }

        return [];
    } catch (error) {
        console.error("Error fetching from Source 1:", error);
        return [];
    }
}

// ArXiv removed — only configured sources are used

async function searchSource2(query: string): Promise<SmartpediaResult[]> {
    const cluster = getGatewayCluster();
    const masterKey = process.env.BANDHANNOVA_MASTER_KEY;
    const directApiKey = process.env.SEARCH_SOURCE2_API_KEY;
    const source2ApiUrl = process.env.SEARCH_SOURCE2_API_URL || 'https://api.source2.com/search';
    const source2Type = process.env.SEARCH_SOURCE2_TYPE || 'web_api';

    // 1. Attempt through API Hunter Cluster
    for (let i = 0; i < cluster.length; i++) {
        const gatewayUrl = getNextGateway(cluster);
        if (!gatewayUrl) continue;

        try {
            console.log(`[Smartpedia Search] Attempting gateway: ${gatewayUrl}`);
            if (masterKey) {
                console.log(`[Smartpedia Search] Using Master Key (Length: ${masterKey.length}, Starts with: ${masterKey.slice(0, 5)}...)`);
            } else {
                console.warn(`[Smartpedia Search] Master Key is UNDEFINED!`);
            }

            const response = await fetch(`${gatewayUrl}/v1/search/source2`, {
                method: "POST",
                headers: {
                    "X-BandhanNova-Key": masterKey || "",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: query,
                    search_depth: "basic",
                    max_results: 10,
                })
            });

            if (response.ok) {
                const data = await response.json();
                return transformSource2Results(data.results, query);
            }
            console.warn(`[Smartpedia Search] Gateway ${gatewayUrl} failed with status: ${response.status}`);
        } catch (err) {
            console.error(`[Smartpedia Search] Gateway ${gatewayUrl} connection error:`, err);
        }
    }

    // 2. Fallback to Direct API Call
    console.log("[Smartpedia Search] Cluster unavailable, falling back to direct API call...");
    if (!directApiKey) {
        console.warn("Source 2 API Key not found. No web results available.");
        return [];
    }

    try {
        const response = await fetch(source2ApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                api_key: directApiKey,
                query: query,
                search_depth: "basic",
                max_results: 10,
            })
        });

        if (!response.ok) throw new Error(`Direct Source 2 API error: ${response.statusText}`);

        const data = await response.json();
        return transformSource2Results(data.results, query);

    } catch (error) {
        console.error("Critical Search error:", error);
        return [];
    }
}

/**
 * Helper to transform Source 2 raw results into Smartpedia SearchResults
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformSource2Results(source2Results: any[], query: string): SmartpediaResult[] {
    if (!source2Results) return [];

    return source2Results.map((item: any) => ({
        title: item.title,
        url: item.url,
        snippet: item.content || item.snippet,
        keywords: [query, ...item.title.split(' ')],
        query_source: query,
        source: 'source2' as const,
    }));
}

/**
 * Source 3: Meta-Search Engine (e.g., SearXNG)
 * Configuration via environment variables
 */
/**
 * Helper to auto-generate YouTube thumbnails from URLs
 */
function getVideoThumbnail(url: string): string {
    // YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    // Vimeo (best effort)
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
    return '';
}

async function searchSource3Full(query: string, category: string = 'general', page: number = 1): Promise<SmartpediaSearchResponse> {
    const source3Url = process.env.SEARCH_SOURCE3_URL;
    const source3Format = process.env.SEARCH_SOURCE3_FORMAT || 'json';

    if (!source3Url) {
        console.warn('SEARCH_SOURCE3_URL not configured');
        return { results: [], suggestions: [], infoboxes: [] };
    }

    try {
        // SearXNG compatible API endpoint
        const endpoint = `${source3Url}/search?q=${encodeURIComponent(query)}&format=${source3Format}&categories=${category}&pageno=${page}`;

        const response = await fetch(endpoint, {
            headers: {
                'User-Agent': 'BandhanNova-Smartpedia/1.0 (mailto:contact@bandhannova.com)'
            }
        });

        if (!response.ok) {
            console.warn(`Source 3 returned status: ${response.status}`);
            return { results: [], suggestions: [], infoboxes: [] };
        }

        const data = await response.json();

        // Extract suggestions from SearXNG
        const suggestions: string[] = Array.isArray(data.suggestions) ? data.suggestions : [];

        // Extract infoboxes from SearXNG
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const infoboxes: InfoboxData[] = Array.isArray(data.infoboxes)
            ? data.infoboxes.map((ib: any) => ({
                infobox: ib.infobox || '',
                content: ib.content || '',
                img_src: ib.img_src || '',
                urls: Array.isArray(ib.urls) ? ib.urls.map((u: any) => ({ title: u.title || '', url: u.url || '' })) : [],
            }))
            : [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!data.results || !Array.isArray(data.results)) return { results: [], suggestions, infoboxes };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results: SmartpediaResult[] = data.results.map((item: any) => {
            let thumb = item.thumbnail_src || item.img_src || item.thumbnail || item.image || item.img || '';
            // Auto-generate thumbnail for videos if missing
            if (!thumb && category === 'videos' && item.url) {
                thumb = getVideoThumbnail(item.url);
            }
            return {
                title: item.title || 'Untitled',
                url: item.url,
                snippet: item.content || item.snippet || '',
                keywords: [query],
                query_source: query,
                source: 'source3' as const,
                img_src: item.img_src || thumb || '',
                thumbnail_src: thumb || item.img_src || '',
                publishedDate: item.publishedDate || '',
            };
        });

        return { results, suggestions, infoboxes };
    } catch (error) {
        console.error("Error fetching from Source 3:", error);
        return { results: [], suggestions: [], infoboxes: [] };
    }
}



// Mock data removed — no fake results

/**
 * High-Speed Full Content Scraper
 * Fetches the HTML of the given URL and uses Cheerio to extract the main text.
 */
export async function fetchFullContent(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'BandhanNova-Smartpedia/1.0 (mailto:contact@bandhannova.com)'
            }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove script, style, and navigation elements to get clean text
        $('script, style, nav, footer, header, aside, .ad, .advertisement').remove();

        // Extract text from paragraphs
        const text = $('p').map((i, el) => $(el).text()).get().join('\n\n');

        // Limit to ~2000 words to avoid token limits
        return text.slice(0, 10000);
    } catch (error) {
        console.error(`Error scraping full content from ${url}:`, error);
        return "";
    }
}
