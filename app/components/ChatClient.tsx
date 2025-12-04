"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Message, MessageRole } from '../types';
import { INITIAL_AI_MESSAGE, SUGGESTED_PROMPTS } from './constants';
import Header from './Header';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import Suggestions from './Suggestions';

// 在真实的 App 中，这个 ID 应该从 App 的登录状态中动态获取
const USER_ID = 'user_123_demo';

const ChatClient: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  
  // 使用 ref 来追踪最新的消息状态，避免在回调函数中拿到旧的 state
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // 初始化时从后端获取聊天记录
  useEffect(() => {
    const fetchHistory = async () => {
      try {
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
          setMessages([INITIAL_AI_MESSAGE]);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Could not fetch history, starting new conversation.", error);
        setMessages([INITIAL_AI_MESSAGE]);
        setShowSuggestions(true);
      } finally {
        setIsHistoryLoaded(true);
      }
    };
    fetchHistory();
  }, []);

  const handleSendMessage = useCallback(async (text: string, messageHistory?: Message[]) => {
    if (!text.trim() || isLoading) return;

    setShowSuggestions(false);
    setIsLoading(true);

    const userMessage: Message = { id: Date.now().toString(), role: MessageRole.USER, text };
    
    // 决定是基于当前 state 还是传入的历史记录来构建请求
    const baseMessages = messageHistory ?? messagesRef.current;
    
    const messagesWithUser = baseMessages[0]?.id === 'initial'
      ? [userMessage]
      : [...baseMessages, userMessage];

    const aiPlaceholder: Message = { id: (Date.now() + 1).toString(), role: MessageRole.AI, text: "" };
    setMessages([...messagesWithUser, aiPlaceholder]);
    
    // 发送到后端的历史记录不应包含占位符
    const historyForBackend = messagesWithUser;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: USER_ID,
          userMessage: userMessage,
          // 发送给后端的历史记录是用户发这条消息之前的记录
          history: historyForBackend.slice(0, -1),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      // 流式读取后端返回的数据并更新 UI
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        fullText += decoder.decode(value);
        
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage?.role === MessageRole.AI) {
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
        if (lastMessage?.role === MessageRole.AI) {
          lastMessage.text = "抱歉，连接服务器时遇到问题，请稍后再试。";
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);
  
  // “重新生成”按钮的逻辑
  const handleRegenerate = useCallback(() => {
    const currentMessages = messagesRef.current;
    const lastUserMessageIndex = currentMessages.findLastIndex(m => m.role === MessageRole.USER);
    if (lastUserMessageIndex === -1) return;
    
    const lastUserMessage = currentMessages[lastUserMessageIndex];
    // 获取到最后一条用户消息之前的所有对话作为历史
    const historyForRegeneration = currentMessages.slice(0, lastUserMessageIndex);
    
    // 重新发送最后一条用户消息
    handleSendMessage(lastUserMessage.text, historyForRegeneration);
  }, [handleSendMessage]);
  
  if (!isHistoryLoaded) {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-white font-sans items-center justify-center">
        <p className="text-gray-600">正在连接您的 AI 教练...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white font-sans">
      <Header />
      <MessageList messages={messages} isLoading={isLoading} onRegenerate={handleRegenerate} />
      {showSuggestions && <Suggestions prompts={SUGGESTED_PROMPTS} onSelect={(prompt) => handleSendMessage(prompt)} />}
      <ChatInput onSend={(text) => handleSendMessage(text)} isLoading={isLoading} />
    </div>
  );
};

export default ChatClient;
