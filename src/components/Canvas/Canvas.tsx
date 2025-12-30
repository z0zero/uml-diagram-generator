import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useDiagramStore } from '../../store/diagramStore';
import { ClassNode } from './ClassNode';
import { RelationshipEdge, RelationshipMarkerDefs } from './RelationshipEdge';

const nodeTypes = {
  classNode: ClassNode,
};

const edgeTypes = {
  relationshipEdge: RelationshipEdge,
};

/**
 * Canvas component for rendering UML diagrams using React Flow.
 * Redesigned with Dark Mode, Minimap, and Custom Controls.
 */
export function Canvas() {
  const nodes = useDiagramStore((state) => state.nodes);
  const edges = useDiagramStore((state) => state.edges);
  const setNodes = useDiagramStore((state) => state.setNodes);
  const setEdges = useDiagramStore((state) => state.setEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      setNodes(updatedNodes as typeof nodes);
    },
    [nodes, setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      setEdges(updatedEdges as typeof edges);
    },
    [edges, setEdges]
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'relationshipEdge',
      animated: true,
    }),
    []
  );

  return (
    <div className="flex-1 h-full relative overflow-hidden" data-testid="canvas-container">
      {/* SVG marker definitions */}
      <RelationshipMarkerDefs />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        colorMode="dark"
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        attributionPosition="bottom-right"
        className="bg-transparent"
      >
        <Controls className="!bg-slate-800/80 !border-slate-700 !text-slate-200 !fill-slate-200 [&>button]:!border-slate-700 hover:[&>button]:!bg-slate-700 overflow-hidden rounded-lg shadow-lg backdrop-blur-md" />

        <MiniMap
          className="!bg-slate-900/80 !border-slate-700 rounded-lg shadow-lg overflow-hidden"
          nodeColor="#6366f1"
          maskColor="rgba(15, 23, 42, 0.6)"
        />

        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(148, 163, 184, 0.2)"
        />
      </ReactFlow>
    </div>
  );
}

export default Canvas;
