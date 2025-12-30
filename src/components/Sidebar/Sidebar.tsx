import { useState } from 'react';
import { FilePlus, Save, ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
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
 * Redesigned with glassmorphism and collapsible state.
 */
export function Sidebar({
  projects,
  currentProjectId,
  onCreateNew,
  onSave,
  onLoadProject,
  onDeleteProject,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`h-full flex flex-col transition-all duration-500 ease-spring glass-dark border-r border-slate-700/50 ${isCollapsed ? 'w-16' : 'w-56'}`}
      data-testid="sidebar"
    >
      {/* Header */}
      <div className="p-3 border-b border-white/5 flex items-center gap-2 relative">
        <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          <div className="p-1.5 bg-indigo-500/20 rounded-lg flex-shrink-0">
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
          </div>
          <h1 className="text-base font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent whitespace-nowrap">
            UML Gen
          </h1>
        </div>
        {isCollapsed && (
          <div className="p-1.5 bg-indigo-500/20 rounded-lg mx-auto">
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors ${isCollapsed ? 'mx-auto' : 'ml-auto'}`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="p-3 space-y-2">
        <button
          onClick={onCreateNew}
          className={`w-full flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all duration-300 ${isCollapsed ? 'justify-center px-2' : 'justify-start'}`}
          title="Create New Project"
        >
          <FilePlus className="w-4 h-4 flex-shrink-0" />
          <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'hidden' : 'block'}`}>
            New Project
          </span>
        </button>

        <button
          onClick={onSave}
          disabled={!currentProjectId}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${currentProjectId
              ? 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              : 'bg-white/5 text-slate-600 cursor-not-allowed border border-transparent'
            } ${isCollapsed ? 'justify-center px-2' : 'justify-start'}`}
          title="Save Project"
        >
          <Save className="w-4 h-4 flex-shrink-0" />
          <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'hidden' : 'block'}`}>
            Save Changes
          </span>
        </button>
      </div>

      {/* Projects List */}
      <div className="px-3 py-2 scrollbar-thin">
        {!isCollapsed && (
          <h2 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
            Recent Projects
          </h2>
        )}
        <ProjectList
          projects={projects}
          currentProjectId={currentProjectId}
          isCollapsed={isCollapsed}
          onLoadProject={onLoadProject}
          onDeleteProject={onDeleteProject}
        />
      </div>

      {/* Spacer to push footer to bottom */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="p-3 border-t border-white/5">
        <div className={`text-[10px] text-slate-600 text-center transition-opacity ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          v1.0.0
        </div>
      </div>
    </aside>
  );
}
