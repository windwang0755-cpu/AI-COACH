import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onRegenerate: () => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, onRegenerate }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <main className="flex-1 overflow-y-auto p-4 space-y-4">
      <div role="log" className="space-y-4">
        {messages.map((message, index) => (
          <MessageBubble 
            key={message.id} 
            message={message}
            isLastMessage={index === messages.length - 1}
            isLoading={isLoading}
            onRegenerate={onRegenerate}
          />
        ))}
      </div>
      <div ref={messagesEndRef} />
    </main>
  );
};

export default MessageList;
