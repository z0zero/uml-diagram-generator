import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateLayout, DEFAULT_LAYOUT_CONFIG, getNodeSpacing } from './layoutEngine';
import type { ClassNode, RelationshipEdge, RelationshipType } from '../types';

// ============================================
// Generators for Property-Based Testing
// ============================================

const identifier = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{0,19}$/);

const classNodeDataGen = fc.record({
  name: identifier.map((name) => name.charAt(0).toUpperCase() + name.slice(1)),
  attributes: fc.array(fc.string(), { minLength: 0, maxLength: 3 }),
  operations: fc.array(fc.string(), { minLength: 0, maxLength: 3 }),
});

// Generate a class node with a unique ID
const classNodeGen = (index: number): fc.Arbitrary<ClassNode> =>
  classNodeDataGen.map((data) => ({
    id: `node_${index}`,
    type: 'classNode' as const,
    position: { x: 0, y: 0 },
    data,
  }));

// Generate an array of class nodes with unique IDs
const classNodesGen: fc.Arbitrary<ClassNode[]> = fc
  .integer({ min: 2, max: 6 })
  .chain((count) =>
    fc.tuple(...Array.from({ length: count }, (_, i) => classNodeGen(i)))
  );

const relationshipTypeGen: fc.Arbitrary<RelationshipType> = fc.constantFrom(
  'association',
  'inheritance',
  'composition',
  'aggregation'
);

// Generate edges between existing nodes
const edgesForNodesGen = (nodes: ClassNode[]): fc.Arbitrary<RelationshipEdge[]> => {
  if (nodes.length < 2) {
    return fc.constant([]);
  }

  const nodeIds = nodes.map((n) => n.id);

  const edgeGen: fc.Arbitrary<RelationshipEdge> = fc
    .tuple(
      fc.constantFrom(...nodeIds),
      fc.constantFrom(...nodeIds),
      relationshipTypeGen,
      fc.option(identifier, { nil: undefined }),
      fc.integer({ min: 0, max: 1000 }) // For unique edge IDs
    )
    .filter(([source, target]) => source !== target) // No self-loops
    .map(([source, target, type, label, idx]) => ({
      id: `edge_${idx}_${source}_${target}`,
      source,
      target,
      type: 'relationshipEdge' as const,
      data: { type, label },
    }));

  return fc.array(edgeGen, { minLength: 1, maxLength: nodes.length });
};

// Generate a complete diagram with nodes and edges
const diagramGen: fc.Arbitrary<{ nodes: ClassNode[]; edges: RelationshipEdge[] }> =
  classNodesGen.chain((nodes) =>
    edgesForNodesGen(nodes).map((edges) => ({ nodes, edges }))
  );

// ============================================
// Property Tests
// ============================================

describe('Layout Engine', () => {
  /**
   * Feature: uml-diagram-generator, Property 13: Layout Engine Consistent Spacing
   * *For any* set of nodes processed by the Layout_Engine, adjacent nodes SHALL have
   * consistent spacing (within tolerance).
   * **Validates: Requirements 7.3**
   */
  describe('Property 13: Layout Engine Consistent Spacing', () => {
    it('should maintain consistent spacing between adjacent nodes in the same rank', () => {
      fc.assert(
        fc.property(diagramGen, ({ nodes, edges }) => {
          // Apply layout
          const layoutedNodes = calculateLayout(nodes, edges, DEFAULT_LAYOUT_CONFIG);

          // Property: All nodes should have positions set
          expect(layoutedNodes.length).toBe(nodes.length);
          for (const node of layoutedNodes) {
            expect(typeof node.position.x).toBe('number');
            expect(typeof node.position.y).toBe('number');
            expect(Number.isFinite(node.position.x)).toBe(true);
            expect(Number.isFinite(node.position.y)).toBe(true);
          }

          // Group nodes by their Y position (same rank) with tolerance
          const tolerance = 1; // Allow 1px tolerance for floating point
          const rankGroups = new Map<number, ClassNode[]>();

          for (const node of layoutedNodes) {
            const roundedY = Math.round(node.position.y / tolerance) * tolerance;
            const existing = rankGroups.get(roundedY);
            if (existing) {
              existing.push(node);
            } else {
              rankGroups.set(roundedY, [node]);
            }
          }

          // For nodes in the same rank, check horizontal spacing consistency
          for (const [, nodesInRank] of rankGroups) {
            if (nodesInRank.length < 2) continue;

            // Sort by X position
            const sorted = [...nodesInRank].sort((a, b) => a.position.x - b.position.x);

            // Calculate spacings between consecutive nodes
            const spacings: number[] = [];
            for (let i = 0; i < sorted.length - 1; i++) {
              const spacing = getNodeSpacing(sorted[i], sorted[i + 1], DEFAULT_LAYOUT_CONFIG);
              spacings.push(spacing.horizontal);
            }

            // Property: All spacings should be approximately equal (within tolerance)
            if (spacings.length > 1) {
              const spacingTolerance = 5; // Allow 5px tolerance
              const firstSpacing = spacings[0];
              for (const spacing of spacings) {
                expect(Math.abs(spacing - firstSpacing)).toBeLessThanOrEqual(spacingTolerance);
              }
            }
          }

          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain minimum spacing between all nodes (no overlaps)', () => {
      fc.assert(
        fc.property(diagramGen, ({ nodes, edges }) => {
          // Apply layout
          const layoutedNodes = calculateLayout(nodes, edges, DEFAULT_LAYOUT_CONFIG);

          // Property: No two nodes should overlap
          for (let i = 0; i < layoutedNodes.length; i++) {
            for (let j = i + 1; j < layoutedNodes.length; j++) {
              const node1 = layoutedNodes[i];
              const node2 = layoutedNodes[j];

              // Check if nodes overlap
              const node1Right = node1.position.x + DEFAULT_LAYOUT_CONFIG.nodeWidth;
              const node1Bottom = node1.position.y + DEFAULT_LAYOUT_CONFIG.nodeHeight;
              const node2Right = node2.position.x + DEFAULT_LAYOUT_CONFIG.nodeWidth;
              const node2Bottom = node2.position.y + DEFAULT_LAYOUT_CONFIG.nodeHeight;

              const horizontalOverlap =
                node1.position.x < node2Right && node2.position.x < node1Right;
              const verticalOverlap =
                node1.position.y < node2Bottom && node2.position.y < node1Bottom;

              // Nodes should not overlap in both dimensions
              expect(horizontalOverlap && verticalOverlap).toBe(false);
            }
          }

          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});
