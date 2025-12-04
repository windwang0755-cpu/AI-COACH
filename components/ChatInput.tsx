import React, { useState, useRef, FormEvent } from 'react';

const SendIcon = ({ disabled }: { disabled: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${disabled ? 'text-gray-400' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
      textarea.style.height = `${textarea.scrollHeight}px`;
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
          onChange={(e) => setText(e.target.value)}
          onInput={handleInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Type anything..."
          className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none max-h-32 text-base py-2 px-2"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 disabled:bg-gray-600 bg-blue-600 hover:bg-blue-700"
        >
          <SendIcon disabled={isLoading || !text.trim()} />
        </button>
      </form>
    </footer>
  );
};

export default ChatInput;