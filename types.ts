export enum MessageRole {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
}