import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { ProjectList } from './ProjectList';
import type { Project } from '../../types';

// ============================================
// Generators for Property-Based Testing
// ============================================

const identifier = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{0,19}$/);

const projectGen: fc.Arbitrary<Project> = fc.record({
  id: identifier,
  name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

// Generate array of projects with unique IDs
const projectsArrayGen: fc.Arbitrary<Project[]> = fc
  .array(projectGen, { minLength: 0, maxLength: 10 })
  .map((projects) =>
    projects.map((project, idx) => ({
      ...project,
      id: `${project.id}_${idx}`,
    }))
  );

// ============================================
// Property Tests
// ============================================

describe('ProjectList Component', () => {
  /**
   * Feature: uml-diagram-generator, Property 7: Project List Display Completeness
   * *For any* set of saved projects, the displayed project list SHALL contain
   * all project names from the saved projects.
   * **Validates: Requirements 2.3**
   */
  describe('Property 7: Project List Display Completeness', () => {
    it('should display all project names for any set of saved projects', () => {
      fc.assert(
        fc.property(projectsArrayGen, (projects) => {
          const mockOnLoadProject = vi.fn();
          const mockOnDeleteProject = vi.fn();

          const { unmount } = render(
            <ProjectList
              projects={projects}
              currentProjectId={null}
              onLoadProject={mockOnLoadProject}
              onDeleteProject={mockOnDeleteProject}
            />
          );

          if (projects.length === 0) {
            // When no projects, should show empty message
            const emptyMessage = screen.getByText('No saved projects');
            expect(emptyMessage).toBeDefined();
            expect(emptyMessage).not.toBeNull();
          } else {
            // Property: All project names are displayed
            for (const project of projects) {
              const nameElement = screen.getByTestId(`project-name-${project.id}`);
              expect(nameElement).toBeDefined();
              expect(nameElement).not.toBeNull();
              expect(nameElement.textContent).toBe(project.name);
            }

            // Property: The number of displayed projects matches the input
            const projectList = screen.getByTestId('project-list');
            const listItems = projectList.querySelectorAll('li');
            expect(listItems.length).toBe(projects.length);
          }

          // Cleanup for next iteration
          unmount();
        }),
        { numRuns: 100 }
      );
    });
  });
});
