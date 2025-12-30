import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import { ReactFlowProvider, Position } from '@xyflow/react';
import { RelationshipEdge, getMarkerIdForType, RelationshipMarkerDefs } from './RelationshipEdge';
import type { RelationshipEdgeData, RelationshipType } from '../../types';

// Mock EdgeLabelRenderer to render inline instead of to a portal
// This allows us to test label rendering without React Flow's portal system
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// ============================================
// Generators for Property-Based Testing
// ============================================

const relationshipTypeGen: fc.Arbitrary<RelationshipType> = fc.constantFrom(
  'association',
  'inheritance',
  'composition',
  'aggregation'
);

const labelGen = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_ ]{0,19}$/);

const relationshipEdgeDataGen: fc.Arbitrary<RelationshipEdgeData> = fc.record({
  type: relationshipTypeGen,
  label: fc.option(labelGen, { nil: undefined }),
});

// ============================================
// Helper to render RelationshipEdge directly with required props
// ============================================

function renderRelationshipEdge(data: RelationshipEdgeData, edgeId: string = 'test-edge') {
  const edgeProps = {
    id: edgeId,
    source: 'source-node',
    target: 'target-node',
    sourceX: 0,
    sourceY: 0,
    targetX: 200,
    targetY: 200,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    data,
    selected: false,
    animated: false,
    interactionWidth: 20,
  };

  return render(
    <ReactFlowProvider>
      <svg>
        <RelationshipMarkerDefs />
        <RelationshipEdge {...edgeProps} />
      </svg>
    </ReactFlowProvider>
  );
}

// ============================================
// Property Tests
// ============================================

describe('RelationshipEdge Component', () => {
  /**
   * Feature: uml-diagram-generator, Property 10: Relationship Edge Label Display
   * *For any* relationship with a label, the rendered Relationship_Edge SHALL display that label.
   * **Validates: Requirements 3.6, 9.5**
   * 
   * Note: EdgeLabelRenderer uses a portal which requires special handling in tests.
   * We test the label rendering by checking the DOM after render.
   */
  describe('Property 10: Relationship Edge Label Display', () => {
    it('should display the label for any relationship edge that has a label', () => {
      fc.assert(
        fc.property(
          relationshipEdgeDataGen.filter((data) => data.label !== undefined && data.label.length > 0),
          (data) => {
            const edgeId = `edge-${Math.random().toString(36).substring(7)}`;
            const { unmount, container } = renderRelationshipEdge(data, edgeId);

            // Property: Label is displayed when present (Requirements 3.6, 9.5)
            // EdgeLabelRenderer renders to a portal, so we search by data-testid
            const labelElement = container.querySelector(`[data-testid="edge-label-${edgeId}"]`);
            expect(labelElement).not.toBeNull();
            expect(labelElement?.textContent).toBe(data.label);

            // Cleanup for next iteration
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not display a label element when label is undefined', () => {
      fc.assert(
        fc.property(
          relationshipTypeGen,
          (type) => {
            const data: RelationshipEdgeData = { type, label: undefined };
            const edgeId = `edge-${Math.random().toString(36).substring(7)}`;
            const { unmount, container } = renderRelationshipEdge(data, edgeId);

            // Property: No label element when label is undefined
            const labelElement = container.querySelector(`[data-testid="edge-label-${edgeId}"]`);
            expect(labelElement).toBeNull();

            // Cleanup for next iteration
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional test: Verify marker IDs are correctly mapped for each relationship type
   */
  describe('Marker ID Mapping', () => {
    it('should return correct marker ID for each relationship type', () => {
      fc.assert(
        fc.property(relationshipTypeGen, (type) => {
          const markerId = getMarkerIdForType(type);
          
          // Property: Marker ID follows the pattern "{type}-marker"
          expect(markerId).toBe(`${type}-marker`);
        }),
        { numRuns: 100 }
      );
    });
  });
});
