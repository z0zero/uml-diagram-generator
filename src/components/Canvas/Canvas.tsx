import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useDiagramStore } from '../../store/diagramStore';
import { ClassNode } from './ClassNode';
import { RelationshipEdge, RelationshipMarkerDefs } from './RelationshipEdge';

/**
 * Custom node types for React Flow
 * Maps 'classNode' type to our ClassNode component
 */
const nodeTypes = {
  classNode: ClassNode,
};

/**
 * Custom edge types for React Flow
 * Maps 'relationshipEdge' type to our RelationshipEdge component
 */
const edgeTypes = {
  relationshipEdge: RelationshipEdge,
};

/**
 * Canvas component for rendering UML diagrams using React Flow.
 * Provides pan, zoom, and displays class nodes with relationship edges.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */
export function Canvas() {
  // Get state and actions from Zustand store
  const nodes = useDiagramStore((state) => state.nodes);
  const edges = useDiagramStore((state) => state.edges);
  const setNodes = useDiagramStore((state) => state.setNodes);
  const setEdges = useDiagramStore((state) => state.setEdges);

  // Handle node changes (position updates, selection, etc.)
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      setNodes(updatedNodes as typeof nodes);
    },
    [nodes, setNodes]
  );

  // Handle edge changes (selection, removal, etc.)
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      setEdges(updatedEdges as typeof edges);
    },
    [edges, setEdges]
  );

  // Memoize default edge options
  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'relationshipEdge',
    }),
    []
  );

  return (
    <div className="flex-1 h-full relative" data-testid="canvas-container">
      {/* SVG marker definitions for relationship edges */}
      <RelationshipMarkerDefs />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        attributionPosition="bottom-left"
      >
        {/* Pan and zoom controls (Requirement 3.4) */}
        <Controls />
        
        {/* Background grid for visual reference */}
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}

export default Canvas;
