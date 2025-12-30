import { FilePlus, Save } from 'lucide-react';
import { ProjectList } from './ProjectList';
import type { Project } from '../../types';

interface SidebarProps {
  projects: Project[];
  currentProjectId: string | null;
  onCreateNew: () => void;
  onSave: () => void;
  onLoadProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

/**
 * Sidebar component for project management operations.
 * Provides buttons for creating and saving projects,
 * and displays the list of saved projects.
 * 
 * Requirements: 2.1, 2.2, 2.3
 */
export function Sidebar({
  projects,
  currentProjectId,
  onCreateNew,
  onSave,
  onLoadProject,
  onDeleteProject,
}: SidebarProps) {
  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col" data-testid="sidebar">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-800">UML Generator</h1>
      </div>

      {/* Action Buttons */}
      <div className="p-3 space-y-2 border-b border-gray-200">
        <button
          onClick={onCreateNew}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          data-testid="create-new-btn"
        >
          <FilePlus className="w-4 h-4" />
          <span>Create New</span>
        </button>
        <button
          onClick={onSave}
          disabled={!currentProjectId}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
            currentProjectId
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
          data-testid="save-btn"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-3">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Projects
        </h2>
        <ProjectList
          projects={projects}
          currentProjectId={currentProjectId}
          onLoadProject={onLoadProject}
          onDeleteProject={onDeleteProject}
        />
      </div>
    </aside>
  );
}
