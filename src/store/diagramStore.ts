import { create } from 'zustand';
import type {
  DiagramStore,
  Project,
  Message,
  ClassNode,
  RelationshipEdge,
  UMLDiagram,
  StoredProject,
} from '../types';
import {
  saveToStorage,
  loadFromStorage,
  loadProjectById,
  deleteFromStorage,
} from '../utils/storage';
import { parseToReactFlow } from '../services/umlParser';
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
  nodes: [] as ClassNode[],
  edges: [] as RelationshipEdge[],
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
  createProject: () => {
    const newProject: Project = {
      id: generateId(),
      name: 'Untitled Project',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      projects: [...state.projects, newProject],
      currentProjectId: newProject.id,
      nodes: [],
      edges: [],
      messages: [],
      isLoading: false,
    }));
  },

  saveProject: () => {
    const state = get();
    const { currentProjectId, nodes, edges, messages, projects } = state;

    if (!currentProjectId) {
      return;
    }

    const currentProject = projects.find((p) => p.id === currentProjectId);
    if (!currentProject) {
      return;
    }

    // Convert nodes and edges back to UML diagram format for storage
    const diagram: UMLDiagram = {
      classes: nodes.map((node) => ({
        id: node.id,
        name: node.data.name,
        attributes: [...node.data.attributes],
        operations: [...node.data.operations],
      })),
      relationships: edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        type: edge.data?.type ?? 'association',
        label: edge.data?.label,
      })),
    };

    const storedProject: StoredProject = {
      id: currentProjectId,
      name: currentProject.name,
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
      // Update the project's updatedAt in the local state
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
    const { nodes, edges } = parseToReactFlow(stored.diagram);
    const layoutedNodes = calculateLayout(nodes, edges);

    set({
      currentProjectId: stored.id,
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
          // Clear state if deleting current project
          ...(isCurrentProject && {
            currentProjectId: null,
            nodes: [],
            edges: [],
            messages: [],
          }),
        };
      });
    }
  },

  // Diagram Actions
  setNodes: (nodes: ClassNode[]) => {
    set({ nodes });
  },

  setEdges: (edges: RelationshipEdge[]) => {
    set({ edges });
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
  updateDiagramFromUML: (uml: UMLDiagram) => {
    const { nodes, edges } = parseToReactFlow(uml);
    const layoutedNodes = calculateLayout(nodes, edges);

    set({
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
 * Initialize the store by loading projects from localStorage
 */
export function initializeStore(): void {
  const result = loadFromStorage();

  if (result.success && result.data) {
    const projects = result.data.map(storedProjectToProject);
    useDiagramStore.setState({ projects });
  }
}
