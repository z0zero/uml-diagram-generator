import { useEffect, useCallback, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Canvas } from './components/Canvas/Canvas';
import { PromptPanel } from './components/PromptPanel/PromptPanel';
import { ApiKeyDialog } from './components/ApiKeyDialog';
import { useDiagramStore, initializeStore } from './store/diagramStore';
import { generateUML, ApiKeyNotConfiguredError } from './services/aiService';
import { getApiKey } from './services/apiKeyService';
import type { Message, DiagramType } from './types';

/**
 * Generates a unique ID for messages
 */
function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Main App component with three-panel layout.
 */
function App() {
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Get state from Zustand store
  const projects = useDiagramStore((state) => state.projects);
  const currentProjectId = useDiagramStore((state) => state.currentProjectId);
  const currentDiagramType = useDiagramStore((state) => state.currentDiagramType);
  const messages = useDiagramStore((state) => state.messages);
  const isLoading = useDiagramStore((state) => state.isLoading);

  // Get actions from Zustand store
  const createProject = useDiagramStore((state) => state.createProject);
  const saveProject = useDiagramStore((state) => state.saveProject);
  const loadProject = useDiagramStore((state) => state.loadProject);
  const deleteProject = useDiagramStore((state) => state.deleteProject);
  const addMessage = useDiagramStore((state) => state.addMessage);
  const setLoading = useDiagramStore((state) => state.setLoading);
  const setDiagramType = useDiagramStore((state) => state.setDiagramType);
  const updateDiagramFromUML = useDiagramStore((state) => state.updateDiagramFromUML);
  const updateProjectName = useDiagramStore((state) => state.updateProjectName);

  // Initialize store on mount
  useEffect(() => {
    initializeStore();

    const apiKey = getApiKey();
    setHasApiKey(!!apiKey);

    if (!apiKey) {
      setIsApiKeyDialogOpen(true);
    }
  }, []);

  const generateProjectName = useCallback((prompt: string): string => {
    const cleaned = prompt.trim().replace(/\s+/g, ' ');
    if (cleaned.length <= 30) {
      return cleaned;
    }
    return cleaned.substring(0, 30).trim() + '...';
  }, []);

  const handleApiKeySave = useCallback(() => {
    setHasApiKey(true);
  }, []);

  const handleDiagramTypeChange = useCallback((type: DiagramType) => {
    setDiagramType(type);
  }, [setDiagramType]);

  const handlePromptSubmit = useCallback(async (prompt: string) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setIsApiKeyDialogOpen(true);
      return;
    }

    const currentProject = projects.find(p => p.id === currentProjectId);
    if (messages.length === 0 && currentProject?.name === 'Untitled Project') {
      updateProjectName(generateProjectName(prompt));
    }

    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };
    addMessage(userMessage);

    setLoading(true);

    try {
      // Pass the current diagram type to generateUML
      const umlDiagram = await generateUML(prompt, currentDiagramType);

      updateDiagramFromUML(umlDiagram);

      // Build a descriptive message based on diagram type
      let description = '';
      switch (umlDiagram.type) {
        case 'class':
          description = `${umlDiagram.classes?.length || 0} classes and ${umlDiagram.relationships?.length || 0} relationships`;
          break;
        case 'useCase':
          description = `${umlDiagram.actors?.length || 0} actors and ${umlDiagram.useCases?.length || 0} use cases`;
          break;
        case 'activity':
          description = `${umlDiagram.activities?.length || 0} activities`;
          break;
        case 'sequence':
          description = `${umlDiagram.participants?.length || 0} participants and ${umlDiagram.messages?.length || 0} messages`;
          break;
        case 'stateMachine':
          description = `${umlDiagram.states?.length || 0} states`;
          break;
        case 'component':
          description = `${umlDiagram.components?.length || 0} components`;
          break;
      }

      const assistantMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: `Generated ${umlDiagram.type} diagram with ${description}.`,
        timestamp: new Date(),
      };
      addMessage(assistantMessage);
    } catch (error) {
      if (error instanceof ApiKeyNotConfiguredError) {
        setIsApiKeyDialogOpen(true);
        setHasApiKey(false);

        const errorMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: 'Please configure your Gemini API key to generate diagrams.',
          timestamp: new Date(),
        };
        addMessage(errorMessage);
      } else {
        const errorMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: error instanceof Error
            ? error.message
            : 'Sorry, there was an error generating the diagram. Please try again.',
          timestamp: new Date(),
        };
        addMessage(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [addMessage, setLoading, updateDiagramFromUML, messages.length, currentProjectId, projects, updateProjectName, generateProjectName, currentDiagramType]);

  return (
    <ReactFlowProvider>
      <div
        className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100"
        data-testid="app-container"
      >
        {/* Decorative Background Gradients */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
        </div>

        {/* Sidebar */}
        <div className="z-10 h-full">
          <Sidebar
            projects={projects}
            currentProjectId={currentProjectId}
            onCreateNew={() => createProject(currentDiagramType)}
            onSave={saveProject}
            onLoadProject={loadProject}
            onDeleteProject={deleteProject}
          />
        </div>

        {/* Canvas */}
        <main className="flex-1 h-full min-w-0 z-0 relative">
          <Canvas />
        </main>

        {/* PromptPanel */}
        <div className="z-10 h-full">
          <PromptPanel
            messages={messages}
            isLoading={isLoading}
            onSubmit={handlePromptSubmit}
            hasApiKey={hasApiKey}
            onSettingsClick={() => setIsApiKeyDialogOpen(true)}
            currentDiagramType={currentDiagramType}
            onDiagramTypeChange={handleDiagramTypeChange}
          />
        </div>

        {/* API Key Dialog */}
        <ApiKeyDialog
          isOpen={isApiKeyDialogOpen}
          onClose={() => setIsApiKeyDialogOpen(false)}
          onSave={handleApiKeySave}
        />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
