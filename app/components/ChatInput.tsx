import React, { useState, useRef, FormEvent } from 'react';

const SendIcon = ({ disabled }: { disabled: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 2L11 13" stroke={disabled ? '#4B5563' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={disabled ? '#4B5563' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      // 设置一个最大高度，例如 128px (8rem)
      const maxHeight = 128;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <footer className="bg-white p-2 sticky bottom-0 border-t border-gray-200">
      <form onSubmit={handleSubmit} className="flex items-end gap-2 bg-gray-800 rounded-xl p-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
              setText(e.target.value);
          }}
          onInput={handleInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="输入任何内容..."
          className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none overflow-y-auto text-base py-2 px-2"
          rows={1}
          disabled={isLoading}
          aria-label="Chat input"
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 disabled:bg-gray-600 bg-blue-600 hover:bg-blue-700 flex-shrink-0"
          aria-label="Send message"
        >
          <SendIcon disabled={isLoading || !text.trim()} />
        </button>
      </form>
    </footer>
  );
};

export default ChatInput;
