import type { StoredProject } from '../types';

const STORAGE_KEY = 'uml-diagram-projects';

/**
 * Result type for storage operations
 */
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Saves a project to localStorage
 * @param project - The project to save
 * @returns StorageResult indicating success or failure
 */
export function saveToStorage(project: StoredProject): StorageResult<void> {
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    let projects: StoredProject[] = [];

    if (existingData) {
      try {
        projects = JSON.parse(existingData);
        if (!Array.isArray(projects)) {
          projects = [];
        }
      } catch {
        projects = [];
      }
    }

    // Find and update existing project or add new one
    const existingIndex = projects.findIndex((p) => p.id === project.id);
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: `Failed to save project: ${message}` };
  }
}

/**
 * Loads all projects from localStorage
 * @returns StorageResult with array of stored projects
 */
export function loadFromStorage(): StorageResult<StoredProject[]> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      return { success: true, data: [] };
    }

    const projects = JSON.parse(data);

    if (!Array.isArray(projects)) {
      return { success: true, data: [] };
    }

    return { success: true, data: projects };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: `Failed to load projects: ${message}` };
  }
}

/**
 * Loads a specific project by ID from localStorage
 * @param id - The project ID to load
 * @returns StorageResult with the project or undefined if not found
 */
export function loadProjectById(id: string): StorageResult<StoredProject | undefined> {
  const result = loadFromStorage();

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const project = result.data?.find((p) => p.id === id);
  return { success: true, data: project };
}

/**
 * Deletes a project from localStorage
 * @param id - The project ID to delete
 * @returns StorageResult indicating success or failure
 */
export function deleteFromStorage(id: string): StorageResult<void> {
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);

    if (!existingData) {
      return { success: true };
    }

    let projects: StoredProject[];
    try {
      projects = JSON.parse(existingData);
      if (!Array.isArray(projects)) {
        return { success: true };
      }
    } catch {
      return { success: true };
    }

    const filteredProjects = projects.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProjects));

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: `Failed to delete project: ${message}` };
  }
}

/**
 * Clears all projects from localStorage
 * @returns StorageResult indicating success or failure
 */
export function clearStorage(): StorageResult<void> {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: `Failed to clear storage: ${message}` };
  }
}
