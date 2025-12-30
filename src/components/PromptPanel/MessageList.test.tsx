import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { MessageList } from './MessageList';
import type { Message, MessageRole } from '../../types';

// ============================================
// Generators for Property-Based Testing
// ============================================

const messageRoleGen: fc.Arbitrary<MessageRole> = fc.constantFrom('user', 'assistant');

const messageGen: fc.Arbitrary<Message> = fc.record({
  id: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{0,19}$/),
  role: messageRoleGen,
  content: fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
  timestamp: fc.date(),
});

// Generate array of messages with unique IDs
const messagesArrayGen: fc.Arbitrary<Message[]> = fc
  .array(messageGen, { minLength: 0, maxLength: 20 })
  .map((messages) =>
    messages.map((message, idx) => ({
      ...message,
      id: `msg_${idx}`,
    }))
  );

// ============================================
// Property Tests
// ============================================

describe('MessageList Component', () => {
  /**
   * Feature: uml-diagram-generator, Property 11: Conversation History Preservation
   * *For any* sequence of messages added to the conversation, the Prompt_Panel
   * SHALL display all messages in chronological order.
   * **Validates: Requirements 4.4**
   */
  describe('Property 11: Conversation History Preservation', () => {
    it('should display all messages in chronological order for any sequence of messages', () => {
      fc.assert(
        fc.property(messagesArrayGen, (messages) => {
          const { unmount } = render(<MessageList messages={messages} />);

          if (messages.length === 0) {
            // When no messages, should show empty state
            const emptyMessage = screen.getByTestId('message-list-empty');
            expect(emptyMessage).toBeDefined();
            expect(emptyMessage).not.toBeNull();
          } else {
            // Property: All messages are displayed
            const messageList = screen.getByTestId('message-list');
            expect(messageList).toBeDefined();

            for (const message of messages) {
              const messageElement = screen.getByTestId(`message-${message.id}`);
              expect(messageElement).toBeDefined();
              expect(messageElement).not.toBeNull();
              
              // Verify message content is displayed
              expect(messageElement.textContent).toContain(message.content);
              
              // Verify message role is correctly attributed
              expect(messageElement.getAttribute('data-role')).toBe(message.role);
            }

            // Property: Messages are displayed in the same order as input (chronological)
            const allMessageElements = messageList.querySelectorAll('[data-testid^="message-msg_"]');
            expect(allMessageElements.length).toBe(messages.length);

            // Verify order is preserved
            allMessageElements.forEach((element, index) => {
              const expectedId = `message-msg_${index}`;
              expect(element.getAttribute('data-testid')).toBe(expectedId);
            });

            // Property: Each message has a timestamp displayed
            for (const message of messages) {
              const timestampElement = screen.getByTestId(`timestamp-${message.id}`);
              expect(timestampElement).toBeDefined();
              expect(timestampElement).not.toBeNull();
              // Timestamp should not be empty
              expect(timestampElement.textContent?.length).toBeGreaterThan(0);
            }
          }

          // Cleanup for next iteration
          unmount();
        }),
        { numRuns: 100 }
      );
    });
  });
});
