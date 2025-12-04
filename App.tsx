import React, { useState, useEffect, useCallback } from 'react';
import { Message, MessageRole } from './types';
import { INITIAL_AI_MESSAGE, SUGGESTED_PROMPTS } from './constants';
import Header from './components/Header';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import Suggestions from './components/Suggestions';

// In a real app, this would come from an authentication context after a user logs in.
const USER_ID = 'user_123_demo';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  // Fetch chat history on initial load from our new backend endpoint.
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // In a real deployed app, this fetch request would go to your live backend.
        // Since we can't run the backend in this environment, this call will fail.
        // I've set up the logic to handle both the successful case and the fallback.
        const response = await fetch(`/api/history?userId=${USER_ID}`);
        
        if (response.ok) {
            const history = await response.json();
            if (history && history.length > 0) {
                setMessages(history);
            } else {
                setMessages([INITIAL_AI_MESSAGE]);
                setShowSuggestions(true);
            }
        } else {
            // Fallback for demo purposes if the backend isn't running
            setMessages([INITIAL_AI_MESSAGE]);
            setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Could not fetch history, starting a new conversation.", error);
        // Fallback for demo purposes if the fetch fails
        setMessages([INITIAL_AI_MESSAGE]);
        setShowSuggestions(true);
      } finally {
        setIsHistoryLoaded(true);
      }
    };
    fetchHistory();
  }, []);


  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    setShowSuggestions(false);
    setIsLoading(true);

    const userMessage: Message = { id: Date.now().toString(), role: MessageRole.USER, text };
    const aiPlaceholder: Message = { id: (Date.now() + 1).toString(), role: MessageRole.AI, text: "" };
    
    const messagesWithUser = messages[0].id === 'initial' ? [userMessage] : [...messages, userMessage];
    const currentMessages = [...messagesWithUser, aiPlaceholder];
    setMessages(currentMessages);
    
    const historyForBackend = messagesWithUser.filter(m => m.id !== 'initial');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: USER_ID,
                userMessage: userMessage,
                history: historyForBackend,
            }),
        });

        if (!response.ok || !response.body) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunkText = decoder.decode(value);
            fullText += chunkText;
            
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === MessageRole.AI) {
                    lastMessage.text = fullText;
                }
                return newMessages;
            });
        }
    } catch (error) {
        console.error("Error sending message:", error);
        setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === MessageRole.AI) {
                lastMessage.text = "I'm sorry, I'm having trouble connecting to my server. Please try again later.";
            }
            return newMessages;
        });
    } finally {
        setIsLoading(false);
    }
  }, [isLoading, messages]);
  
  const handleRegenerate = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === MessageRole.USER);
    if(lastUserMessage) {
        const lastAiMessageIndex = messages.findLastIndex(m => m.role === MessageRole.AI);
        if (lastAiMessageIndex !== -1) {
             setMessages(prev => prev.slice(0, lastAiMessageIndex));
             handleSendMessage(lastUserMessage.text);
        }
    }
  }, [messages, handleSendMessage]);
  
  if (!isHistoryLoaded) {
      return (
          <div className="flex flex-col h-screen max-w-md mx-auto bg-white font-sans items-center justify-center">
              <p className="text-gray-600">Connecting to your AI Coach...</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white font-sans">
      <Header />
      <MessageList messages={messages} isLoading={isLoading} onRegenerate={handleRegenerate} />
      {showSuggestions && <Suggestions prompts={SUGGESTED_PROMPTS} onSelect={handleSendMessage} />}
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;
