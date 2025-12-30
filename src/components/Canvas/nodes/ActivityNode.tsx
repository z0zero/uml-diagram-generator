import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ActivityNodeData } from '../../../types';

/**
 * Activity node component for Activity diagrams
 * Renders different shapes based on node type
 */
export const ActivityNode = memo(function ActivityNode({ data }: NodeProps<ActivityNodeData>) {
    const { nodeType, label } = data;

    // Initial node - filled circle
    if (nodeType === 'initial') {
        return (
            <div className="flex items-center justify-center" data-testid="activity-initial">
                <div className="w-6 h-6 rounded-full bg-slate-300" />
                <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-2 !h-2 !border-0" />
            </div>
        );
    }

    // Final node - circle with inner filled circle
    if (nodeType === 'final') {
        return (
            <div className="flex items-center justify-center" data-testid="activity-final">
                <div className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-slate-300" />
                </div>
                <Handle type="target" position={Position.Top} className="!bg-indigo-500 !w-2 !h-2 !border-0" />
            </div>
        );
    }

    // Flow Final - X in a circle
    if (nodeType === 'flowFinal') {
        return (
            <div className="flex items-center justify-center" data-testid="activity-flow-final">
                <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-slate-300 text-xs font-bold">
                    ✕
                </div>
                <Handle type="target" position={Position.Top} className="!bg-indigo-500 !w-2 !h-2 !border-0" />
            </div>
        );
    }

    // Decision/Merge node - diamond shape
    if (nodeType === 'decision' || nodeType === 'merge') {
        return (
            <div className="relative w-10 h-10" data-testid={`activity-${nodeType}`}>
                <svg viewBox="0 0 40 40" className="w-full h-full">
                    <polygon
                        points="20,0 40,20 20,40 0,20"
                        fill="rgba(99, 102, 241, 0.1)"
                        stroke="rgb(99, 102, 241)"
                        strokeWidth="2"
                    />
                </svg>
                <Handle type="target" position={Position.Top} className="!bg-indigo-500 !w-2 !h-2 !border-0 !top-0" />
                <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-2 !h-2 !border-0 !bottom-0" />
                <Handle type="source" position={Position.Left} id="left" className="!bg-indigo-500 !w-2 !h-2 !border-0" />
                <Handle type="source" position={Position.Right} id="right" className="!bg-indigo-500 !w-2 !h-2 !border-0" />
            </div>
        );
    }

    // Fork/Join node - horizontal bar
    if (nodeType === 'fork' || nodeType === 'join') {
        return (
            <div className="w-32 h-2 bg-slate-400 rounded-sm" data-testid={`activity-${nodeType}`}>
                <Handle type="target" position={Position.Top} className="!bg-indigo-500 !w-2 !h-2 !border-0" />
                <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-2 !h-2 !border-0" />
                <Handle type="source" position={Position.Bottom} id="left" className="!bg-indigo-500 !w-2 !h-2 !border-0 !left-4" />
                <Handle type="source" position={Position.Bottom} id="right" className="!bg-indigo-500 !w-2 !h-2 !border-0 !right-4" />
            </div>
        );
    }

    // Action node - rounded rectangle (default)
    return (
        <div
            className="px-4 py-2 min-w-[100px] bg-slate-800/80 border border-indigo-500/50 rounded-lg backdrop-blur-sm"
            data-testid="activity-action"
        >
            <div className="text-sm font-medium text-slate-200 text-center">
                {label}
            </div>
            <Handle type="target" position={Position.Top} className="!bg-indigo-500 !w-2 !h-2 !border-0" />
            <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-2 !h-2 !border-0" />
            <Handle type="target" position={Position.Left} id="left" className="!bg-indigo-500 !w-2 !h-2 !border-0" />
            <Handle type="source" position={Position.Right} id="right" className="!bg-indigo-500 !w-2 !h-2 !border-0" />
        </div>
    );
});
