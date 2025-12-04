// app/components/MessageBubble.tsx
import React from 'react';
import { Message, MessageRole } from '../types';
import { coachAvatar } from './avatar';
// We need to import the Image component from Next.js for optimization
import Image from 'next/image';

// ... (LoadingIndicator, CopyIcon, RegenerateIcon components remain the same)
// ...
const LoadingIndicator = () => (
  <div className="flex items-center justify-center space-x-1 p-1">
    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse"></div>
  </div>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
);

const RegenerateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4a14.95 14.95 0 0113.138 5.5M20 20a14.95 14.95 0 01-13.138-5.5"></path></svg>
);

interface MessageBubbleProps {
  message: Message;
  isLastMessage: boolean;
  isLoading: boolean;
  onRegenerate: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLastMessage, isLoading, onRegenerate }) => {
  const isUser = message.role === MessageRole.USER;
  const isAI = message.role === MessageRole.AI;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
  };

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : ''}`}>
      {isAI && (
        <Image
          src={coachAvatar}
          alt="AI Coach"
          width={32} // Next.js Image component requires width and height
          height={32}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
      )}
      <div className={`flex flex-col gap-1 w-full max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
            className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            isUser
                ? 'bg-blue-600 text-white rounded-br-lg'
                : 'bg-gray-100 text-gray-800 rounded-bl-lg'
            }`}
        >
            {isAI && isLoading && isLastMessage && message.text.length === 0 ? (
            <LoadingIndicator />
            ) : (
            <p className="whitespace-pre-wrap text-base">{message.text}</p>
            )}
        </div>
        {isAI && !isLoading && isLastMessage && message.id !== 'initial' && (
            <div className="flex items-center gap-2 mt-1">
                <button onClick={handleCopy} aria-label="Copy message" className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"><CopyIcon /></button>
                <button onClick={onRegenerate} aria-label="Regenerate response" className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"><RegenerateIcon /></button>
            </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;