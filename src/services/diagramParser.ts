import type { Node, Edge } from '@xyflow/react';
import type {
    UnifiedDiagram,
    DiagramType,
    UMLClass,
    UMLRelationship,
    ClassNodeData,
    RelationshipEdgeData,
    ActorNodeData,
    UseCaseNodeData,
    ActivityNodeData,
    ParticipantNodeData,
    StateNodeData,
    ComponentNodeData,
    GenericEdgeData,
    DiagramNode,
    DiagramEdge,
} from '../types';

// ============================================
// Validation Types
// ============================================

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

const VALID_DIAGRAM_TYPES: DiagramType[] = [
    'class', 'useCase', 'activity', 'sequence', 'stateMachine', 'component'
];

/**
 * Validates a UnifiedDiagram structure
 */
export function validateUnifiedDiagram(data: unknown): ValidationResult {
    const errors: string[] = [];

    if (typeof data !== 'object' || data === null) {
        return { valid: false, errors: ['Invalid JSON syntax'] };
    }

    const obj = data as Record<string, unknown>;

    // Check diagram type
    if (!obj.type || !VALID_DIAGRAM_TYPES.includes(obj.type as DiagramType)) {
        errors.push('Missing or invalid diagram type');
        return { valid: false, errors };
    }

    const diagramType = obj.type as DiagramType;

    // Type-specific validation
    switch (diagramType) {
        case 'class':
            if (!Array.isArray(obj.classes)) errors.push('Missing classes array');
            if (!Array.isArray(obj.relationships)) errors.push('Missing relationships array');
            break;
        case 'useCase':
            if (!Array.isArray(obj.actors) && !Array.isArray(obj.useCases)) {
                errors.push('Missing actors or useCases array');
            }
            break;
        case 'activity':
            if (!Array.isArray(obj.activities)) errors.push('Missing activities array');
            break;
        case 'sequence':
            if (!Array.isArray(obj.participants)) errors.push('Missing participants array');
            break;
        case 'stateMachine':
            if (!Array.isArray(obj.states)) errors.push('Missing states array');
            break;
        case 'component':
            if (!Array.isArray(obj.components)) errors.push('Missing components array');
            break;
    }

    return { valid: errors.length === 0, errors };
}

// ============================================
// Parse Result Types
// ============================================

export interface ParseResult {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
}

// ============================================
// Class Diagram Parsing
// ============================================

function parseClassDiagram(diagram: UnifiedDiagram): ParseResult {
    const classes = diagram.classes || [];
    const relationships = diagram.relationships || [];

    const nodes: Node<ClassNodeData, 'classNode'>[] = classes.map((cls) => ({
        id: cls.id,
        type: 'classNode' as const,
        position: { x: 0, y: 0 },
        data: {
            name: cls.name,
            attributes: [...cls.attributes],
            operations: [...cls.operations],
        },
    }));

    const edges: Edge<RelationshipEdgeData>[] = relationships.map((rel, idx) => ({
        id: `edge-${rel.source}-${rel.target}-${idx}`,
        source: rel.source,
        target: rel.target,
        type: 'relationshipEdge',
        data: {
            type: rel.type,
            label: rel.label,
        },
    }));

    return { nodes, edges };
}

// ============================================
// Use Case Diagram Parsing
// ============================================

function parseUseCaseDiagram(diagram: UnifiedDiagram): ParseResult {
    const actors = diagram.actors || [];
    const useCases = diagram.useCases || [];
    const relationships = diagram.useCaseRelationships || [];

    const nodes: DiagramNode[] = [];

    // Add actor nodes
    actors.forEach((actor) => {
        nodes.push({
            id: actor.id,
            type: 'actorNode' as const,
            position: { x: 0, y: 0 },
            data: { name: actor.name } as ActorNodeData,
        } as Node<ActorNodeData, 'actorNode'>);
    });

    // Add use case nodes
    useCases.forEach((uc) => {
        nodes.push({
            id: uc.id,
            type: 'useCaseNode' as const,
            position: { x: 0, y: 0 },
            data: { name: uc.name, description: uc.description } as UseCaseNodeData,
        } as Node<UseCaseNodeData, 'useCaseNode'>);
    });

    const edges: DiagramEdge[] = relationships.map((rel, idx) => ({
        id: `edge-${rel.source}-${rel.target}-${idx}`,
        source: rel.source,
        target: rel.target,
        type: 'default',
        label: rel.type === 'include' ? '<<include>>' : rel.type === 'extend' ? '<<extend>>' : rel.label,
        style: rel.type === 'include' || rel.type === 'extend' ? { strokeDasharray: '5,5' } : undefined,
        data: { label: rel.label, edgeType: rel.type } as GenericEdgeData,
    }));

    return { nodes, edges };
}

// ============================================
// Activity Diagram Parsing
// ============================================

function parseActivityDiagram(diagram: UnifiedDiagram): ParseResult {
    const activities = diagram.activities || [];
    const transitions = diagram.transitions || [];

    const nodes: DiagramNode[] = activities.map((act) => ({
        id: act.id,
        type: 'activityNode' as const,
        position: { x: 0, y: 0 },
        data: { nodeType: act.type, label: act.label } as ActivityNodeData,
    } as Node<ActivityNodeData, 'activityNode'>));

    const edges: DiagramEdge[] = transitions.map((trans, idx) => ({
        id: `edge-${trans.source}-${trans.target}-${idx}`,
        source: trans.source,
        target: trans.target,
        type: 'default',
        label: trans.guard || trans.label,
        data: { label: trans.guard || trans.label } as GenericEdgeData,
    }));

    return { nodes, edges };
}

// ============================================
// Sequence Diagram Parsing
// ============================================

function parseSequenceDiagram(diagram: UnifiedDiagram): ParseResult {
    const participants = diagram.participants || [];
    const messages = diagram.messages || [];

    // Position participants horizontally
    const nodes: DiagramNode[] = participants.map((p, idx) => ({
        id: p.id,
        type: 'participantNode' as const,
        position: { x: idx * 200, y: 0 },
        data: { name: p.name, participantType: p.type } as ParticipantNodeData,
    } as Node<ParticipantNodeData, 'participantNode'>));

    // Create message edges (sorted by order)
    const sortedMessages = [...messages].sort((a, b) => a.order - b.order);
    const edges: DiagramEdge[] = sortedMessages.map((msg, idx) => ({
        id: msg.id || `msg-${idx}`,
        source: msg.from,
        target: msg.to,
        type: 'default',
        label: msg.label,
        animated: msg.type === 'async',
        style: msg.type === 'return' ? { strokeDasharray: '5,5' } : undefined,
        data: { label: msg.label, edgeType: msg.type } as GenericEdgeData,
    }));

    return { nodes, edges };
}

// ============================================
// State Machine Diagram Parsing
// ============================================

function parseStateMachineDiagram(diagram: UnifiedDiagram): ParseResult {
    const states = diagram.states || [];
    const transitions = diagram.stateTransitions || [];

    const nodes: DiagramNode[] = states.map((state) => ({
        id: state.id,
        type: 'stateNode' as const,
        position: { x: 0, y: 0 },
        data: {
            name: state.name,
            isInitial: state.isInitial,
            isFinal: state.isFinal,
            entryAction: state.entryAction,
            exitAction: state.exitAction,
        } as StateNodeData,
    } as Node<StateNodeData, 'stateNode'>));

    const edges: DiagramEdge[] = transitions.map((trans, idx) => {
        let label = trans.trigger || '';
        if (trans.guard) label += ` [${trans.guard}]`;
        if (trans.action) label += ` / ${trans.action}`;

        return {
            id: `edge-${trans.source}-${trans.target}-${idx}`,
            source: trans.source,
            target: trans.target,
            type: 'default',
            label: label.trim(),
            data: { label: label.trim() } as GenericEdgeData,
        };
    });

    return { nodes, edges };
}

// ============================================
// Component Diagram Parsing
// ============================================

function parseComponentDiagram(diagram: UnifiedDiagram): ParseResult {
    const components = diagram.components || [];
    const dependencies = diagram.dependencies || [];

    const nodes: DiagramNode[] = components.map((comp) => ({
        id: comp.id,
        type: 'componentNode' as const,
        position: { x: 0, y: 0 },
        data: {
            name: comp.name,
            stereotype: comp.stereotype,
            interfaces: comp.interfaces,
        } as ComponentNodeData,
    } as Node<ComponentNodeData, 'componentNode'>));

    const edges: DiagramEdge[] = dependencies.map((dep, idx) => ({
        id: `edge-${dep.source}-${dep.target}-${idx}`,
        source: dep.source,
        target: dep.target,
        type: 'default',
        label: dep.label,
        style: dep.type === 'dependency' ? { strokeDasharray: '5,5' } : undefined,
        data: { label: dep.label, edgeType: dep.type } as GenericEdgeData,
    }));

    return { nodes, edges };
}

// ============================================
// Main Parser Function
// ============================================

/**
 * Parses a UnifiedDiagram into React Flow nodes and edges
 */
export function parseUnifiedDiagram(diagram: UnifiedDiagram): ParseResult {
    switch (diagram.type) {
        case 'class':
            return parseClassDiagram(diagram);
        case 'useCase':
            return parseUseCaseDiagram(diagram);
        case 'activity':
            return parseActivityDiagram(diagram);
        case 'sequence':
            return parseSequenceDiagram(diagram);
        case 'stateMachine':
            return parseStateMachineDiagram(diagram);
        case 'component':
            return parseComponentDiagram(diagram);
        default:
            console.warn('Unknown diagram type, defaulting to class diagram');
            return parseClassDiagram(diagram);
    }
}

// ============================================
// Legacy Compatibility Functions
// ============================================

/**
 * Legacy function for backward compatibility with Class diagrams
 */
export function parseToReactFlow(uml: { classes: UMLClass[]; relationships: UMLRelationship[] }): ParseResult {
    return parseClassDiagram({
        type: 'class',
        classes: uml.classes,
        relationships: uml.relationships,
    });
}

/**
 * Legacy validation function
 */
export function validateUML(data: unknown): ValidationResult {
    if (typeof data !== 'object' || data === null) {
        return { valid: false, errors: ['Invalid JSON syntax'] };
    }

    const obj = data as Record<string, unknown>;

    // If it has a type field, use unified validation
    if (obj.type) {
        return validateUnifiedDiagram(data);
    }

    // Legacy class diagram validation
    const errors: string[] = [];

    if (!Array.isArray(obj.classes)) {
        errors.push('Missing required field: classes');
    }
    if (!Array.isArray(obj.relationships)) {
        errors.push('Missing required field: relationships');
    }

    return { valid: errors.length === 0, errors };
}
