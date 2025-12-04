// app/api/chat/route.ts
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { addTurn } from '../../lib/history';
import { Message, MessageRole } from '../../types';

const AI_SYSTEM_INSTRUCTION = "You are a friendly and encouraging AI fitness coach. Provide safe, effective, and personalized advice on fitness, workouts, and nutrition. Always prioritize user safety and suggest consulting a professional like a doctor or physical therapist for medical advice or before starting a new fitness program. Keep your responses motivating and easy to understand.";

export async function POST(request: Request) {
    try {
        const { userId, userMessage, history } = await request.json();

        // 校验请求体，history 可以为空数组
        if (!userId || !userMessage) {
            return new Response(JSON.stringify({ error: 'Missing required fields: userId, userMessage' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' },
             });
        }
        
        // 在服务器端检查 API Key 是否配置
        if (!process.env.API_KEY) {
            console.error("API_KEY environment variable is not set on the server.");
            throw new Error("API_KEY environment variable is not set on the server.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: AI_SYSTEM_INSTRUCTION,
                maxOutputTokens: 300,
                thinkingConfig: { thinkingBudget: 50 },
            },
            history: (history || []).map((msg: Message) => ({
                role: msg.role === MessageRole.USER ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }))
        });
        
        const result = await chat.sendMessageStream({ message: userMessage.text });

        let fullText = "";
        
        const responseStream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                for await (const chunk of result) {
                    const chunkResponse = chunk as GenerateContentResponse;
                    const chunkText = chunkResponse.text;
                    if(chunkText) {
                        fullText += chunkText;
                        controller.enqueue(encoder.encode(chunkText));
                    }
                }
                
                const aiMessage: Message = { id: (Date.now() + 1).toString(), role: MessageRole.AI, text: fullText };
                
                // 只有当 AI 确实生成了内容时，才保存这次对话
                if (fullText.trim().length > 0) {
                    await addTurn(userId, userMessage, aiMessage);
                }
                
                controller.close();
            },
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
