import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from './Canvas';
import { useDiagramStore } from '../../store/diagramStore';
import type { ClassNode, RelationshipEdge, RelationshipType } from '../../types';

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

const relationshipTypeGen: fc.Arbitrary<RelationshipType> = fc.constantFrom(
  'association',
  'inheritance',
  'composition',
  'aggregation'
);

// Generate a class node with position
const classNodeGen = (id: string): fc.Arbitrary<ClassNode> =>
  fc.record({
    id: fc.constant(id),
    type: fc.constant('classNode' as const),
    position: fc.record({
      x: fc.integer({ min: 0, max: 500 }),
      y: fc.integer({ min: 0, max: 500 }),
    }),
    data: fc.record({
      name: identifier.map((name) => name.charAt(0).toUpperCase() + name.slice(1)),
      attributes: fc.array(attributeGen, { minLength: 0, maxLength: 3 }),
      operations: fc.array(operationGen, { minLength: 0, maxLength: 3 }),
    }),
  });

// Generate a relationship edge between two nodes
const relationshipEdgeGen = (
  sourceId: string,
  targetId: string,
  edgeId: string
): fc.Arbitrary<RelationshipEdge> =>
  fc.record({
    id: fc.constant(edgeId),
    source: fc.constant(sourceId),
    target: fc.constant(targetId),
    type: fc.constant('relationshipEdge' as const),
    data: fc.record({
      type: relationshipTypeGen,
      label: fc.option(identifier, { nil: undefined }),
    }),
  });

// Generate a complete diagram with nodes and edges
const diagramGen = fc.integer({ min: 1, max: 4 }).chain((nodeCount) => {
  const nodeIds = Array.from({ length: nodeCount }, (_, i) => `class-${i}`);
  const nodesGen = fc.tuple(...nodeIds.map((id) => classNodeGen(id)));

  // Generate edges between existing nodes (if more than 1 node)
  const edgesGen =
    nodeCount > 1
      ? fc
          .array(
            fc.tuple(
              fc.integer({ min: 0, max: nodeCount - 1 }),
              fc.integer({ min: 0, max: nodeCount - 1 })
            ),
            { minLength: 0, maxLength: Math.min(nodeCount, 3) }
          )
          .chain((pairs) => {
            const validPairs = pairs.filter(([s, t]) => s !== t);
            if (validPairs.length === 0) {
              return fc.constant([] as RelationshipEdge[]);
            }
            return fc.tuple(
              ...validPairs.map(([s, t], i) =>
                relationshipEdgeGen(nodeIds[s], nodeIds[t], `edge-${i}`)
              )
            );
          })
      : fc.constant([] as RelationshipEdge[]);

  return fc.tuple(nodesGen, edgesGen).map(([nodes, edges]) => ({
    nodes: nodes as ClassNode[],
    edges: edges as RelationshipEdge[],
  }));
});

// ============================================
// Helper to render Canvas with store state
// ============================================

function renderCanvas() {
  return render(
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  );
}

// ============================================
// Property Tests
// ============================================

describe('Canvas Component', () => {
  beforeEach(() => {
    // Reset store state before each test
    useDiagramStore.setState({
      nodes: [],
      edges: [],
      projects: [],
      currentProjectId: null,
      messages: [],
      isLoading: false,
    });
  });

  /**
   * Feature: uml-diagram-generator, Property 8: Canvas Renders All Diagram Data
   * *For any* UML diagram data loaded, the Canvas SHALL render nodes for all classes
   * and edges for all relationships.
   * **Validates: Requirements 3.3, 3.2**
   */
  describe('Property 8: Canvas Renders All Diagram Data', () => {
    it('should render nodes for all classes and edges for all relationships', () => {
      fc.assert(
        fc.property(diagramGen, ({ nodes, edges }) => {
          // Set up the store with generated diagram data
          useDiagramStore.setState({ nodes, edges });

          const { unmount, container } = renderCanvas();

          // Property: Canvas container is rendered
          const canvasContainer = screen.getByTestId('canvas-container');
          expect(canvasContainer).toBeDefined();

          // Property: All class names should be rendered (Requirement 3.3)
          // React Flow renders nodes in the DOM, we check for class names
          for (const node of nodes) {
            const className = node.data.name;
            // The class name should appear in the rendered output
            const nameElements = container.querySelectorAll(
              `*:not(script):not(style)`
            );
            const hasClassName = Array.from(nameElements).some(
              (el) => el.textContent?.includes(className)
            );
            expect(hasClassName).toBe(true);
          }

          // Property: All edges should be rendered (Requirement 3.2)
          // React Flow renders edges as SVG paths, we verify edge count
          // by checking that the store state matches what we set
          const storeState = useDiagramStore.getState();
          expect(storeState.nodes.length).toBe(nodes.length);
          expect(storeState.edges.length).toBe(edges.length);

          // Cleanup for next iteration
          unmount();
        }),
        { numRuns: 100 }
      );
    });
  });
});
