import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import type { RelationshipEdgeData, RelationshipType } from '../../types';

/**
 * SVG marker definitions for different UML relationship types.
 * Styled for Dark Mode compatibility.
 */
export const RelationshipMarkerDefs = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <defs>
      {/* Association: Open arrow */}
      <marker
        id="association-marker"
        viewBox="0 0 10 10"
        refX="10"
        refY="5"
        markerWidth="8"
        markerHeight="8"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      </marker>

      {/* Inheritance: Hollow triangle */}
      <marker
        id="inheritance-marker"
        viewBox="0 0 10 10"
        refX="10"
        refY="5"
        markerWidth="10"
        markerHeight="10"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 Z" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" />
      </marker>

      {/* Composition: Filled diamond */}
      <marker
        id="composition-marker"
        viewBox="0 0 12 12"
        refX="12"
        refY="6"
        markerWidth="10"
        markerHeight="10"
        orient="auto-start-reverse"
      >
        <path d="M 0 6 L 6 0 L 12 6 L 6 12 Z" fill="#94a3b8" stroke="#94a3b8" strokeWidth="1" />
      </marker>

      {/* Aggregation: Hollow diamond */}
      <marker
        id="aggregation-marker"
        viewBox="0 0 12 12"
        refX="12"
        refY="6"
        markerWidth="10"
        markerHeight="10"
        orient="auto-start-reverse"
      >
        <path d="M 0 6 L 6 0 L 12 6 L 6 12 Z" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" />
      </marker>
    </defs>
  </svg>
);

/**
 * Get the marker ID for a given relationship type
 */
export function getMarkerIdForType(type: RelationshipType): string {
  const markerMap: Record<RelationshipType, string> = {
    association: 'association-marker',
    inheritance: 'inheritance-marker',
    composition: 'composition-marker',
    aggregation: 'aggregation-marker',
  };
  return markerMap[type];
}

/**
 * Custom React Flow edge component for rendering UML relationships.
 */
function RelationshipEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
  selected,
}: EdgeProps) {
  const edgeData = data as RelationshipEdgeData | undefined;
  const relationshipType = edgeData?.type ?? 'association';
  const label = edgeData?.label;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const markerId = getMarkerIdForType(relationshipType);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: selected ? '#818cf8' : '#64748b', // indigo-400 : slate-500
          strokeWidth: selected ? 2 : 1.5,
          opacity: 0.8,
          transition: 'all 0.3s ease',
        }}
        markerEnd={`url(#${markerId})`}
      />
      {/* Relationship label display */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="px-2 py-0.5 bg-slate-900 border border-slate-600 rounded-full text-[10px] text-slate-300 shadow-sm backdrop-blur-md"
            data-testid={`edge-label-${id}`}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export const RelationshipEdge = memo(RelationshipEdgeComponent);

// Export edge type for React Flow registration
export const relationshipEdgeTypes = {
  relationshipEdge: RelationshipEdge,
};
