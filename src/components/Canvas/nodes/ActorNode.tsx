import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ActorNodeData } from '../../../types';

/**
 * Actor node component for Use Case diagrams
 * Renders a stick figure representing an actor
 */
export const ActorNode = memo(function ActorNode({ data }: NodeProps<ActorNodeData>) {
    return (
        <div className="flex flex-col items-center" data-testid="actor-node">
            {/* Stick Figure SVG */}
            <svg width="40" height="60" viewBox="0 0 40 60" className="text-slate-300">
                {/* Head */}
                <circle cx="20" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                {/* Body */}
                <line x1="20" y1="18" x2="20" y2="38" stroke="currentColor" strokeWidth="2" />
                {/* Arms */}
                <line x1="5" y1="28" x2="35" y2="28" stroke="currentColor" strokeWidth="2" />
                {/* Left Leg */}
                <line x1="20" y1="38" x2="8" y2="55" stroke="currentColor" strokeWidth="2" />
                {/* Right Leg */}
                <line x1="20" y1="38" x2="32" y2="55" stroke="currentColor" strokeWidth="2" />
            </svg>

            {/* Actor Name */}
            <div className="mt-1 text-xs font-medium text-slate-200 text-center max-w-[80px] truncate">
                {data.name}
            </div>

            {/* Connection Handles */}
            <Handle
                type="source"
                position={Position.Right}
                className="!bg-indigo-500 !w-2 !h-2 !border-0"
            />
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-indigo-500 !w-2 !h-2 !border-0"
            />
        </div>
    );
});
