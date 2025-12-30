import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateUML } from './aiService';
import { validateUML } from './umlParser';
import type { UMLDiagram, RelationshipType } from '../types';

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
// Generators for Property-Based Testing
// ============================================

// Generator for random prompts
const promptGen = fc.oneof(
  // Keywords that should trigger specific templates
  fc.constantFrom(
    'Create a shopping cart system',
    'Design an e-commerce platform',
    'Build a product catalog with orders',
    'Library management system',
    'Book borrowing application',
    'Vehicle rental system',
    'Car dealership management',
    'Motorcycle inventory'
  ),
  // Random strings that should fall back to default
  fc.string({ minLength: 1, maxLength: 100 }),
  // Empty-ish strings
  fc.constantFrom('', ' ', 'hello', 'test', 'random words here')
);

// ============================================
// Property Tests
// ============================================

describe('AI Service', () => {
  /**
   * Feature: uml-diagram-generator, Property 12: AI Response Schema Conformance
   * *For any* prompt submitted, the simulated AI response SHALL conform to the UMLDiagram
   * JSON schema (valid classes array and relationships array).
   * **Validates: Requirements 5.1, 5.3**
   */
  describe('Property 12: AI Response Schema Conformance', () => {
    it('should return a valid UMLDiagram schema for any prompt', async () => {
      await fc.assert(
        fc.asyncProperty(promptGen, async (prompt) => {
          // Generate UML from prompt (disable delay for testing)
          const result = await generateUML(prompt, { simulateDelay: false });

          // Property: Result must conform to UMLDiagram schema
          expect(isValidUMLDiagramSchema(result)).toBe(true);

          // Property: Result must pass the UML parser validation
          const validation = validateUML(result);
          expect(validation.valid).toBe(true);
          expect(validation.errors).toHaveLength(0);

          // Property: Must have at least one class
          expect(result.classes.length).toBeGreaterThan(0);

          // Property: Classes array must exist and be an array
          expect(Array.isArray(result.classes)).toBe(true);

          // Property: Relationships array must exist and be an array
          expect(Array.isArray(result.relationships)).toBe(true);

          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});
