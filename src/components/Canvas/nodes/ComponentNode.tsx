import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ComponentNodeData } from '../../../types';
import { Package } from 'lucide-react';

/**
 * Component node for Component diagrams
 * Renders a box with component stereotype and interfaces
 */
export const ComponentNode = memo(function ComponentNode({ data }: NodeProps<ComponentNodeData>) {
    const { name, stereotype, interfaces = [] } = data;

    const providedInterfaces = interfaces.filter(i => i.type === 'provided');
    const requiredInterfaces = interfaces.filter(i => i.type === 'required');

    return (
        <div className="relative" data-testid="component-node">
            {/* Main Component Box */}
            <div className="min-w-[140px] bg-slate-800/80 border border-indigo-500/50 rounded-lg backdrop-blur-sm overflow-hidden">
                {/* Component Icon and Stereotype */}
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-700/50">
                    <Package className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] text-slate-400">
                        «{stereotype || 'component'}»
                    </span>
                </div>

                {/* Component Name */}
                <div className="px-4 py-2 text-sm font-semibold text-slate-200 text-center">
                    {name}
                </div>

                {/* Interfaces List (if any) */}
                {interfaces.length > 0 && (
                    <div className="px-3 py-2 border-t border-slate-700/50">
                        {interfaces.map((iface, idx) => (
                            <div key={idx} className="flex items-center gap-1 text-xs text-slate-400">
                                <span className={iface.type === 'provided' ? 'text-green-400' : 'text-amber-400'}>
                                    {iface.type === 'provided' ? '○─' : '──○'}
                                </span>
                                <span>{iface.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Provided Interface Lollipops (circles on lines) */}
            {providedInterfaces.length > 0 && (
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                    {providedInterfaces.map((_, idx) => (
                        <div key={idx} className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <div className="w-2 h-px bg-green-400" />
                        </div>
                    ))}
                </div>
            )}

            {/* Required Interface Sockets (half circles) */}
            {requiredInterfaces.length > 0 && (
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                    {requiredInterfaces.map((_, idx) => (
                        <div key={idx} className="flex items-center">
                            <div className="w-2 h-px bg-amber-400" />
                            <div className="w-2 h-2 rounded-full border border-amber-400 bg-transparent" />
                        </div>
                    ))}
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
