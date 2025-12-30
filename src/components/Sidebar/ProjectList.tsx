import { useState } from 'react';
import { Folder, Trash2 } from 'lucide-react';
import type { Project } from '../../types';

interface ProjectListProps {
  projects: Project[];
  currentProjectId: string | null;
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
      <div className="text-gray-500 text-sm text-center py-4">
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
          <li key={project.id}>
            {isConfirmingDelete ? (
              <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700 mb-2">Delete "{project.name}"?</p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleConfirmDelete(project.id, e)}
                    className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    data-testid={`confirm-delete-${project.id}`}
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    data-testid={`cancel-delete-${project.id}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => onLoadProject(project.id)}
                className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                data-testid={`project-item-${project.id}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onLoadProject(project.id);
                  }
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Folder className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate text-sm" data-testid={`project-name-${project.id}`}>
                    {project.name}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteClick(project.id, e)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  aria-label={`Delete ${project.name}`}
                  data-testid={`delete-btn-${project.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
