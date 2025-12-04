// api/history/route.ts
// This file represents a server-side API endpoint. For example, in a framework
// like Next.js, this would live in a file at `app/api/history/route.ts`.
// Its purpose is to retrieve the chat history for a given user from the database.

import { getHistory } from '../../lib/history';
import { Message } from '../../types';

/**
 * Handles GET requests to /api/history.
 * It expects a 'userId' as a query parameter.
 * 
 * @param request The incoming request object. In a real environment, this would be a standard Request object.
 * @returns A Response object containing the user's chat history or an error.
 */
// The `Request` and `Response` objects are part of the standard Web APIs and are
// available in most modern server-side JavaScript environments.
export async function GET(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
        return new Response(JSON.stringify({ error: 'userId query parameter is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const history: Message[] = getHistory(userId);
        return new Response(JSON.stringify(history), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(`Error fetching history for user ${userId}:`, error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
