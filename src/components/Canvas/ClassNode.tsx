import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ClassNode as ClassNodeType } from '../../types';

/**
 * Custom React Flow node component for rendering UML class diagrams.
 * Design: Modern Card with Gradient Header and Glassmorphic body.
 */
function ClassNodeComponent({ data }: NodeProps<ClassNodeType>) {
  const { name, attributes, operations } = data;

  return (
    <div className="min-w-[200px] bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)] group">
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-indigo-500 border-2 border-slate-900 transition-all group-hover:w-4 group-hover:h-4" />

      {/* Class name header section */}
      <div className="px-4 py-3 text-center font-bold bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/50 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />
        <span className="bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent group-hover:from-indigo-200 group-hover:to-violet-200 transition-colors">
          {name}
        </span>
      </div>

      {/* Attributes section */}
      <div className="px-4 py-3 border-b border-slate-700/30 min-h-[30px] bg-white/[0.02]">
        {attributes.length > 0 ? (
          <ul className="list-none m-0 p-0 text-xs font-mono text-slate-300 space-y-1.5">
            {attributes.map((attr, index) => (
              <li key={index} className="flex items-center gap-2 transition-colors hover:text-indigo-300">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 shrink-0" />
                <span className="truncate">{attr}</span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-slate-600 text-xs italic opacity-50">No attributes</span>
        )}
      </div>

      {/* Operations section */}
      <div className="px-4 py-3 min-h-[30px] bg-white/[0.02]">
        {operations.length > 0 ? (
          <ul className="list-none m-0 p-0 text-xs font-mono text-slate-300 space-y-1.5">
            {operations.map((op, index) => (
              <li key={index} className="flex items-center gap-2 transition-colors hover:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 shrink-0" />
                <span className="truncate">{op}</span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-slate-600 text-xs italic opacity-50">No operations</span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-violet-500 border-2 border-slate-900 transition-all group-hover:w-4 group-hover:h-4" />
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const ClassNode = memo(ClassNodeComponent);

// Export node type for React Flow registration
export const classNodeTypes = {
  classNode: ClassNode,
};
