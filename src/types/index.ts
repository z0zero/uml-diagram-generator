import type { Node, Edge } from '@xyflow/react';

// ============================================
// Diagram Types
// ============================================

/**
 * Supported UML diagram types
 */
export type DiagramType =
  | 'class'
  | 'useCase'
  | 'activity'
  | 'sequence'
  | 'stateMachine'
  | 'component';

/**
 * Display names for diagram types
 */
export const DIAGRAM_TYPE_LABELS: Record<DiagramType, string> = {
  class: 'Class Diagram',
  useCase: 'Use Case Diagram',
  activity: 'Activity Diagram',
  sequence: 'Sequence Diagram',
  stateMachine: 'State Machine Diagram',
  component: 'Component Diagram',
};

// ============================================
// Class Diagram Types (existing)
// ============================================

/**
 * Represents a UML class in the JSON contract
 */
export interface UMLClass {
  id: string;
  name: string;
  attributes: string[];  // Format: "+ id: int", "- name: string"
  operations: string[];  // Format: "+ register()", "- validate()"
}

/**
 * Relationship types supported in Class diagrams
 */
export type ClassRelationshipType = 'association' | 'inheritance' | 'composition' | 'aggregation';

/**
 * Represents a UML relationship between classes
 */
export interface UMLRelationship {
  source: string;
  target: string;
  type: ClassRelationshipType;
  label?: string;
}

// ============================================
// Use Case Diagram Types
// ============================================

export interface UseCaseActor {
  id: string;
  name: string;
}

export interface UseCase {
  id: string;
  name: string;
  description?: string;
}

export interface UseCaseRelationship {
  source: string;
  target: string;
  type: 'association' | 'include' | 'extend' | 'generalization';
  label?: string;
}

// ============================================
// Activity Diagram Types
// ============================================

export type ActivityNodeType = 'action' | 'decision' | 'merge' | 'fork' | 'join' | 'initial' | 'final' | 'flowFinal';

export interface ActivityNode {
  id: string;
  type: ActivityNodeType;
  label: string;
}

export interface ActivityTransition {
  source: string;
  target: string;
  guard?: string;  // Condition for decision branches
  label?: string;
}

// ============================================
// Sequence Diagram Types
// ============================================

export type ParticipantType = 'actor' | 'object' | 'boundary' | 'control' | 'entity';

export interface SequenceParticipant {
  id: string;
  name: string;
  type: ParticipantType;
}

export type MessageType = 'sync' | 'async' | 'return' | 'create' | 'destroy';

export interface SequenceMessage {
  id: string;
  from: string;
  to: string;
  label: string;
  type: MessageType;
  order: number;  // Sequence order
}

// ============================================
// State Machine Diagram Types
// ============================================

export interface State {
  id: string;
  name: string;
  isInitial?: boolean;
  isFinal?: boolean;
  entryAction?: string;
  exitAction?: string;
}

export interface StateTransition {
  source: string;
  target: string;
  trigger?: string;
  guard?: string;
  action?: string;
}

// ============================================
// Component Diagram Types
// ============================================

export interface ComponentInterface {
  id: string;
  name: string;
  type: 'provided' | 'required';
}

export interface Component {
  id: string;
  name: string;
  stereotype?: string;
  interfaces?: ComponentInterface[];
}

export interface ComponentDependency {
  source: string;
  target: string;
  label?: string;
  type: 'dependency' | 'realization';
}

// ============================================
// Unified Diagram (JSON Contract)
// ============================================

/**
 * Unified diagram structure supporting all diagram types
 */
export interface UnifiedDiagram {
  type: DiagramType;

  // Class Diagram elements
  classes?: UMLClass[];
  relationships?: UMLRelationship[];

  // Use Case Diagram elements
  actors?: UseCaseActor[];
  useCases?: UseCase[];
  useCaseRelationships?: UseCaseRelationship[];

  // Activity Diagram elements
  activities?: ActivityNode[];
  transitions?: ActivityTransition[];

  // Sequence Diagram elements
  participants?: SequenceParticipant[];
  messages?: SequenceMessage[];

  // State Machine Diagram elements
  states?: State[];
  stateTransitions?: StateTransition[];

  // Component Diagram elements
  components?: Component[];
  dependencies?: ComponentDependency[];
}

/**
 * Legacy UMLDiagram type for backward compatibility
 */
export interface UMLDiagram {
  classes: UMLClass[];
  relationships: UMLRelationship[];
}

// Keep RelationshipType as alias for backward compatibility
export type RelationshipType = ClassRelationshipType;

// ============================================
// React Flow Node Data Types
// ============================================

/**
 * Data structure for Class nodes
 */
export interface ClassNodeData extends Record<string, unknown> {
  name: string;
  attributes: string[];
  operations: string[];
}

/**
 * Data structure for Use Case Actor nodes
 */
export interface ActorNodeData extends Record<string, unknown> {
  name: string;
}

/**
 * Data structure for Use Case nodes
 */
export interface UseCaseNodeData extends Record<string, unknown> {
  name: string;
  description?: string;
}

/**
 * Data structure for Activity nodes
 */
export interface ActivityNodeData extends Record<string, unknown> {
  nodeType: ActivityNodeType;
  label: string;
}

/**
 * Data structure for Sequence Participant nodes
 */
export interface ParticipantNodeData extends Record<string, unknown> {
  name: string;
  participantType: ParticipantType;
}

/**
 * Data structure for State nodes
 */
export interface StateNodeData extends Record<string, unknown> {
  name: string;
  isInitial?: boolean;
  isFinal?: boolean;
  entryAction?: string;
  exitAction?: string;
}

/**
 * Data structure for Component nodes
 */
export interface ComponentNodeData extends Record<string, unknown> {
  name: string;
  stereotype?: string;
  interfaces?: ComponentInterface[];
}

/**
 * Data structure for relationship edges
 */
export interface RelationshipEdgeData extends Record<string, unknown> {
  type: ClassRelationshipType;
  label?: string;
}

/**
 * Data structure for generic edges (used by multiple diagram types)
 */
export interface GenericEdgeData extends Record<string, unknown> {
  label?: string;
  edgeType?: string;
}

// ============================================
// React Flow Type Aliases
// ============================================

export type ClassNode = Node<ClassNodeData, 'classNode'>;
export type ActorNode = Node<ActorNodeData, 'actorNode'>;
export type UseCaseNode = Node<UseCaseNodeData, 'useCaseNode'>;
export type ActivityFlowNode = Node<ActivityNodeData, 'activityNode'>;
export type ParticipantNode = Node<ParticipantNodeData, 'participantNode'>;
export type StateFlowNode = Node<StateNodeData, 'stateNode'>;
export type ComponentFlowNode = Node<ComponentNodeData, 'componentNode'>;

export type RelationshipEdge = Edge<RelationshipEdgeData>;
export type GenericEdge = Edge<GenericEdgeData>;

// Union type for all node types
export type DiagramNode =
  | ClassNode
  | ActorNode
  | UseCaseNode
  | ActivityFlowNode
  | ParticipantNode
  | StateFlowNode
  | ComponentFlowNode;

// Union type for all edge types
export type DiagramEdge = RelationshipEdge | GenericEdge;

// ============================================
// Project and Message Types
// ============================================

/**
 * Represents a project in the application
 */
export interface Project {
  id: string;
  name: string;
  diagramType: DiagramType;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message role in conversation
 */
export type MessageRole = 'user' | 'assistant';

/**
 * Represents a message in the conversation history
 */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

/**
 * Project data structure for localStorage persistence
 */
export interface StoredProject {
  id: string;
  name: string;
  diagramType: DiagramType;
  diagram: UnifiedDiagram;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Zustand Store Interface
// ============================================

/**
 * Zustand store interface for diagram state management
 */
export interface DiagramStore {
  // Project State
  projects: Project[];
  currentProjectId: string | null;
  currentDiagramType: DiagramType;

  // Diagram State
  nodes: DiagramNode[];
  edges: DiagramEdge[];

  // Conversation State
  messages: Message[];
  isLoading: boolean;

  // Project Actions
  createProject: (diagramType?: DiagramType) => void;
  saveProject: () => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;

  // Diagram Actions
  setNodes: (nodes: DiagramNode[]) => void;
  setEdges: (edges: DiagramEdge[]) => void;
  setDiagramType: (type: DiagramType) => void;

  // Conversation Actions
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;

  // UML Update Action
  updateDiagramFromUML: (uml: UnifiedDiagram) => void;

  // Project Name Update Action
  updateProjectName: (name: string) => void;
}
