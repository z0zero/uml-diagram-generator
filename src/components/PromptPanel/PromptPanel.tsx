import { useState, useCallback } from 'react';
import { Send, Loader2, Lightbulb } from 'lucide-react';
import { MessageList } from './MessageList';
import type { Message } from '../../types';

interface PromptPanelProps {
  messages: Message[];
  isLoading: boolean;
  onSubmit: (prompt: string) => void;
}

/**
 * Example prompts to help users get started
 */
const examplePrompts = [
  'Design an e-commerce system with users, products, orders, and shopping cart',
  'Create a library management system with books, members, and loans',
  'Model a hospital system with patients, doctors, and appointments',
  'Design a school system with students, teachers, and courses',
  'Create a restaurant ordering system with menu items and orders',
  'Model a banking system with accounts and transactions',
  'Design a blog platform with posts, comments, and categories',
  'Create a vehicle hierarchy with cars and motorcycles',
];

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
  const [showExamples, setShowExamples] = useState(false);

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

  const handleExampleClick = useCallback((example: string) => {
    setInputValue(example);
    setShowExamples(false);
  }, []);

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
          {/* Example Prompts Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
              data-testid="examples-toggle"
            >
              <Lightbulb className="w-3 h-3" />
              <span>{showExamples ? 'Hide examples' : 'Show example prompts'}</span>
            </button>
            
            {/* Example Prompts Dropdown */}
            {showExamples && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto z-10">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100 last:border-b-0"
                    data-testid={`example-prompt-${index}`}
                  >
                    {example}
                  </button>
                ))}
              </div>
            )}
          </div>

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
