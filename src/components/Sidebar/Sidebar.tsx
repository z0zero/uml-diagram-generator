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
      className={`h-[96vh] my-[2vh] ml-4 flex flex-col transition-all duration-500 ease-spring glass-dark rounded-2xl border-slate-700/50 ${isCollapsed ? 'w-20' : 'w-72'
        }`}
      data-testid="sidebar"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent whitespace-nowrap">
            UML Gen
          </h1>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors absolute right-4"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3">
        <button
          onClick={onCreateNew}
          className={`w-full flex items-center gap-3 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 group ${isCollapsed ? 'justify-center px-0' : 'justify-start'
            }`}
          title="Create New Project"
        >
          <FilePlus className="w-5 h-5 flex-shrink-0" />
          <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
            New Project
          </span>
        </button>

        <button
          onClick={onSave}
          disabled={!currentProjectId}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${currentProjectId
              ? 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
              : 'bg-white/5 text-slate-600 cursor-not-allowed border border-transparent'
            } ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}
          title="Save Project"
        >
          <Save className="w-5 h-5 flex-shrink-0" />
          <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
            Save Changes
          </span>
        </button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        {!isCollapsed && (
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2 animate-fade-in">
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

      {/* User / Footer Area (Optional - Placeholder) */}
      <div className="p-4 border-t border-white/5">
        <div className={`text-xs text-slate-500 text-center transition-opacity ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          v1.0.0
        </div>
      </div>
    </aside>
  );
}
