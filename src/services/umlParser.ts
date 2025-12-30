import type {
  UMLDiagram,
  UMLClass,
  UMLRelationship,
  ClassNode,
  RelationshipEdge,
  ClassNodeData,
  RelationshipEdgeData,
  RelationshipType,
} from '../types';

// ============================================
// Validation Types
// ============================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ============================================
// Validation Functions
// ============================================

const VALID_RELATIONSHIP_TYPES: RelationshipType[] = [
  'association',
  'inheritance',
  'composition',
  'aggregation',
];

function isValidRelationshipType(type: unknown): type is RelationshipType {
  return typeof type === 'string' && VALID_RELATIONSHIP_TYPES.includes(type as RelationshipType);
}

function validateClass(cls: unknown, index: number): string[] {
  const errors: string[] = [];
  const prefix = `classes[${index}]`;

  if (typeof cls !== 'object' || cls === null) {
    errors.push(`${prefix}: Expected object, got ${cls === null ? 'null' : typeof cls}`);
    return errors;
  }

  const classObj = cls as Record<string, unknown>;

  if (typeof classObj.id !== 'string') {
    errors.push(`${prefix}: Missing required field: id`);
  }

  if (typeof classObj.name !== 'string') {
    errors.push(`${prefix}: Missing required field: name`);
  }

  if (!Array.isArray(classObj.attributes)) {
    errors.push(`${prefix}: Missing required field: attributes`);
  } else if (!classObj.attributes.every((attr) => typeof attr === 'string')) {
    errors.push(`${prefix}.attributes: Expected array of strings`);
  }

  if (!Array.isArray(classObj.operations)) {
    errors.push(`${prefix}: Missing required field: operations`);
  } else if (!classObj.operations.every((op) => typeof op === 'string')) {
    errors.push(`${prefix}.operations: Expected array of strings`);
  }

  return errors;
}


function validateRelationship(
  rel: unknown,
  index: number,
  classIds: Set<string>
): string[] {
  const errors: string[] = [];
  const prefix = `relationships[${index}]`;

  if (typeof rel !== 'object' || rel === null) {
    errors.push(`${prefix}: Expected object, got ${rel === null ? 'null' : typeof rel}`);
    return errors;
  }

  const relObj = rel as Record<string, unknown>;

  if (typeof relObj.source !== 'string') {
    errors.push(`${prefix}: Missing required field: source`);
  } else if (!classIds.has(relObj.source)) {
    errors.push(`${prefix}: Invalid class reference: ${relObj.source}`);
  }

  if (typeof relObj.target !== 'string') {
    errors.push(`${prefix}: Missing required field: target`);
  } else if (!classIds.has(relObj.target)) {
    errors.push(`${prefix}: Invalid class reference: ${relObj.target}`);
  }

  if (!isValidRelationshipType(relObj.type)) {
    errors.push(`${prefix}: Missing required field: type`);
  }

  if (relObj.label !== undefined && typeof relObj.label !== 'string') {
    errors.push(`${prefix}.label: Expected string, got ${typeof relObj.label}`);
  }

  return errors;
}

/**
 * Validates UML JSON data against the expected schema
 * @param data - Unknown data to validate
 * @returns ValidationResult with valid flag and any errors
 */
export function validateUML(data: unknown): ValidationResult {
  const errors: string[] = [];

  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    return {
      valid: false,
      errors: ['Invalid JSON syntax'],
    };
  }

  const obj = data as Record<string, unknown>;

  // Check for classes array
  if (!Array.isArray(obj.classes)) {
    errors.push('Missing required field: classes');
  }

  // Check for relationships array
  if (!Array.isArray(obj.relationships)) {
    errors.push('Missing required field: relationships');
  }

  // If basic structure is invalid, return early
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const classes = obj.classes as unknown[];
  const relationships = obj.relationships as unknown[];

  // Validate each class
  const classIds = new Set<string>();
  for (let i = 0; i < classes.length; i++) {
    const classErrors = validateClass(classes[i], i);
    errors.push(...classErrors);
    
    // Collect valid class IDs for relationship validation
    const cls = classes[i] as Record<string, unknown>;
    if (typeof cls?.id === 'string') {
      classIds.add(cls.id);
    }
  }

  // Validate each relationship
  for (let i = 0; i < relationships.length; i++) {
    const relErrors = validateRelationship(relationships[i], i, classIds);
    errors.push(...relErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}


// ============================================
// Transformation Functions
// ============================================

/**
 * Transforms a UML class into a React Flow node
 */
function classToNode(umlClass: UMLClass): ClassNode {
  const data: ClassNodeData = {
    name: umlClass.name,
    attributes: [...umlClass.attributes],
    operations: [...umlClass.operations],
  };

  return {
    id: umlClass.id,
    type: 'classNode',
    position: { x: 0, y: 0 }, // Position will be set by layout engine
    data,
  };
}

/**
 * Transforms a UML relationship into a React Flow edge
 */
function relationshipToEdge(relationship: UMLRelationship, index: number): RelationshipEdge {
  const data: RelationshipEdgeData = {
    type: relationship.type,
    label: relationship.label,
  };

  return {
    id: `edge-${relationship.source}-${relationship.target}-${index}`,
    source: relationship.source,
    target: relationship.target,
    type: 'relationshipEdge',
    data,
  };
}

export interface ParseResult {
  nodes: ClassNode[];
  edges: RelationshipEdge[];
}

/**
 * Parses a validated UML diagram into React Flow nodes and edges
 * @param uml - A valid UMLDiagram object
 * @returns ParseResult with nodes and edges arrays
 */
export function parseToReactFlow(uml: UMLDiagram): ParseResult {
  const nodes: ClassNode[] = uml.classes.map(classToNode);
  const edges: RelationshipEdge[] = uml.relationships.map(relationshipToEdge);

  return { nodes, edges };
}

/**
 * Validates and parses UML JSON data in one step
 * @param data - Unknown data to validate and parse
 * @returns Either a ParseResult or ValidationResult with errors
 */
export function validateAndParse(
  data: unknown
): { success: true; result: ParseResult } | { success: false; errors: string[] } {
  const validation = validateUML(data);

  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }

  const result = parseToReactFlow(data as UMLDiagram);
  return { success: true, result };
}
