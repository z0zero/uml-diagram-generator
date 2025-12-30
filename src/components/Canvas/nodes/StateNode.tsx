import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface StateNodeProps {
    data: {
        name: string;
        isInitial?: boolean;
        isFinal?: boolean;
        entryAction?: string;
        exitAction?: string;
    };
}

/**
 * State node component for State Machine diagrams
 * Renders different shapes based on state type
 */
export const StateNode = memo(function StateNode({ data }: StateNodeProps) {
    const { name, isInitial, isFinal, entryAction, exitAction } = data;

    // Initial state - filled circle
    if (isInitial) {
        return (
            <div className="flex items-center justify-center" data-testid="state-initial">
                <div className="w-6 h-6 rounded-full bg-slate-300" />
                <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2 !h-2 !border-0" />
                <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-indigo-500 !w-2 !h-2 !border-0" />
            </div>
        );
    }

    // Final state - circle with inner filled circle
    if (isFinal) {
        return (
            <div className="flex items-center justify-center" data-testid="state-final">
                <div className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-slate-300" />
                </div>
                <Handle type="target" position={Position.Left} className="!bg-indigo-500 !w-2 !h-2 !border-0" />
                <Handle type="target" position={Position.Top} id="top" className="!bg-indigo-500 !w-2 !h-2 !border-0" />
            </div>
        );
    }

    // Regular state - rounded rectangle with compartments
    return (
        <div
            className="min-w-[120px] bg-slate-800/80 border border-indigo-500/50 rounded-xl backdrop-blur-sm overflow-hidden"
            data-testid="state-node"
        >
            {/* State Name */}
            <div className="px-4 py-2 text-sm font-semibold text-slate-200 text-center border-b border-slate-700/50">
                {name}
            </div>

            {/* Entry/Exit Actions (if present) */}
            {(entryAction || exitAction) && (
                <div className="px-3 py-2 text-xs text-slate-400">
                    {entryAction && (
                        <div className="truncate">
                            <span className="text-indigo-400">entry/</span> {entryAction}
                        </div>
                    )}
                    {exitAction && (
                        <div className="truncate">
                            <span className="text-indigo-400">exit/</span> {exitAction}
                        </div>
                    )}
                </div>
            )}

            {/* Connection Handles */}
            <Handle type="target" position={Position.Left} className="!bg-indigo-500 !w-2 !h-2 !border-0" />
            <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2 !h-2 !border-0" />
            <Handle type="target" position={Position.Top} id="top" className="!bg-indigo-500 !w-2 !h-2 !border-0" />
            <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-indigo-500 !w-2 !h-2 !border-0" />
        </div>
    );
});
