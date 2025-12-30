import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { ClassNode } from './ClassNode';
import type { ClassNodeData } from '../../types';

// ============================================
// Generators for Property-Based Testing
// ============================================

const visibilityMarker = fc.constantFrom('+', '-', '#', '~');
const identifier = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{0,19}$/);
const typeName = fc.constantFrom('int', 'string', 'boolean', 'void', 'Date', 'number');

const attributeGen = fc.tuple(visibilityMarker, identifier, typeName).map(
  ([vis, name, type]) => `${vis} ${name}: ${type}`
);

const operationGen = fc.tuple(visibilityMarker, identifier).map(
  ([vis, name]) => `${vis} ${name}()`
);

const classNodeDataGen: fc.Arbitrary<ClassNodeData> = fc.record({
  name: identifier.map((name) => name.charAt(0).toUpperCase() + name.slice(1)),
  attributes: fc.array(attributeGen, { minLength: 0, maxLength: 5 }),
  operations: fc.array(operationGen, { minLength: 0, maxLength: 5 }),
});

// ============================================
// Helper to render ClassNode with required props
// ============================================

function renderClassNode(data: ClassNodeData) {
  const nodeProps = {
    id: 'test-node',
    data,
    type: 'classNode' as const,
    selected: false,
    isConnectable: true,
    zIndex: 0,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    dragging: false,
    draggable: true,
    deletable: true,
    selectable: true,
    parentId: undefined,
    sourcePosition: undefined,
    targetPosition: undefined,
    dragHandle: undefined,
    width: undefined,
    height: undefined,
  };

  return render(
    <ReactFlowProvider>
      <ClassNode {...nodeProps} />
    </ReactFlowProvider>
  );
}

// ============================================
// Property Tests
// ============================================

describe('ClassNode Component', () => {
  /**
   * Feature: uml-diagram-generator, Property 9: Class Node Data Preservation
   * *For any* ClassNodeData, the rendered Class_Node SHALL display the class name,
   * all attributes with visibility markers, and all operations with visibility markers.
   * **Validates: Requirements 8.1, 8.2, 8.3, 8.5**
   */
  describe('Property 9: Class Node Data Preservation', () => {
    it('should display class name, all attributes, and all operations for any valid ClassNodeData', () => {
      fc.assert(
        fc.property(classNodeDataGen, (data) => {
          const { unmount } = renderClassNode(data);

          // Property: Class name is displayed (Requirement 8.1)
          const nameElement = screen.getByText(data.name);
          expect(nameElement).toBeDefined();
          expect(nameElement).not.toBeNull();

          // Property: All attributes are displayed with visibility markers (Requirements 8.2, 8.5)
          for (const attr of data.attributes) {
            const attrElement = screen.getByText(attr);
            expect(attrElement).toBeDefined();
            expect(attrElement).not.toBeNull();
          }

          // Property: All operations are displayed with visibility markers (Requirements 8.3, 8.5)
          for (const op of data.operations) {
            const opElement = screen.getByText(op);
            expect(opElement).toBeDefined();
            expect(opElement).not.toBeNull();
          }

          // Cleanup for next iteration
          unmount();
        }),
        { numRuns: 100 }
      );
    });
  });
});
