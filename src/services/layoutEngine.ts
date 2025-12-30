import dagre from 'dagre';
import type { ClassNode, RelationshipEdge } from '../types';

// ============================================
// Layout Configuration
// ============================================

/**
 * Configuration options for the Dagre layout engine
 */
export interface LayoutConfig {
  /** Direction of the layout: 'TB' (top-bottom), 'BT', 'LR', 'RL' */
  rankdir: 'TB' | 'BT' | 'LR' | 'RL';
  /** Horizontal spacing between nodes */
  nodesep: number;
  /** Vertical spacing between ranks */
  ranksep: number;
  /** Default node width for layout calculation */
  nodeWidth: number;
  /** Default node height for layout calculation */
  nodeHeight: number;
}

/**
 * Default layout configuration for UML diagrams
 * - Hierarchical top-to-bottom layout
 * - Consistent spacing between nodes
 */
export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  rankdir: 'TB',
  nodesep: 80,
  ranksep: 100,
  nodeWidth: 200,
  nodeHeight: 150,
};

// ============================================
// Layout Engine Functions
// ============================================

/**
 * Calculates positions for nodes using Dagre hierarchical layout algorithm.
 * 
 * The layout engine:
 * - Arranges nodes to minimize edge crossings
 * - Maintains consistent spacing between nodes
 * - Positions nodes in a hierarchical layout based on relationships
 * 
 * @param nodes - Array of class nodes to position
 * @param edges - Array of relationship edges defining connections
 * @param config - Optional layout configuration (defaults to DEFAULT_LAYOUT_CONFIG)
 * @returns New array of nodes with calculated positions
 */
export function calculateLayout(
  nodes: ClassNode[],
  edges: RelationshipEdge[],
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): ClassNode[] {
  // Handle empty nodes case
  if (nodes.length === 0) {
    return [];
  }

  // Create a new directed graph
  const graph = new dagre.graphlib.Graph();
  
  // Set graph configuration
  graph.setGraph({
    rankdir: config.rankdir,
    nodesep: config.nodesep,
    ranksep: config.ranksep,
  });
  
  // Required for dagre
  graph.setDefaultEdgeLabel(() => ({}));

  // Add nodes to the graph
  for (const node of nodes) {
    graph.setNode(node.id, {
      width: config.nodeWidth,
      height: config.nodeHeight,
    });
  }

  // Add edges to the graph
  for (const edge of edges) {
    // Only add edge if both source and target nodes exist
    if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
      graph.setEdge(edge.source, edge.target);
    }
  }

  // Run the dagre layout algorithm
  dagre.layout(graph);

  // Create new nodes with calculated positions
  const layoutedNodes: ClassNode[] = nodes.map((node) => {
    const nodeWithPosition = graph.node(node.id);
    
    // Dagre returns center positions, convert to top-left for React Flow
    const x = nodeWithPosition.x - config.nodeWidth / 2;
    const y = nodeWithPosition.y - config.nodeHeight / 2;

    return {
      ...node,
      position: { x, y },
    };
  });

  return layoutedNodes;
}

/**
 * Gets the spacing between two adjacent nodes in the layout.
 * Useful for verifying consistent spacing property.
 * 
 * @param node1 - First node
 * @param node2 - Second node
 * @param config - Layout configuration for node dimensions
 * @returns Object with horizontal and vertical spacing
 */
export function getNodeSpacing(
  node1: ClassNode,
  node2: ClassNode,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): { horizontal: number; vertical: number } {
  // Calculate the gap between node boundaries
  const node1Right = node1.position.x + config.nodeWidth;
  const node1Bottom = node1.position.y + config.nodeHeight;
  const node2Right = node2.position.x + config.nodeWidth;
  const node2Bottom = node2.position.y + config.nodeHeight;

  // Horizontal spacing (gap between closest horizontal edges)
  let horizontal = 0;
  if (node2.position.x >= node1Right) {
    horizontal = node2.position.x - node1Right;
  } else if (node1.position.x >= node2Right) {
    horizontal = node1.position.x - node2Right;
  }

  // Vertical spacing (gap between closest vertical edges)
  let vertical = 0;
  if (node2.position.y >= node1Bottom) {
    vertical = node2.position.y - node1Bottom;
  } else if (node1.position.y >= node2Bottom) {
    vertical = node1.position.y - node2Bottom;
  }

  return { horizontal, vertical };
}
