// app/lib/history.ts
import { kv } from '@vercel/kv';
import { Message } from '../types';

const MAX_HISTORY_LENGTH = 10; 

/**
 * 从 Vercel KV 中检索指定用户的聊天记录。
 * @param userId 用户的 ID。
 * @returns 包含消息的数组，如果找不到则返回空数组。
 */
export async function getHistory(userId: string): Promise<Message[]> {
  const key = `history:${userId}`;
  try {
    // 从 Redis list 的左侧（旧消息）到右侧（新消息）获取所有记录
    const history = await kv.lrange<Message>(key, 0, -1);
    return history || [];
  } catch (error) {
    console.error("Error fetching history from Vercel KV:", error);
    return [];
  }
}

/**
 * 将一个新的对话回合（用户消息和 AI 回复）添加到用户的历史记录中。
 * @param userId 用户的 ID。
 * @param userMessage 用户的消息。
 * @param aiMessage AI 的回复。
 */
export async function addTurn(userId: string, userMessage: Message, aiMessage: Message) {
  const key = `history:${userId}`;
  try {
    // rpush 会将新元素添加到列表的右侧（末尾），保持对话顺序
    await kv.rpush(key, userMessage, aiMessage);

    // ltrim 会修剪列表，只保留指定范围内的元素。
    // 使用负数索引 `-MAX_HISTORY_LENGTH` 表示从列表末尾开始数，保留最后10条记录。
    await kv.ltrim(key, -MAX_HISTORY_LENGTH, -1);
  } catch (error) {
    console.error("Error adding turn to Vercel KV:", error);
  }
}
