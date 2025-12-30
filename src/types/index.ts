import type { Node, Edge } from '@xyflow/react';

// ============================================
// UML Data Models (JSON Contract)
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
 * Relationship types supported in UML diagrams
 */
export type RelationshipType = 'association' | 'inheritance' | 'composition' | 'aggregation';

/**
 * Represents a UML relationship between classes
 */
export interface UMLRelationship {
  source: string;  // Class ID
  target: string;  // Class ID
  type: RelationshipType;
  label?: string;
}

/**
 * The complete UML diagram structure (JSON contract)
 */
export interface UMLDiagram {
  classes: UMLClass[];
  relationships: UMLRelationship[];
}

// ============================================
// React Flow Node/Edge Data
// ============================================

/**
 * Data structure for custom class nodes in React Flow
 */
export interface ClassNodeData extends Record<string, unknown> {
  name: string;
  attributes: string[];
  operations: string[];
}

/**
 * Data structure for custom relationship edges in React Flow
 */
export interface RelationshipEdgeData extends Record<string, unknown> {
  type: RelationshipType;
  label?: string;
}

// ============================================
// React Flow Type Aliases
// ============================================

export type ClassNode = Node<ClassNodeData, 'classNode'>;
export type RelationshipEdge = Edge<RelationshipEdgeData>;

// ============================================
// Project and Message Types
// ============================================

/**
 * Represents a project in the application
 */
export interface Project {
  id: string;
  name: string;
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
  diagram: UMLDiagram;
  messages: Message[];
  createdAt: string;  // ISO date string
  updatedAt: string;  // ISO date string
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

  // Diagram State
  nodes: ClassNode[];
  edges: RelationshipEdge[];

  // Conversation State
  messages: Message[];
  isLoading: boolean;

  // Project Actions
  createProject: () => void;
  saveProject: () => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;

  // Diagram Actions
  setNodes: (nodes: ClassNode[]) => void;
  setEdges: (edges: RelationshipEdge[]) => void;

  // Conversation Actions
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;

  // UML Update Action
  updateDiagramFromUML: (uml: UMLDiagram) => void;
}
