import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ClassNode as ClassNodeType } from '../../types';

/**
 * Custom React Flow node component for rendering UML class diagrams.
 * Displays class name, attributes, and operations in standard UML notation.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
function ClassNodeComponent({ data }: NodeProps<ClassNodeType>) {
  const { name, attributes, operations } = data;

  return (
    <div className="min-w-[180px] bg-white border-2 border-gray-800 rounded shadow-md text-gray-900">
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      
      {/* Class name header section (Requirement 8.1) */}
      <div className="px-3 py-2 text-center font-bold bg-gray-100 border-b-2 border-gray-800">
        {name}
      </div>
      
      {/* Attributes section with visibility markers (Requirements 8.2, 8.4, 8.5) */}
      <div className="px-3 py-2 border-b-2 border-gray-800 min-h-[24px]">
        {attributes.length > 0 ? (
          <ul className="list-none m-0 p-0 text-sm font-mono">
            {attributes.map((attr, index) => (
              <li key={index} className="whitespace-nowrap">
                {attr}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-400 text-sm italic">No attributes</span>
        )}
      </div>
      
      {/* Operations section with visibility markers (Requirements 8.3, 8.4, 8.5) */}
      <div className="px-3 py-2 min-h-[24px]">
        {operations.length > 0 ? (
          <ul className="list-none m-0 p-0 text-sm font-mono">
            {operations.map((op, index) => (
              <li key={index} className="whitespace-nowrap">
                {op}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-400 text-sm italic">No operations</span>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const ClassNode = memo(ClassNodeComponent);

// Export node type for React Flow registration
export const classNodeTypes = {
  classNode: ClassNode,
};
