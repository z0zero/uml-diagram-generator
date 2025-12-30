import { useState } from 'react';
import { Folder, Trash2, X, Check } from 'lucide-react';
import type { Project } from '../../types';

interface ProjectListProps {
  projects: Project[];
  currentProjectId: string | null;
  isCollapsed: boolean;
  onLoadProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

/**
 * ProjectList component displays a list of saved projects
 * with selection and deletion capabilities.
 * 
 * Requirements: 2.3, 2.4, 2.5
 */
export function ProjectList({
  projects,
  currentProjectId,
  isCollapsed,
  onLoadProject,
  onDeleteProject,
}: ProjectListProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteClick = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(projectId);
  };

  const handleConfirmDelete = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteProject(projectId);
    setDeleteConfirmId(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(null);
  };

  if (projects.length === 0) {
    return (
      <div className={`text-slate-500 text-xs text-center py-4 ${isCollapsed ? 'hidden' : 'block'}`}>
        No saved projects
      </div>
    );
  }

  return (
    <ul className="space-y-1" data-testid="project-list">
      {projects.map((project) => {
        const isSelected = project.id === currentProjectId;
        const isConfirmingDelete = deleteConfirmId === project.id;

        return (
          <li key={project.id} className="relative group">
            {isConfirmingDelete ? (
              <div className={`p-2 bg-red-900/20 border border-red-500/30 rounded-lg ${isCollapsed ? 'absolute left-0 top-0 z-50 w-48 shadow-xl backdrop-blur-md bg-slate-900' : ''}`}>
                {!isCollapsed && <p className="text-xs text-red-300 mb-2">Delete "{project.name}"?</p>}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleConfirmDelete(project.id, e)}
                    className="flex-1 flex items-center justify-center px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    title="Confirm Delete"
                  >
                    {isCollapsed ? <Check className="w-3 h-3" /> : 'Delete'}
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 flex items-center justify-center px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
                    title="Cancel"
                  >
                    {isCollapsed ? <X className="w-3 h-3" /> : 'Cancel'}
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => onLoadProject(project.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all duration-200 cursor-pointer border ${isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                    : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:border-white/10'
                  }`}
                data-testid={`project-item-${project.id}`}
                role="button"
                tabIndex={0}
                title={project.name}
              >
                <Folder className={`w-4 h-4 flex-shrink-0 transition-colors ${isSelected ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'}`} />

                <span
                  className={`truncate text-sm transition-all duration-300 ${isCollapsed
                      ? 'w-0 opacity-0 overflow-hidden'
                      : 'w-auto opacity-100 flex-1'
                    }`}
                >
                  {project.name}
                </span>

                {!isCollapsed && (
                  <button
                    onClick={(e) => handleDeleteClick(project.id, e)}
                    className="p-1 text-slate-500 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                    aria-label={`Delete ${project.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
