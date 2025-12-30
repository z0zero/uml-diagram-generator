import { useEffect, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Canvas } from './components/Canvas/Canvas';
import { PromptPanel } from './components/PromptPanel/PromptPanel';
import { useDiagramStore, initializeStore } from './store/diagramStore';
import { generateUML } from './services/aiService';
import type { Message } from './types';

/**
 * Generates a unique ID for messages
 */
function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Main App component with three-panel layout.
 * Integrates Sidebar, Canvas, and PromptPanel components.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
function App() {
  // Get state from Zustand store
  const projects = useDiagramStore((state) => state.projects);
  const currentProjectId = useDiagramStore((state) => state.currentProjectId);
  const messages = useDiagramStore((state) => state.messages);
  const isLoading = useDiagramStore((state) => state.isLoading);

  // Get actions from Zustand store
  const createProject = useDiagramStore((state) => state.createProject);
  const saveProject = useDiagramStore((state) => state.saveProject);
  const loadProject = useDiagramStore((state) => state.loadProject);
  const deleteProject = useDiagramStore((state) => state.deleteProject);
  const addMessage = useDiagramStore((state) => state.addMessage);
  const setLoading = useDiagramStore((state) => state.setLoading);
  const updateDiagramFromUML = useDiagramStore((state) => state.updateDiagramFromUML);
  const updateProjectName = useDiagramStore((state) => state.updateProjectName);

  // Initialize store on mount (load projects from localStorage)
  useEffect(() => {
    initializeStore();
  }, []);

  /**
   * Generates a project name from the prompt (first 30 chars, cleaned up)
   */
  const generateProjectName = useCallback((prompt: string): string => {
    const cleaned = prompt.trim().replace(/\s+/g, ' ');
    if (cleaned.length <= 30) {
      return cleaned;
    }
    return cleaned.substring(0, 30).trim() + '...';
  }, []);

  /**
   * Handles prompt submission from PromptPanel.
   * Sends prompt to AI service and updates diagram with response.
   */
  const handlePromptSubmit = useCallback(async (prompt: string) => {
    // If this is the first message and project is "Untitled Project", rename it
    const currentProject = projects.find(p => p.id === currentProjectId);
    if (messages.length === 0 && currentProject?.name === 'Untitled Project') {
      updateProjectName(generateProjectName(prompt));
    }

    // Add user message to conversation
    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };
    addMessage(userMessage);

    // Set loading state
    setLoading(true);

    try {
      // Generate UML from prompt
      const umlDiagram = await generateUML(prompt);

      // Update diagram with AI response
      updateDiagramFromUML(umlDiagram);

      // Add assistant message to conversation
      const assistantMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: `Generated UML diagram with ${umlDiagram.classes.length} classes and ${umlDiagram.relationships.length} relationships.`,
        timestamp: new Date(),
      };
      addMessage(assistantMessage);
    } catch (error) {
      // Add error message to conversation
      const errorMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: 'Sorry, there was an error generating the diagram. Please try again.',
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [addMessage, setLoading, updateDiagramFromUML, messages.length, currentProjectId, projects, updateProjectName, generateProjectName]);

  return (
    <ReactFlowProvider>
      <div 
        className="flex h-screen w-screen overflow-hidden bg-gray-50"
        data-testid="app-container"
      >
        {/* Sidebar - Left Panel (Requirement 1.1) */}
        <Sidebar
          projects={projects}
          currentProjectId={currentProjectId}
          onCreateNew={createProject}
          onSave={saveProject}
          onLoadProject={loadProject}
          onDeleteProject={deleteProject}
        />

        {/* Canvas - Center Panel (Requirement 1.2) */}
        <main className="flex-1 h-full min-w-0">
          <Canvas />
        </main>

        {/* PromptPanel - Right Panel (Requirement 1.3) */}
        <PromptPanel
          messages={messages}
          isLoading={isLoading}
          onSubmit={handlePromptSubmit}
        />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
