import type { Message } from '../../types';

interface MessageListProps {
  messages: Message[];
}

/**
 * Formats a Date object to a readable time string
 */
function formatTimestamp(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * MessageList component displays the conversation history.
 * Redesigned with modern chat bubbles and animations.
 */
export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="p-6 text-center" data-testid="message-list-empty">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-3 border border-white/10 mx-auto">
          <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h3 className="text-slate-300 text-sm font-medium mb-1">No messages yet</h3>
        <p className="text-slate-500 text-xs max-w-[180px] mx-auto">Describe your system to generate a UML diagram.</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3" data-testid="message-list">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex flex-col group ${message.role === 'user' ? 'items-end' : 'items-start'}`}
          data-testid={`message-${message.id}`}
          data-role={message.role}
        >
          <div
            className={`max-w-[90%] rounded-xl px-3 py-2 ${message.role === 'user'
                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-sm'
                : 'bg-slate-800/80 text-slate-200 rounded-bl-sm border border-slate-700/50'
              }`}
          >
            <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <span
            className={`text-[9px] mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${message.role === 'user' ? 'text-indigo-400' : 'text-slate-500'}`}
            data-testid={`timestamp-${message.id}`}
          >
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      ))}
    </div>
  );
}
