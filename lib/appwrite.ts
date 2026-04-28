import { Client, Databases, Query } from 'appwrite';

// Check if Appwrite is configured
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const isConfigured = PROJECT_ID.length > 0 && PROJECT_ID !== 'YOUR_PROJECT_ID';

export const client = new Client();

if (isConfigured) {
    client.setEndpoint(ENDPOINT).setProject(PROJECT_ID);
}

export const databases = isConfigured ? new Databases(client) : null;

// Database and Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'smartpedia_db';
export const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || 'knowledge_base';

export interface SearchResult {
    $id?: string;
    title: string;
    url: string;
    snippet: string;
    keywords: string[];
    created_at?: string;
    query_source: string;
}

export const api = {
    /**
     * Search for existing results in the database
     * Returns empty array if Appwrite is not configured
     */
    searchKnowledgeBase: async (query: string): Promise<SearchResult[]> => {
        if (!databases) {
            return [];
        }
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [
                    Query.search('keywords', query),
                    Query.limit(10)
                ]
            );
            return response.documents as unknown as SearchResult[];
        } catch (error) {
            console.error("Error searching knowledge base:", error);
            return [];
        }
    },

    /**
     * Save a new result to the database
     * Silently skips if Appwrite is not configured
     */
    saveResult: async (result: SearchResult): Promise<void> => {
        if (!databases) {
            return;
        }
        try {
            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                'unique()',
                result
            );
        } catch (error) {
            console.error("Error saving result:", error);
        }
    }
};
