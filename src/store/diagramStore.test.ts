import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { useDiagramStore } from './diagramStore';
import type {
  UnifiedDiagram,
  UMLClass,
  UMLRelationship,
  RelationshipType,
  Message,
  ClassNode,
  RelationshipEdge,
} from '../types';

// ============================================
// Mock localStorage
// ============================================

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get _store() {
      return store;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// ============================================
// Generators for Property-Based Testing
// ============================================

const visibilityMarker = fc.constantFrom('+', '-', '#', '~');
const identifier = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{0,19}$/);
const typeName = fc.constantFrom('int', 'string', 'boolean', 'void', 'Date', 'number');

const attributeGen = fc.tuple(visibilityMarker, identifier, typeName).map(
  ([vis, name, type]) => `${vis} ${name}: ${type}`
);

const operationGen = fc.tuple(visibilityMarker, identifier).map(
  ([vis, name]) => `${vis} ${name}()`
);

const umlClassGen: fc.Arbitrary<UMLClass> = fc.record({
  id: identifier,
  name: identifier.map((name) => name.charAt(0).toUpperCase() + name.slice(1)),
  attributes: fc.array(attributeGen, { minLength: 0, maxLength: 5 }),
  operations: fc.array(operationGen, { minLength: 0, maxLength: 5 }),
});

const relationshipTypeGen: fc.Arbitrary<RelationshipType> = fc.constantFrom(
  'association',
  'inheritance',
  'composition',
  'aggregation'
);

// Generate a valid UML diagram with classes and relationships
const umlDiagramGen: fc.Arbitrary<UnifiedDiagram> = fc
  .array(umlClassGen, { minLength: 1, maxLength: 5 })
  .chain((classes) => {
    // Ensure unique IDs
    const uniqueClasses = classes.reduce<UMLClass[]>((acc, cls, idx) => {
      const uniqueId = `${cls.id}_${idx}`;
      acc.push({ ...cls, id: uniqueId });
      return acc;
    }, []);

    const classIds = uniqueClasses.map((c) => c.id);

    // Generate relationships only between existing classes
    const relationshipGen: fc.Arbitrary<UMLRelationship> = fc.record({
      source: fc.constantFrom(...classIds),
      target: fc.constantFrom(...classIds),
      type: relationshipTypeGen,
      label: fc.option(identifier, { nil: undefined }),
    });

    return fc.record({
      type: fc.constant('class' as const),
      classes: fc.constant(uniqueClasses),
      relationships: fc.array(relationshipGen, { minLength: 0, maxLength: 5 }),
    });
  });

// Generate a message
const messageGen: fc.Arbitrary<Message> = fc.record({
  id: identifier,
  role: fc.constantFrom('user', 'assistant') as fc.Arbitrary<'user' | 'assistant'>,
  content: fc.string({ minLength: 1, maxLength: 100 }),
  timestamp: fc.date(),
});

// Generate ClassNode from UMLClass
const classNodeGen: fc.Arbitrary<ClassNode> = umlClassGen.map((cls) => ({
  id: cls.id,
  type: 'classNode' as const,
  position: { x: 0, y: 0 },
  data: {
    name: cls.name,
    attributes: cls.attributes,
    operations: cls.operations,
  },
}));

// Generate RelationshipEdge
const relationshipEdgeGen = (classIds: string[]): fc.Arbitrary<RelationshipEdge> =>
  fc.record({
    id: identifier,
    source: fc.constantFrom(...classIds),
    target: fc.constantFrom(...classIds),
    type: fc.constant('relationshipEdge' as const),
    data: fc.record({
      type: relationshipTypeGen,
      label: fc.option(identifier, { nil: undefined }),
    }),
  });

// ============================================
// Test Setup
// ============================================

describe('Diagram Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useDiagramStore.setState({
      projects: [],
      currentProjectId: null,
      currentDiagramType: 'class',
      nodes: [],
      edges: [],
      messages: [],
      isLoading: false,
    });
    // Clear localStorage mock
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });


  /**
   * Feature: uml-diagram-generator, Property 4: Project Save/Load Round Trip
   * *For any* diagram state (nodes, edges, messages), saving the project and then
   * loading it SHALL produce an equivalent diagram state.
   * **Validates: Requirements 2.2, 2.4**
   */
  describe('Property 4: Project Save/Load Round Trip', () => {
    it('should preserve diagram state through save and load cycle', () => {
      fc.assert(
        fc.property(
          umlDiagramGen,
          fc.array(messageGen, { minLength: 0, maxLength: 5 }),
          (uml, messages) => {
            // Reset store state at the beginning of each iteration
            useDiagramStore.setState({
              projects: [],
              currentProjectId: null,
              nodes: [],
              edges: [],
              messages: [],
              isLoading: false,
            });
            localStorageMock.clear();

            const store = useDiagramStore.getState();

            // Create a new project
            store.createProject();
            const projectId = useDiagramStore.getState().currentProjectId;
            expect(projectId).not.toBeNull();

            // Update diagram from UML
            store.updateDiagramFromUML(uml);

            // Add messages with unique IDs
            const uniqueMessages = messages.map((msg, idx) => ({
              ...msg,
              id: `${msg.id}_${idx}`,
            }));
            for (const msg of uniqueMessages) {
              useDiagramStore.getState().addMessage(msg);
            }

            // Get state before save
            const stateBeforeSave = useDiagramStore.getState();
            const nodesBeforeSave = stateBeforeSave.nodes;
            const edgesBeforeSave = stateBeforeSave.edges;
            const messagesBeforeSave = stateBeforeSave.messages;

            // Save the project
            useDiagramStore.getState().saveProject();

            // Clear the state to simulate app restart
            useDiagramStore.setState({
              nodes: [],
              edges: [],
              messages: [],
              currentProjectId: null,
            });

            // Load the project
            useDiagramStore.getState().loadProject(projectId!);

            // Get state after load
            const stateAfterLoad = useDiagramStore.getState();

            // Verify nodes are equivalent (positions may differ due to layout)
            expect(stateAfterLoad.nodes.length).toBe(nodesBeforeSave.length);
            for (const nodeBefore of nodesBeforeSave) {
              const nodeAfter = stateAfterLoad.nodes.find((n) => n.id === nodeBefore.id);
              expect(nodeAfter).toBeDefined();
              expect(nodeAfter!.data.name).toBe(nodeBefore.data.name);
              expect(nodeAfter!.data.attributes).toEqual(nodeBefore.data.attributes);
              expect(nodeAfter!.data.operations).toEqual(nodeBefore.data.operations);
            }

            // Verify edges are equivalent
            expect(stateAfterLoad.edges.length).toBe(edgesBeforeSave.length);
            for (let i = 0; i < edgesBeforeSave.length; i++) {
              const edgeBefore = edgesBeforeSave[i];
              const edgeAfter = stateAfterLoad.edges[i];
              expect(edgeAfter.source).toBe(edgeBefore.source);
              expect(edgeAfter.target).toBe(edgeBefore.target);
              expect(edgeAfter.data?.type).toBe(edgeBefore.data?.type);
              expect(edgeAfter.data?.label).toBe(edgeBefore.data?.label);
            }

            // Verify messages are equivalent
            expect(stateAfterLoad.messages.length).toBe(messagesBeforeSave.length);
            for (let i = 0; i < messagesBeforeSave.length; i++) {
              const msgBefore = messagesBeforeSave[i];
              const msgAfter = stateAfterLoad.messages[i];
              expect(msgAfter.id).toBe(msgBefore.id);
              expect(msgAfter.role).toBe(msgBefore.role);
              expect(msgAfter.content).toBe(msgBefore.content);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Feature: uml-diagram-generator, Property 5: Project Deletion Removes Project
   * *For any* project list and valid project ID to delete, the resulting project list
   * SHALL NOT contain the deleted project and SHALL contain all other projects.
   * **Validates: Requirements 2.5**
   */
  describe('Property 5: Project Deletion Removes Project', () => {
    it('should remove only the deleted project from the list', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 0, max: 4 }),
          (numProjects, deleteIndex) => {
            // Reset store state at the beginning of each iteration
            useDiagramStore.setState({
              projects: [],
              currentProjectId: null,
              nodes: [],
              edges: [],
              messages: [],
              isLoading: false,
            });
            localStorageMock.clear();

            const store = useDiagramStore.getState();

            // Create multiple projects
            const projectIds: string[] = [];
            for (let i = 0; i < numProjects; i++) {
              store.createProject();
              const currentId = useDiagramStore.getState().currentProjectId;
              if (currentId) {
                projectIds.push(currentId);
                // Save each project to persist it
                useDiagramStore.getState().saveProject();
              }
            }

            // Ensure we have projects
            const projectsBefore = useDiagramStore.getState().projects;
            expect(projectsBefore.length).toBe(numProjects);

            // Select a valid index to delete
            const validDeleteIndex = deleteIndex % numProjects;
            const projectIdToDelete = projectIds[validDeleteIndex];

            // Delete the project
            useDiagramStore.getState().deleteProject(projectIdToDelete);

            // Verify the deleted project is not in the list
            const projectsAfter = useDiagramStore.getState().projects;
            expect(projectsAfter.find((p) => p.id === projectIdToDelete)).toBeUndefined();

            // Verify all other projects are still present
            expect(projectsAfter.length).toBe(numProjects - 1);
            for (const id of projectIds) {
              if (id !== projectIdToDelete) {
                expect(projectsAfter.find((p) => p.id === id)).toBeDefined();
              }
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Feature: uml-diagram-generator, Property 6: Create New Project Clears State
   * *For any* current diagram state, creating a new project SHALL result in empty nodes,
   * empty edges, and a new project entry.
   * **Validates: Requirements 2.1**
   */
  describe('Property 6: Create New Project Clears State', () => {
    it('should clear diagram state when creating a new project', () => {
      fc.assert(
        fc.property(
          umlDiagramGen,
          fc.array(messageGen, { minLength: 1, maxLength: 5 }),
          (uml, messages) => {
            // Reset store state at the beginning of each iteration
            useDiagramStore.setState({
              projects: [],
              currentProjectId: null,
              nodes: [],
              edges: [],
              messages: [],
              isLoading: false,
            });
            localStorageMock.clear();

            const store = useDiagramStore.getState();

            // Create initial project with data
            store.createProject();
            store.updateDiagramFromUML(uml);

            // Add messages with unique IDs
            const uniqueMessages = messages.map((msg, idx) => ({
              ...msg,
              id: `${msg.id}_${idx}`,
            }));
            for (const msg of uniqueMessages) {
              useDiagramStore.getState().addMessage(msg);
            }

            // Verify we have data
            const stateBefore = useDiagramStore.getState();
            expect(stateBefore.nodes.length).toBeGreaterThan(0);

            // Get project count before
            const projectCountBefore = stateBefore.projects.length;

            // Create a new project
            useDiagramStore.getState().createProject();

            // Verify state is cleared
            const stateAfter = useDiagramStore.getState();
            expect(stateAfter.nodes).toEqual([]);
            expect(stateAfter.edges).toEqual([]);
            expect(stateAfter.messages).toEqual([]);
            expect(stateAfter.isLoading).toBe(false);

            // Verify new project was added
            expect(stateAfter.projects.length).toBe(projectCountBefore + 1);
            expect(stateAfter.currentProjectId).not.toBeNull();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Feature: uml-diagram-generator, Property 14: State Management Data Integrity
   * *For any* state update operation (setNodes, setEdges, addMessage), the Zustand store
   * SHALL correctly reflect the updated data.
   * **Validates: Requirements 10.2, 10.3, 10.4**
   */
  describe('Property 14: State Management Data Integrity', () => {
    it('should correctly update nodes state', () => {
      fc.assert(
        fc.property(
          fc.array(classNodeGen, { minLength: 0, maxLength: 5 }).map((nodes) =>
            // Ensure unique IDs
            nodes.map((node, idx) => ({ ...node, id: `${node.id}_${idx}` }))
          ),
          (nodes) => {
            // Reset store state at the beginning of each iteration
            useDiagramStore.setState({
              projects: [],
              currentProjectId: null,
              nodes: [],
              edges: [],
              messages: [],
              isLoading: false,
            });

            const store = useDiagramStore.getState();
            store.setNodes(nodes);

            const stateAfter = useDiagramStore.getState();
            expect(stateAfter.nodes).toEqual(nodes);
            expect(stateAfter.nodes.length).toBe(nodes.length);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly update edges state', () => {
      fc.assert(
        fc.property(
          fc.array(classNodeGen, { minLength: 2, maxLength: 5 }).chain((nodes) => {
            const uniqueNodes = nodes.map((node, idx) => ({
              ...node,
              id: `${node.id}_${idx}`,
            }));
            const classIds = uniqueNodes.map((n) => n.id);
            return fc.tuple(
              fc.constant(uniqueNodes),
              fc.array(relationshipEdgeGen(classIds), { minLength: 0, maxLength: 5 }).map(
                (edges) => edges.map((edge, idx) => ({ ...edge, id: `edge_${idx}` }))
              )
            );
          }),
          ([nodes, edges]) => {
            // Reset store state at the beginning of each iteration
            useDiagramStore.setState({
              projects: [],
              currentProjectId: null,
              nodes: [],
              edges: [],
              messages: [],
              isLoading: false,
            });

            const store = useDiagramStore.getState();
            store.setNodes(nodes);
            store.setEdges(edges);

            const stateAfter = useDiagramStore.getState();
            expect(stateAfter.edges).toEqual(edges);
            expect(stateAfter.edges.length).toBe(edges.length);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly add messages to conversation history', () => {
      fc.assert(
        fc.property(
          fc.array(messageGen, { minLength: 1, maxLength: 10 }),
          (messages) => {
            // Reset messages
            useDiagramStore.setState({ messages: [] });

            // Add messages with unique IDs
            const uniqueMessages = messages.map((msg, idx) => ({
              ...msg,
              id: `${msg.id}_${idx}`,
            }));

            for (const msg of uniqueMessages) {
              useDiagramStore.getState().addMessage(msg);
            }

            const stateAfter = useDiagramStore.getState();
            expect(stateAfter.messages.length).toBe(uniqueMessages.length);

            // Verify messages are in order
            for (let i = 0; i < uniqueMessages.length; i++) {
              expect(stateAfter.messages[i].id).toBe(uniqueMessages[i].id);
              expect(stateAfter.messages[i].role).toBe(uniqueMessages[i].role);
              expect(stateAfter.messages[i].content).toBe(uniqueMessages[i].content);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly update loading state', () => {
      fc.assert(
        fc.property(fc.boolean(), (loading) => {
          const store = useDiagramStore.getState();
          store.setLoading(loading);

          const stateAfter = useDiagramStore.getState();
          expect(stateAfter.isLoading).toBe(loading);

          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});
