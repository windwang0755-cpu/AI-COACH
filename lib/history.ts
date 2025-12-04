// lib/history.ts
// NOTE: This is a simplified in-memory store for demonstration purposes.
// In a production serverless environment (like Vercel or Netlify), you cannot
// rely on in-memory state because each function invocation is stateless and has
// its own memory. 
//
// **For a real application, you must replace this with a connection to a
// persistent database like Redis, Firestore, PostgreSQL, or MongoDB.**

import { Message } from '../types';

// We will store the last 10 messages, which corresponds to 5 user turns and 5 AI turns.
const MAX_HISTORY_LENGTH = 10; 

// A simple in-memory object to act as our "database".
// The key is the userId, and the value is an array of their recent messages.
const chatHistories: Record<string, Message[]> = {};

/**
 * Retrieves the chat history for a specific user.
 * @param userId The ID of the user.
 * @returns An array of messages, or an empty array if no history exists.
 */
export function getHistory(userId: string): Message[] {
  console.log(`Getting history for user: ${userId}`, chatHistories[userId]);
  return chatHistories[userId] || [];
}

/**
 * Adds a new turn (a user message and an AI response) to a user's history
 * and ensures the history does not exceed the maximum length.
 * @param userId The ID of the user.
 * @param userMessage The message sent by the user.
 * @param aiMessage The message sent by the AI.
 */
export function addTurn(userId: string, userMessage: Message, aiMessage: Message) {
  if (!chatHistories[userId]) {
    chatHistories[userId] = [];
  }
  
  // Add the new user and AI messages to the history.
  chatHistories[userId].push(userMessage, aiMessage);

  // If the history is now too long, trim it by removing the oldest messages.
  if (chatHistories[userId].length > MAX_HISTORY_LENGTH) {
    chatHistories[userId] = chatHistories[userId].slice(-MAX_HISTORY_LENGTH);
  }
  console.log(`Updated history for user: ${userId}`, chatHistories[userId]);
}
