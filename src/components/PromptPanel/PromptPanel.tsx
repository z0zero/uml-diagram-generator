import { useState, useCallback } from 'react';
import { Send, Loader2, Sparkles, ChevronDown, Settings, AlertTriangle } from 'lucide-react';
import { MessageList } from './MessageList';
import type { Message } from '../../types';

interface PromptPanelProps {
  messages: Message[];
  isLoading: boolean;
  onSubmit: (prompt: string) => void;
  hasApiKey?: boolean;
  onSettingsClick?: () => void;
}

/**
 * Example prompts to help users get started
 */
const examplePrompts = [
  'Design an e-commerce system with users, products, orders, and shopping cart',
  'Create a library management system with books, members, and loans',
  'Model a hospital system with patients, doctors, and appointments',
  'Design a school system with students, teachers, and courses',
];

/**
 * PromptPanel component provides a chat interface for user prompts.
 * Redesigned with glassmorphism and modern inputs.
 */
export function PromptPanel({ messages, isLoading, onSubmit, hasApiKey = true, onSettingsClick }: PromptPanelProps) {
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
      className="h-full w-80 flex flex-col glass-dark border-l border-slate-700/50 shadow-2xl overflow-hidden"
      data-testid="prompt-panel"
    >
      {/* Header */}
      <div className="p-3 border-b border-white/5 flex items-center gap-2">
        <div className="p-1.5 bg-indigo-500/20 rounded-lg">
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-slate-200">AI Assistant</h2>
          <p className="text-[10px] text-slate-500">Powered by Gemini</p>
        </div>
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className={`p-1.5 rounded-lg transition-colors ${hasApiKey
                ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
            title={hasApiKey ? 'API Key Settings' : 'API Key Required'}
            data-testid="settings-btn"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* API Key Warning */}
      {!hasApiKey && (
        <div className="mx-3 mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200">
            <p className="font-medium">API Key Required</p>
            <p className="text-amber-300/70 mt-0.5">Click the settings icon to add your Gemini API key.</p>
          </div>
        </div>
      )}

      {/* Message List - scrollable area that takes remaining space */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <MessageList messages={messages} />
      </div>

      {/* Spacer when no messages */}
      {messages.length === 0 && <div className="flex-1" />}

      {/* Input Area */}
      <div className="p-3 border-t border-white/5">
        {/* Example Prompts Toggle */}
        <div className="relative mb-2">
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
            data-testid="examples-toggle"
          >
            <Sparkles className="w-3 h-3" />
            <span>Try an example</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showExamples ? 'rotate-180' : ''}`} />
          </button>

          {showExamples && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-2xl overflow-hidden max-h-48 overflow-y-auto z-50">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="w-full text-left px-3 py-2 text-[11px] text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors border-b border-slate-700/30 last:border-0"
                  data-testid={`example-prompt-${index}`}
                >
                  {example}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the system structure..."
            disabled={isLoading}
            className="w-full h-16 px-3 py-2 pr-10 text-xs bg-slate-950/50 text-slate-200 border border-slate-700/50 rounded-lg resize-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 disabled:opacity-50"
            data-testid="prompt-input"
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !inputValue.trim()}
            className={`absolute bottom-2 right-2 p-1.5 rounded-md transition-all ${isLoading || !inputValue.trim()
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
              }`}
            data-testid="submit-btn"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <p className="text-[9px] text-slate-600 text-center mt-1.5">Press Enter to generate</p>
      </div>
    </aside>
  );
}
