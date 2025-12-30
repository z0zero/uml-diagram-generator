import dagre from 'dagre';
import type { DiagramNode, DiagramEdge, DiagramType } from '../types';

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
 * Default layout configurations for different diagram types
 */
export const LAYOUT_CONFIGS: Record<DiagramType, LayoutConfig> = {
  class: {
    rankdir: 'TB',
    nodesep: 80,
    ranksep: 100,
    nodeWidth: 200,
    nodeHeight: 150,
  },
  useCase: {
    rankdir: 'LR',
    nodesep: 60,
    ranksep: 150,
    nodeWidth: 120,
    nodeHeight: 80,
  },
  activity: {
    rankdir: 'TB',
    nodesep: 50,
    ranksep: 80,
    nodeWidth: 120,
    nodeHeight: 50,
  },
  sequence: {
    rankdir: 'LR',
    nodesep: 100,
    ranksep: 50,
    nodeWidth: 150,
    nodeHeight: 250,
  },
  stateMachine: {
    rankdir: 'LR',
    nodesep: 80,
    ranksep: 120,
    nodeWidth: 140,
    nodeHeight: 60,
  },
  component: {
    rankdir: 'TB',
    nodesep: 80,
    ranksep: 100,
    nodeWidth: 160,
    nodeHeight: 100,
  },
};

export const DEFAULT_LAYOUT_CONFIG = LAYOUT_CONFIGS.class;

// ============================================
// Layout Engine Functions
// ============================================

/**
 * Determines the appropriate layout config based on node types
 */
function detectDiagramType(nodes: DiagramNode[]): DiagramType {
  if (nodes.length === 0) return 'class';

  const firstNodeType = nodes[0].type;

  switch (firstNodeType) {
    case 'classNode':
      return 'class';
    case 'actorNode':
    case 'useCaseNode':
      return 'useCase';
    case 'activityNode':
      return 'activity';
    case 'participantNode':
      return 'sequence';
    case 'stateNode':
      return 'stateMachine';
    case 'componentNode':
      return 'component';
    default:
      return 'class';
  }
}

/**
 * Calculates positions for nodes using Dagre hierarchical layout algorithm.
 * Auto-detects diagram type for appropriate layout configuration.
 */
export function calculateLayout(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  config?: LayoutConfig
): DiagramNode[] {
  if (nodes.length === 0) {
    return [];
  }

  // Auto-detect diagram type if no config provided
  const diagramType = detectDiagramType(nodes);
  const layoutConfig = config || LAYOUT_CONFIGS[diagramType];

  // Create a new directed graph
  const graph = new dagre.graphlib.Graph();

  // Set graph configuration
  graph.setGraph({
    rankdir: layoutConfig.rankdir,
    nodesep: layoutConfig.nodesep,
    ranksep: layoutConfig.ranksep,
  });

  graph.setDefaultEdgeLabel(() => ({}));

  // Add nodes to the graph with type-specific dimensions
  for (const node of nodes) {
    const dimensions = getNodeDimensions(node.type as string, layoutConfig);
    graph.setNode(node.id, dimensions);
  }

  // Add edges to the graph
  for (const edge of edges) {
    if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
      graph.setEdge(edge.source, edge.target);
    }
  }

  // Run the dagre layout algorithm
  dagre.layout(graph);

  // Create new nodes with calculated positions
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = graph.node(node.id);
    const dimensions = getNodeDimensions(node.type as string, layoutConfig);

    // Dagre returns center positions, convert to top-left for React Flow
    const x = nodeWithPosition.x - dimensions.width / 2;
    const y = nodeWithPosition.y - dimensions.height / 2;

    return {
      ...node,
      position: { x, y },
    };
  });

  return layoutedNodes as DiagramNode[];
}

/**
 * Gets node dimensions based on node type
 */
function getNodeDimensions(nodeType: string, config: LayoutConfig): { width: number; height: number } {
  switch (nodeType) {
    case 'actorNode':
      return { width: 60, height: 80 };
    case 'useCaseNode':
      return { width: 140, height: 60 };
    case 'activityNode':
      return { width: 120, height: 50 };
    case 'participantNode':
      return { width: 150, height: 250 };
    case 'stateNode':
      return { width: 140, height: 60 };
    case 'componentNode':
      return { width: 160, height: 100 };
    case 'classNode':
    default:
      return { width: config.nodeWidth, height: config.nodeHeight };
  }
}

/**
 * Gets the spacing between two adjacent nodes in the layout.
 */
export function getNodeSpacing(
  node1: DiagramNode,
  node2: DiagramNode,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): { horizontal: number; vertical: number } {
  const node1Right = node1.position.x + config.nodeWidth;
  const node1Bottom = node1.position.y + config.nodeHeight;
  const node2Right = node2.position.x + config.nodeWidth;
  const node2Bottom = node2.position.y + config.nodeHeight;

  let horizontal = 0;
  if (node2.position.x >= node1Right) {
    horizontal = node2.position.x - node1Right;
  } else if (node1.position.x >= node2Right) {
    horizontal = node1.position.x - node2Right;
  }

  let vertical = 0;
  if (node2.position.y >= node1Bottom) {
    vertical = node2.position.y - node1Bottom;
  } else if (node1.position.y >= node2Bottom) {
    vertical = node1.position.y - node2Bottom;
  }

  return { horizontal, vertical };
}
