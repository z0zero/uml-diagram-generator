import { create } from 'zustand';
import type {
  DiagramStore,
  Project,
  Message,
  DiagramNode,
  DiagramEdge,
  UnifiedDiagram,
  StoredProject,
  DiagramType,
} from '../types';
import {
  saveToStorage,
  loadFromStorage,
  loadProjectById,
  deleteFromStorage,
} from '../utils/storage';
import { parseUnifiedDiagram } from '../services/diagramParser';
import { calculateLayout } from '../services/layoutEngine';

/**
 * Generates a unique ID for projects and messages
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Converts a StoredProject to a Project (for the project list)
 */
function storedProjectToProject(stored: StoredProject): Project {
  return {
    id: stored.id,
    name: stored.name,
    diagramType: stored.diagramType || 'class',
    createdAt: new Date(stored.createdAt),
    updatedAt: new Date(stored.updatedAt),
  };
}

/**
 * Converts Message dates from ISO strings back to Date objects
 */
function parseStoredMessages(messages: Message[]): Message[] {
  return messages.map((msg) => ({
    ...msg,
    timestamp: new Date(msg.timestamp),
  }));
}

/**
 * Initial state for the diagram store
 */
const initialState = {
  projects: [] as Project[],
  currentProjectId: null as string | null,
  currentDiagramType: 'class' as DiagramType,
  nodes: [] as DiagramNode[],
  edges: [] as DiagramEdge[],
  messages: [] as Message[],
  isLoading: false,
};

/**
 * Zustand store for managing UML diagram application state
 */
export const useDiagramStore = create<DiagramStore>((set, get) => ({
  // Initial State
  ...initialState,

  // Project Actions
  createProject: (diagramType: DiagramType = 'class') => {
    const newProject: Project = {
      id: generateId(),
      name: 'Untitled Project',
      diagramType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      projects: [...state.projects, newProject],
      currentProjectId: newProject.id,
      currentDiagramType: diagramType,
      nodes: [],
      edges: [],
      messages: [],
      isLoading: false,
    }));
  },

  saveProject: () => {
    const state = get();
    const { currentProjectId, currentDiagramType, nodes, edges, messages, projects } = state;

    if (!currentProjectId) {
      return;
    }

    const currentProject = projects.find((p) => p.id === currentProjectId);
    if (!currentProject) {
      return;
    }

    // Convert nodes and edges back to UnifiedDiagram for storage
    const diagram = nodesToUnifiedDiagram(nodes, edges, currentDiagramType);

    const storedProject: StoredProject = {
      id: currentProjectId,
      name: currentProject.name,
      diagramType: currentDiagramType,
      diagram,
      messages: messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
      })),
      createdAt: currentProject.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = saveToStorage(storedProject);

    if (result.success) {
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === currentProjectId ? { ...p, updatedAt: new Date() } : p
        ),
      }));
    }
  },

  loadProject: (id: string) => {
    const result = loadProjectById(id);

    if (!result.success || !result.data) {
      return;
    }

    const stored = result.data;
    const diagramType = stored.diagramType || 'class';
    const { nodes, edges } = parseUnifiedDiagram(stored.diagram);
    const layoutedNodes = calculateLayout(nodes, edges);

    set({
      currentProjectId: stored.id,
      currentDiagramType: diagramType,
      nodes: layoutedNodes,
      edges,
      messages: parseStoredMessages(stored.messages),
      isLoading: false,
    });
  },

  deleteProject: (id: string) => {
    const result = deleteFromStorage(id);

    if (result.success) {
      set((state) => {
        const newProjects = state.projects.filter((p) => p.id !== id);
        const isCurrentProject = state.currentProjectId === id;

        return {
          projects: newProjects,
          ...(isCurrentProject && {
            currentProjectId: null,
            currentDiagramType: 'class' as DiagramType,
            nodes: [],
            edges: [],
            messages: [],
          }),
        };
      });
    }
  },

  // Diagram Actions
  setNodes: (nodes: DiagramNode[]) => {
    set({ nodes });
  },

  setEdges: (edges: DiagramEdge[]) => {
    set({ edges });
  },

  setDiagramType: (type: DiagramType) => {
    set({ currentDiagramType: type });
  },

  // Conversation Actions
  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // UML Update Action  
  updateDiagramFromUML: (uml: UnifiedDiagram) => {
    const { nodes, edges } = parseUnifiedDiagram(uml);
    const layoutedNodes = calculateLayout(nodes, edges);

    set({
      currentDiagramType: uml.type,
      nodes: layoutedNodes,
      edges,
    });
  },

  // Update project name
  updateProjectName: (name: string) => {
    const state = get();
    const { currentProjectId, projects } = state;

    if (!currentProjectId) {
      return;
    }

    set({
      projects: projects.map((p) =>
        p.id === currentProjectId ? { ...p, name, updatedAt: new Date() } : p
      ),
    });
  },
}));

/**
 * Convert nodes/edges back to UnifiedDiagram for storage
 */
function nodesToUnifiedDiagram(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  diagramType: DiagramType
): UnifiedDiagram {
  const diagram: UnifiedDiagram = { type: diagramType };

  switch (diagramType) {
    case 'class':
      diagram.classes = nodes
        .filter((n) => n.type === 'classNode')
        .map((node) => ({
          id: node.id,
          name: (node.data as { name: string }).name,
          attributes: [...((node.data as { attributes: string[] }).attributes || [])],
          operations: [...((node.data as { operations: string[] }).operations || [])],
        }));
      diagram.relationships = edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        type: ((edge.data as { type?: string })?.type || 'association') as 'association' | 'inheritance' | 'composition' | 'aggregation',
        label: (edge.data as { label?: string })?.label,
      }));
      break;

    case 'useCase':
      diagram.actors = nodes
        .filter((n) => n.type === 'actorNode')
        .map((node) => ({
          id: node.id,
          name: (node.data as { name: string }).name,
        }));
      diagram.useCases = nodes
        .filter((n) => n.type === 'useCaseNode')
        .map((node) => ({
          id: node.id,
          name: (node.data as { name: string }).name,
        }));
      break;

    case 'activity':
      diagram.activities = nodes.map((node) => ({
        id: node.id,
        type: (node.data as { nodeType: string }).nodeType as 'action' | 'decision' | 'merge' | 'fork' | 'join' | 'initial' | 'final' | 'flowFinal',
        label: (node.data as { label: string }).label || '',
      }));
      diagram.transitions = edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        guard: (edge.data as { label?: string })?.label,
      }));
      break;

    case 'sequence':
      diagram.participants = nodes.map((node) => ({
        id: node.id,
        name: (node.data as { name: string }).name,
        type: (node.data as { participantType: string }).participantType as 'actor' | 'object' | 'boundary' | 'control' | 'entity',
      }));
      break;

    case 'stateMachine':
      diagram.states = nodes.map((node) => ({
        id: node.id,
        name: (node.data as { name: string }).name || '',
        isInitial: (node.data as { isInitial?: boolean }).isInitial,
        isFinal: (node.data as { isFinal?: boolean }).isFinal,
      }));
      diagram.stateTransitions = edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        trigger: (edge.data as { label?: string })?.label,
      }));
      break;

    case 'component':
      diagram.components = nodes.map((node) => ({
        id: node.id,
        name: (node.data as { name: string }).name,
        stereotype: (node.data as { stereotype?: string }).stereotype,
      }));
      diagram.dependencies = edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        label: (edge.data as { label?: string })?.label,
        type: ((edge.data as { edgeType?: string })?.edgeType || 'dependency') as 'dependency' | 'realization',
      }));
      break;
  }

  return diagram;
}

/**
 * Initialize the store by loading projects from localStorage
 */
export function initializeStore(): void {
  const result = loadFromStorage();

  if (result.success && result.data) {
    const projects = result.data.map(storedProjectToProject);
    useDiagramStore.setState({ projects });
  }
}
