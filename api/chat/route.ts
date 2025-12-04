// api/chat/route.ts
// This file represents the main server-side API endpoint for handling chat.
// It securely proxies requests to the Gemini API and manages conversation history.

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { addTurn } from '../../lib/history';
import { Message, MessageRole } from '../../types';

// The system instruction is now defined and controlled by the backend.
const AI_SYSTEM_INSTRUCTION = "You are a friendly and encouraging AI fitness coach. Provide safe, effective, and personalized advice on fitness, workouts, and nutrition. Always prioritize user safety and suggest consulting a professional like a doctor or physical therapist for medical advice or before starting a new fitness program. Keep your responses motivating and easy to understand.";

/**
 * Handles POST requests to /api/chat.
 * It streams a response from the Gemini API and then saves the conversation.
 * 
 * @param request The incoming request object, expected to have a JSON body.
 * @returns A streaming Response object with the AI's answer.
 */
export async function POST(request: Request) {
    try {
        const { userId, userMessage, history } = await request.json();

        if (!userId || !userMessage || !history) {
            return new Response(JSON.stringify({ error: 'Missing required fields: userId, userMessage, history' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' },
             });
        }
        
        // IMPORTANT: Initialize the Gemini client here on the server, using the
        // API key from your server's environment variables. The client never sees this key.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: AI_SYSTEM_INSTRUCTION,
                maxOutputTokens: 300,
                thinkingConfig: { thinkingBudget: 50 },
            },
            history: history.map((msg: Message) => ({
                role: msg.role === MessageRole.USER ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }))
        });
        
        const stream = await chat.sendMessageStream({ message: userMessage.text });

        let fullText = "";
        
        // Create a new ReadableStream to send back to the client.
        const responseStream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                for await (const chunk of stream) {
                    const chunkResponse = chunk as GenerateContentResponse;
                    const chunkText = chunkResponse.text;
                    if(chunkText) {
                        fullText += chunkText;
                        controller.enqueue(encoder.encode(chunkText));
                    }
                }
                
                // After the stream is finished, create the final AI message object.
                const aiMessage: Message = { id: (Date.now() + 1).toString(), role: MessageRole.AI, text: fullText };
                
                // Save the complete user message and AI response to our "database".
                addTurn(userId, userMessage, aiMessage);
                
                controller.close();
            }
        });

        return new Response(responseStream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });

    } catch (error) {
        console.error("Error in chat API:", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
