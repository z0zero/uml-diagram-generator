import { useState, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { MessageList } from './MessageList';
import type { Message } from '../../types';

interface PromptPanelProps {
  messages: Message[];
  isLoading: boolean;
  onSubmit: (prompt: string) => void;
}

/**
 * PromptPanel component provides a chat interface for user prompts.
 * Features:
 * - Text input area for entering prompts
 * - Submit button to send prompts
 * - Loading indicator during AI processing
 * - Conversation history display
 * - Support for follow-up prompts
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
export function PromptPanel({ messages, isLoading, onSubmit }: PromptPanelProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !isLoading) {
      onSubmit(trimmedValue);
      setInputValue('');
    }
  }, [inputValue, isLoading, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <aside
      className="w-80 h-full bg-white border-l border-gray-200 flex flex-col"
      data-testid="prompt-panel"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Prompt</h2>
        <p className="text-xs text-gray-500 mt-1">
          Describe your system to generate a UML diagram
        </p>
      </div>

      {/* Message List */}
      <MessageList messages={messages} />

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex flex-col gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your system..."
            disabled={isLoading}
            className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
            data-testid="prompt-input"
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !inputValue.trim()}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              isLoading || !inputValue.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            data-testid="submit-btn"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
