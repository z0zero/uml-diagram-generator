import { useState, useCallback } from 'react';
import { Send, Loader2, Sparkles, ChevronDown } from 'lucide-react';
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
 * Redesigned with glassmorphism and modern inputs.
 */
export function PromptPanel({ messages, isLoading, onSubmit }: PromptPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  const handleSubmit = useCallback(() => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !isLoading) {
      onSubmit(trimmedValue);
      setInputValue('');
      setShowExamples(false);
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
      className="h-[96vh] my-[2vh] w-[350px] mr-4 flex flex-col glass-dark rounded-2xl border-slate-700/50 shadow-2xl relative overflow-hidden transition-all duration-300"
      data-testid="prompt-panel"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-slate-900/40 backdrop-blur-xl z-20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/20 rounded-lg">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200">AI Assistant</h2>
            <p className="text-[10px] text-slate-500">Powered by Gemini</p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <MessageList messages={messages} />

      {/* Input Area */}
      <div className="p-4 bg-slate-900/40 backdrop-blur-xl border-t border-white/5 z-20">
        <div className="flex flex-col gap-3 relative">

          {/* Example Prompts Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors py-1"
              data-testid="examples-toggle"
            >
              <Sparkles className="w-3 h-3" />
              <span>{showExamples ? 'Hide examples' : 'Try an example'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showExamples ? 'rotate-180' : ''}`} />
            </button>

            {showExamples && (
              <div className="absolute bottom-full left-0 right-0 mb-3 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-slide-up z-50">
                <div className="p-1">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="w-full text-left px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors rounded-lg flex items-start gap-2"
                      data-testid={`example-prompt-${index}`}
                    >
                      <span className="opacity-50 mt-0.5">•</span>
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative group">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the system structure..."
              disabled={isLoading}
              className="w-full h-24 pl-4 pr-12 py-3 text-sm bg-slate-950/50 text-slate-200 border border-slate-700/50 rounded-xl resize-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:bg-slate-900/80 transition-all placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="prompt-input"
            />

            <button
              onClick={handleSubmit}
              disabled={isLoading || !inputValue.trim()}
              className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all duration-300 ${isLoading || !inputValue.trim()
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 active:scale-95'
                }`}
              data-testid="submit-btn"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="text-[10px] text-center text-slate-600">
            Press Enter to generate
          </div>
        </div>
      </div>
    </aside>
  );
}
