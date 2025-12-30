import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateUML, parseToReactFlow } from './umlParser';
import type { UMLDiagram, UMLClass, UMLRelationship, RelationshipType } from '../types';

// ============================================
// Generators for Property-Based Testing
// ============================================

const visibilityMarker = fc.constantFrom('+', '-', '#', '~');
const identifier = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{0,19}$/);
const typeName = fc.constantFrom('int', 'string', 'boolean', 'void', 'Date', 'number');

const attributeGen = fc.tuple(visibilityMarker, identifier, typeName).map(
  ([vis, name, type]) => `${vis} ${name}: ${type}`
);

const operationGen = fc.tuple(visibilityMarker, identifier).map(
  ([vis, name]) => `${vis} ${name}()`
);

const umlClassGen: fc.Arbitrary<UMLClass> = fc.record({
  id: identifier,
  name: identifier.map((name) => name.charAt(0).toUpperCase() + name.slice(1)),
  attributes: fc.array(attributeGen, { minLength: 0, maxLength: 5 }),
  operations: fc.array(operationGen, { minLength: 0, maxLength: 5 }),
});

const relationshipTypeGen: fc.Arbitrary<RelationshipType> = fc.constantFrom(
  'association',
  'inheritance',
  'composition',
  'aggregation'
);

// Generate a valid UML diagram with classes and relationships
const umlDiagramGen: fc.Arbitrary<UMLDiagram> = fc
  .array(umlClassGen, { minLength: 1, maxLength: 5 })
  .chain((classes) => {
    // Ensure unique IDs
    const uniqueClasses = classes.reduce<UMLClass[]>((acc, cls, idx) => {
      const uniqueId = `${cls.id}_${idx}`;
      acc.push({ ...cls, id: uniqueId });
      return acc;
    }, []);

    const classIds = uniqueClasses.map((c) => c.id);

    // Generate relationships only between existing classes
    const relationshipGen: fc.Arbitrary<UMLRelationship> = fc.record({
      source: fc.constantFrom(...classIds),
      target: fc.constantFrom(...classIds),
      type: relationshipTypeGen,
      label: fc.option(identifier, { nil: undefined }),
    });

    return fc.record({
      classes: fc.constant(uniqueClasses),
      relationships: fc.array(relationshipGen, { minLength: 0, maxLength: 5 }),
    });
  });


// ============================================
// Property Tests
// ============================================

describe('UML Parser', () => {
  /**
   * Feature: uml-diagram-generator, Property 1: UML Parser Class Transformation
   * *For any* valid UML JSON with classes, the UML_Parser SHALL produce React Flow nodes
   * where each node contains the corresponding class name, all attributes, and all operations
   * from the source class.
   * **Validates: Requirements 6.1, 6.3, 6.4**
   */
  describe('Property 1: UML Parser Class Transformation', () => {
    it('should transform all classes into nodes preserving name, attributes, and operations', () => {
      fc.assert(
        fc.property(umlDiagramGen, (uml) => {
          // Validate first
          const validation = validateUML(uml);
          expect(validation.valid).toBe(true);

          // Parse to React Flow
          const { nodes } = parseToReactFlow(uml);

          // Property: Number of nodes equals number of classes
          expect(nodes.length).toBe(uml.classes.length);

          // Property: Each class is transformed into a node with matching data
          for (const umlClass of uml.classes) {
            const node = nodes.find((n) => n.id === umlClass.id);
            expect(node).toBeDefined();
            expect(node!.type).toBe('classNode');
            expect(node!.data.name).toBe(umlClass.name);
            expect(node!.data.attributes).toEqual(umlClass.attributes);
            expect(node!.data.operations).toEqual(umlClass.operations);
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});


  /**
   * Feature: uml-diagram-generator, Property 2: UML Parser Relationship Transformation
   * *For any* valid UML JSON with relationships, the UML_Parser SHALL produce React Flow edges
   * where each edge has the correct source, target, relationship type, and label from the
   * source relationship.
   * **Validates: Requirements 6.2, 6.5**
   */
  describe('Property 2: UML Parser Relationship Transformation', () => {
    it('should transform all relationships into edges preserving source, target, type, and label', () => {
      fc.assert(
        fc.property(umlDiagramGen, (uml) => {
          // Validate first
          const validation = validateUML(uml);
          expect(validation.valid).toBe(true);

          // Parse to React Flow
          const { edges } = parseToReactFlow(uml);

          // Property: Number of edges equals number of relationships
          expect(edges.length).toBe(uml.relationships.length);

          // Property: Each relationship is transformed into an edge with matching data
          for (let i = 0; i < uml.relationships.length; i++) {
            const relationship = uml.relationships[i];
            const edge = edges[i];

            expect(edge).toBeDefined();
            expect(edge.source).toBe(relationship.source);
            expect(edge.target).toBe(relationship.target);
            expect(edge.type).toBe('relationshipEdge');
            expect(edge.data?.type).toBe(relationship.type);
            expect(edge.data?.label).toBe(relationship.label);
          }
        }),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Feature: uml-diagram-generator, Property 3: UML Parser Error Handling
   * *For any* invalid JSON input (malformed JSON, missing required fields, invalid types),
   * the UML_Parser SHALL return an error result without throwing an exception.
   * **Validates: Requirements 6.6**
   */
  describe('Property 3: UML Parser Error Handling', () => {
    // Generator for invalid inputs
    const invalidInputGen = fc.oneof(
      // Null or undefined
      fc.constant(null),
      fc.constant(undefined),
      // Primitives
      fc.string(),
      fc.integer(),
      fc.boolean(),
      // Arrays instead of objects
      fc.array(fc.anything()),
      // Objects missing required fields
      fc.record({ classes: fc.constant([]) }), // missing relationships
      fc.record({ relationships: fc.constant([]) }), // missing classes
      // Objects with wrong types for required fields
      fc.record({
        classes: fc.string(), // should be array
        relationships: fc.array(fc.anything()),
      }),
      fc.record({
        classes: fc.array(fc.anything()),
        relationships: fc.integer(), // should be array
      }),
      // Classes with missing fields
      fc.record({
        classes: fc.constant([{ id: 'test' }]), // missing name, attributes, operations
        relationships: fc.constant([]),
      }),
      // Relationships with invalid class references
      fc.record({
        classes: fc.constant([
          { id: 'class1', name: 'Test', attributes: [], operations: [] },
        ]),
        relationships: fc.constant([
          { source: 'nonexistent', target: 'class1', type: 'association' },
        ]),
      })
    );

    it('should return error result without throwing for any invalid input', () => {
      fc.assert(
        fc.property(invalidInputGen, (invalidInput) => {
          // Should not throw
          let result: { valid: boolean; errors: string[] };
          try {
            result = validateUML(invalidInput);
          } catch {
            // If it throws, the property fails
            return false;
          }

          // Should return invalid result with errors
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
