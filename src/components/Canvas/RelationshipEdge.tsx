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
 * These are defined once and referenced by marker-end attributes.
 */
export const RelationshipMarkerDefs = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <defs>
      {/* Association: Open arrow (Requirements 9.1) */}
      <marker
        id="association-marker"
        viewBox="0 0 10 10"
        refX="10"
        refY="5"
        markerWidth="8"
        markerHeight="8"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="#374151" strokeWidth="1.5" />
      </marker>

      {/* Inheritance: Hollow triangle (Requirements 9.2) */}
      <marker
        id="inheritance-marker"
        viewBox="0 0 10 10"
        refX="10"
        refY="5"
        markerWidth="10"
        markerHeight="10"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 Z" fill="white" stroke="#374151" strokeWidth="1.5" />
      </marker>

      {/* Composition: Filled diamond (Requirements 9.3) */}
      <marker
        id="composition-marker"
        viewBox="0 0 12 12"
        refX="12"
        refY="6"
        markerWidth="10"
        markerHeight="10"
        orient="auto-start-reverse"
      >
        <path d="M 0 6 L 6 0 L 12 6 L 6 12 Z" fill="#374151" stroke="#374151" strokeWidth="1" />
      </marker>

      {/* Aggregation: Hollow diamond (Requirements 9.4) */}
      <marker
        id="aggregation-marker"
        viewBox="0 0 12 12"
        refX="12"
        refY="6"
        markerWidth="10"
        markerHeight="10"
        orient="auto-start-reverse"
      >
        <path d="M 0 6 L 6 0 L 12 6 L 6 12 Z" fill="white" stroke="#374151" strokeWidth="1.5" />
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
 * Displays different markers based on relationship type and shows labels.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
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
          stroke: '#374151',
          strokeWidth: 1.5,
        }}
        markerEnd={`url(#${markerId})`}
      />
      {/* Relationship label display (Requirement 9.5) */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 shadow-sm"
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
