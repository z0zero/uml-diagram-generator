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
 * User and assistant messages are styled differently.
 * Each message shows a timestamp.
 * 
 * Requirements: 4.4
 */
export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm" data-testid="message-list-empty">
        <p>No messages yet. Start by describing your system.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="message-list">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex flex-col ${
            message.role === 'user' ? 'items-end' : 'items-start'
          }`}
          data-testid={`message-${message.id}`}
          data-role={message.role}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
          <span
            className={`text-xs mt-1 ${
              message.role === 'user' ? 'text-gray-400' : 'text-gray-400'
            }`}
            data-testid={`timestamp-${message.id}`}
          >
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      ))}
    </div>
  );
}
