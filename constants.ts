import { Message, MessageRole } from './types';

export const INITIAL_AI_MESSAGE: Message = {
  id: 'initial',
  role: MessageRole.AI,
  text: "Hello, I'm your personal AI coach, you can ask me anything about fitness and workouts.",
};

export const SUGGESTED_PROMPTS: string[] = [
  "What are 3 effective bodyweight exercises?",
  "Suggest a healthy post-workout meal.",
  "How can I improve my flexibility?",
];
