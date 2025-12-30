import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ParticipantNodeData } from '../../../types';
import { User, Box, Shield, Settings, Database } from 'lucide-react';

const PARTICIPANT_ICONS = {
    actor: User,
    object: Box,
    boundary: Shield,
    control: Settings,
    entity: Database,
};

/**
 * Participant node component for Sequence diagrams
 * Renders a box with icon based on participant type
 */
export const ParticipantNode = memo(function ParticipantNode({ data }: NodeProps<ParticipantNodeData>) {
    const { name, participantType } = data;
    const Icon = PARTICIPANT_ICONS[participantType] || Box;

    return (
        <div className="flex flex-col items-center" data-testid="participant-node">
            {/* Participant Box */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 border border-indigo-500/50 rounded-lg backdrop-blur-sm">
                <Icon className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-slate-200">{name}</span>
            </div>

            {/* Lifeline (dashed line going down) */}
            <div className="w-px h-[200px] border-l-2 border-dashed border-slate-500/50" />

            {/* Connection Handles */}
            <Handle
                type="source"
                position={Position.Right}
                className="!bg-indigo-500 !w-2 !h-2 !border-0"
                style={{ top: '20px' }}
            />
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-indigo-500 !w-2 !h-2 !border-0"
                style={{ top: '20px' }}
            />
        </div>
    );
});
