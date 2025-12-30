import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateUML } from './umlParser';
import type { UMLDiagram, RelationshipType } from '../types';

// ============================================
// Sample UML Diagram for Tests
// ============================================

const sampleUMLDiagram: UMLDiagram = {
  classes: [
    {
      id: 'user',
      name: 'User',
      attributes: ['- id: string', '+ name: string', '+ email: string'],
      operations: ['+ register()', '+ login()'],
    },
    {
      id: 'product',
      name: 'Product',
      attributes: ['- id: string', '+ name: string', '+ price: number'],
      operations: ['+ getDetails()'],
    },
    {
      id: 'order',
      name: 'Order',
      attributes: ['- id: string', '+ total: number', '+ status: string'],
      operations: ['+ create()', '+ cancel()'],
    },
  ],
  relationships: [
    { source: 'user', target: 'order', type: 'association', label: 'places' },
    { source: 'order', target: 'product', type: 'aggregation', label: 'contains' },
  ],
};

// ============================================
// Helper Functions for Schema Validation
// ============================================

/**
 * Validates that a UMLDiagram conforms to the expected schema
 */
function isValidUMLDiagramSchema(diagram: UMLDiagram): boolean {
  // Must have classes array
  if (!Array.isArray(diagram.classes)) {
    return false;
  }

  // Must have relationships array
  if (!Array.isArray(diagram.relationships)) {
    return false;
  }

  // Validate each class
  for (const cls of diagram.classes) {
    if (typeof cls.id !== 'string' || cls.id.length === 0) return false;
    if (typeof cls.name !== 'string' || cls.name.length === 0) return false;
    if (!Array.isArray(cls.attributes)) return false;
    if (!Array.isArray(cls.operations)) return false;

    // All attributes must be strings
    if (!cls.attributes.every((attr) => typeof attr === 'string')) return false;
    // All operations must be strings
    if (!cls.operations.every((op) => typeof op === 'string')) return false;
  }

  // Validate each relationship
  const validTypes: RelationshipType[] = ['association', 'inheritance', 'composition', 'aggregation'];
  const classIds = new Set(diagram.classes.map((c) => c.id));

  for (const rel of diagram.relationships) {
    if (typeof rel.source !== 'string') return false;
    if (typeof rel.target !== 'string') return false;
    if (!validTypes.includes(rel.type)) return false;
    if (rel.label !== undefined && typeof rel.label !== 'string') return false;

    // Source and target must reference existing classes
    if (!classIds.has(rel.source)) return false;
    if (!classIds.has(rel.target)) return false;
  }

  return true;
}

// ============================================
// Tests
// ============================================

describe('AI Service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('UML Schema Validation', () => {
    it('should validate a correct UML diagram schema', () => {
      expect(isValidUMLDiagramSchema(sampleUMLDiagram)).toBe(true);

      const validation = validateUML(sampleUMLDiagram);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject an invalid UML diagram (missing classes)', () => {
      const invalid = { relationships: [] } as unknown as UMLDiagram;
      expect(isValidUMLDiagramSchema(invalid)).toBe(false);
    });

    it('should reject an invalid UML diagram (missing relationships)', () => {
      const invalid = { classes: [] } as unknown as UMLDiagram;
      expect(isValidUMLDiagramSchema(invalid)).toBe(false);
    });

    it('should reject classes with empty id', () => {
      const invalid: UMLDiagram = {
        classes: [{ id: '', name: 'Test', attributes: [], operations: [] }],
        relationships: [],
      };
      expect(isValidUMLDiagramSchema(invalid)).toBe(false);
    });

    it('should reject classes with empty name', () => {
      const invalid: UMLDiagram = {
        classes: [{ id: 'test', name: '', attributes: [], operations: [] }],
        relationships: [],
      };
      expect(isValidUMLDiagramSchema(invalid)).toBe(false);
    });

    it('should reject invalid relationship types', () => {
      const invalid: UMLDiagram = {
        classes: [
          { id: 'a', name: 'A', attributes: [], operations: [] },
          { id: 'b', name: 'B', attributes: [], operations: [] },
        ],
        relationships: [
          { source: 'a', target: 'b', type: 'invalid' as RelationshipType },
        ],
      };
      expect(isValidUMLDiagramSchema(invalid)).toBe(false);
    });

    it('should reject relationships referencing non-existent classes', () => {
      const invalid: UMLDiagram = {
        classes: [{ id: 'a', name: 'A', attributes: [], operations: [] }],
        relationships: [
          { source: 'a', target: 'nonexistent', type: 'association' },
        ],
      };
      expect(isValidUMLDiagramSchema(invalid)).toBe(false);
    });
  });

  describe('Error Classes', () => {
    it('should export ApiKeyNotConfiguredError', async () => {
      const { ApiKeyNotConfiguredError } = await import('./aiService');
      expect(ApiKeyNotConfiguredError).toBeDefined();

      const error = new ApiKeyNotConfiguredError();
      expect(error.name).toBe('ApiKeyNotConfiguredError');
      expect(error.message).toContain('API key');
    });

    it('should export UMLGenerationError', async () => {
      const { UMLGenerationError } = await import('./aiService');
      expect(UMLGenerationError).toBeDefined();

      const error = new UMLGenerationError('Test error');
      expect(error.name).toBe('UMLGenerationError');
      expect(error.message).toBe('Test error');
    });
  });

  describe('Service Interface', () => {
    it('should export generateUML function', async () => {
      const { generateUML } = await import('./aiService');
      expect(typeof generateUML).toBe('function');
    });

    it('should export aiService object with generateUML method', async () => {
      const { aiService } = await import('./aiService');
      expect(aiService).toBeDefined();
      expect(typeof aiService.generateUML).toBe('function');
    });
  });
});
