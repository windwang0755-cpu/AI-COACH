import { Message, MessageRole } from '../types';

export const INITIAL_AI_MESSAGE: Message = {
  id: 'initial',
  role: MessageRole.AI,
  text: "Hello, I'm your personal AI coach, you can ask me anything about fitness and workouts.",
};

export const SUGGESTED_PROMPTS: string[] = [
  "推荐3个有效的自重训练动作",
  "建议一顿健康的训练后餐食",
  "我如何提高身体柔韧性？",
];
