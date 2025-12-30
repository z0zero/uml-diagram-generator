import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface UseCaseNodeProps {
    data: {
        name: string;
        description?: string;
    };
}

/**
 * Use Case node component for Use Case diagrams
 * Renders an ellipse with the use case name
 */
export const UseCaseNode = memo(function UseCaseNode({ data }: UseCaseNodeProps) {
    return (
        <div
            className="relative flex items-center justify-center px-6 py-4 min-w-[120px] min-h-[60px]"
            data-testid="usecase-node"
        >
            {/* Ellipse Background */}
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 50"
                preserveAspectRatio="none"
            >
                <ellipse
                    cx="50"
                    cy="25"
                    rx="48"
                    ry="23"
                    fill="rgba(99, 102, 241, 0.1)"
                    stroke="rgb(99, 102, 241)"
                    strokeWidth="2"
                />
            </svg>

            {/* Use Case Name */}
            <div className="relative z-10 text-sm font-medium text-slate-200 text-center px-2">
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
            <Handle
                type="source"
                position={Position.Top}
                id="top"
                className="!bg-indigo-500 !w-2 !h-2 !border-0"
            />
            <Handle
                type="target"
                position={Position.Bottom}
                id="bottom"
                className="!bg-indigo-500 !w-2 !h-2 !border-0"
            />
        </div>
    );
});
