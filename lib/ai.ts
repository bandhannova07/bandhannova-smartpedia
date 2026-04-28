import type { AnswerMode } from '@/components/AnswerModeSelector';
import type { Perspective } from '@/components/PerspectiveSwitch';

// --- Cluster Management Utility ---
function getGatewayCluster(): string[] {
    const cluster = process.env.API_HUNTER_CLUSTER || "";
    return cluster.split(',').map(s => s.trim().replace(/^["'](.+(?=["']$))["']$/, '$1')).filter(s => s !== "");
}

let clusterIndex = 0;
function getNextGateway(cluster: string[]): string {
    if (cluster.length === 0) return "";
    const url = cluster[clusterIndex];
    clusterIndex = (clusterIndex + 1) % cluster.length;
    return url;
}

const systemPrompts: Record<AnswerMode, string> = {
    quick: `You are BandhanNova Smartpedia AI. Give a VERY concise answer in 2-3 sentences. 
Be direct, no fluff. Use **bold** for key terms. Then provide 3-4 "Atomic Facts" as bullet points.`,

    detailed: `You are BandhanNova Smartpedia AI, an Atomic Knowledge Architect.

**Goal:** Transform complex queries into a "Knowledge Dashboard" consisting of 8-10 granular, scannable cards.

**Strict Output Format:**
Produce 8-10 sections using ## Heading. Each section MUST be 1-2 sentences maximum. No more. 

**Cover diverse "Atomic Angles" such as:**
- ## The Core Concept (What is it?)
- ## Historical Origin (Where did it start?)
- ## Current Status (What's happening now?)
- ## Pro Tip/Fast Hack
- ## Global Impact
- ## Common Misconception
- ## Future Outlook
- ## Key Statistics

**Rules:**
- NO introductory text. NO concluding summaries.
- Use > Blockquotes for one "Golden Quote" only.
- Each ## section must be a self-contained "bite" of knowledge.
- Be professional, objective, and extremely concise.`,

    eli5: `You are BandhanNova Smartpedia AI. Explain this to a 5-year-old using 8-10 small "Knowledge Bubbles".

**Format:**
8-10 sections with ## Simple Heading. 1 sentence each.

**Angles:**
- ## What is it? 🤔
- ## How it works ⚙️
- ## Fun Fact! ✨
- ## Why we need it 🌟
- ## Analogies (It's like...)

**Rules:**
- Use simple words and emojis.🎉
- No long paragraphs. 
- Keep it fun and scannable.`,

    academic: `You are BandhanNova Smartpedia AI, a Formal Knowledge Curator.

**Goal:** Provide 8-10 rigorous, atomic scholarly insights.

**Format:**
8-10 sections using ## Formal Heading. Max 2 sentences each.

**Angles:**
- ## Theoretical Framework
- ## Empirical Evidence
- ## Methodological Oversight
- ## Scholarly Consensus
- ## Critical Limitations

**Rules:**
- Precise technical vocabulary.
- Formal citations in [Source] format.
- NO filler text. Only high-density information bites.`,
};

const perspectiveInstructions: Record<Perspective, string> = {
    fact: "Focus on established facts, numbers, and consensus. Be objective and data-driven.",
    critical: "Ask the 'uncomfortable' questions. Highlight risks, limitations, and alternative viewpoints. Be the 'skeptic' researcher.",
    future: "Speculate on long-term implications, emerging trends, and theoretical possibilities. Be visionary.",
    community: "Focus on user sentiment, common hacks, personal experiences, and what people on the 'ground' are saying (Reddit/Forums style)."
};

export async function generateAIAnswer(
    query: string,
    context: string,
    mode: AnswerMode = 'detailed',
    perspective: Perspective = 'fact'
): Promise<{ answer: string; followUpQuestions: string[] }> {
    const cluster = getGatewayCluster();
    const masterKey = process.env.BANDHANNOVA_MASTER_KEY;
    const directApiKey = process.env.OPENROUTER_API_KEY;

    // Attempt through API Hunter Cluster first
    for (let i = 0; i < cluster.length; i++) {
        const gatewayUrl = getNextGateway(cluster);
        if (!gatewayUrl) continue;

        try {
            console.log(`[Smartpedia AI] Attempting gateway: ${gatewayUrl}`);
            if (masterKey) {
                console.log(`[Smartpedia AI] Using Master Key (Length: ${masterKey.length}, Starts with: ${masterKey.slice(0, 5)}...)`);
            } else {
                console.warn(`[Smartpedia AI] Master Key is UNDEFINED!`);
            }

            const response = await fetch(`${gatewayUrl}/v1/ai/chat`, {
                method: "POST",
                headers: {
                    "X-BandhanNova-Key": masterKey || "",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "model": "arcee-ai/trinity-large-preview:free",
                    "messages": [
                        {
                            "role": "system",
                            "content": `${systemPrompts[mode]}\n\nCURRENT PERSPECTIVE: ${perspectiveInstructions[perspective]}`
                        },
                        {
                            "role": "user",
                            "content": `Context from search results:\n${context}\n\nQuestion: ${query}`
                        }
                    ]
                })
            });

            if (response.ok) {
                const data = await response.json();
                const answer = data.choices?.[0]?.message?.content || data.content || "No answer generated.";
                return { answer, followUpQuestions: generateFollowUps(query, answer) };
            }
            console.warn(`[Smartpedia AI] Gateway ${gatewayUrl} failed with status: ${response.status}`);
        } catch (err) {
            console.error(`[Smartpedia AI] Gateway ${gatewayUrl} connection error:`, err);
        }
    }

    // Fallback to Direct API Call
    console.log("[Smartpedia AI] Cluster unavailable, falling back to direct API call...");
    if (!directApiKey) {
        return { answer: "Error: No API Gateway or OpenRouter Key found.", followUpQuestions: [] };
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${directApiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://smartpedia.bandhannova.in",
                "X-Title": "BandhanNova Smartpedia",
            },
            body: JSON.stringify({
                "model": "arcee-ai/trinity-large-preview:free",
                "messages": [
                    {
                        "role": "system",
                        "content": `${systemPrompts[mode]}\n\nCURRENT PERSPECTIVE: ${perspectiveInstructions[perspective]}`
                    },
                    {
                        "role": "user",
                        "content": `Context from search results:\n${context}\n\nQuestion: ${query}`
                    }
                ]
            })
        });

        if (!response.ok) throw new Error(`Direct OpenRouter API error: ${response.statusText}`);

        const data = await response.json();
        const answer = data.choices[0]?.message?.content || "No answer generated.";
        return { answer, followUpQuestions: generateFollowUps(query, answer) };
    } catch (error) {
        console.error("Critical AI error:", error);
        return {
            answer: "Sorry, I encountered a critical error. Both Cluster and Direct fallback failed.",
            followUpQuestions: []
        };
    }
}

/**
 * Generate follow-up questions based on the query and answer
 * Uses pattern-based generation (no extra API call needed)
 */
function generateFollowUps(query: string, answer: string): string[] {
    const followUps: string[] = [];
    const queryLower = query.toLowerCase();

    // Extract key topics from the answer (simple heuristic)
    const boldMatches = answer.match(/\*\*([^*]+)\*\*/g);
    const keyTerms = boldMatches
        ? boldMatches.map(m => m.replace(/\*\*/g, '')).slice(0, 3)
        : [];

    // Pattern-based follow-up generation
    if (queryLower.startsWith('what is') || queryLower.startsWith('what are')) {
        followUps.push(`How does ${query.replace(/^what (is|are) /i, '')} work?`);
        followUps.push(`History of ${query.replace(/^what (is|are) /i, '')}`);
        followUps.push(`${query.replace(/^what (is|are) /i, '')} vs alternatives`);
    } else if (queryLower.startsWith('how')) {
        followUps.push(`Why ${query.replace(/^how /i, '')}?`);
        followUps.push(`Examples of ${query.replace(/^how (to |do |does |did )?/i, '')}`);
    } else if (queryLower.startsWith('why')) {
        followUps.push(`How to solve ${query.replace(/^why (is |are |do |does )?/i, '')}`);
        followUps.push(`History behind ${query.replace(/^why /i, '')}`);
    } else {
        followUps.push(`How does ${query} work?`);
        followUps.push(`${query} explained simply`);
        followUps.push(`Latest developments in ${query}`);
    }

    // Add topic-specific follow-ups from key terms
    if (keyTerms.length > 0) {
        followUps.push(`What is ${keyTerms[0]}?`);
    }

    return followUps.slice(0, 4);
}
