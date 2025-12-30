import type { UMLDiagram } from '../types';

/**
 * AI Service Interface
 * Provides a function interface that can be replaced with actual LLM API calls
 */
export interface AIService {
  generateUML: (prompt: string) => Promise<UMLDiagram>;
}

/**
 * Response templates for common prompts
 * Maps keywords to predefined UML diagram responses
 */
const responseTemplates: Record<string, UMLDiagram> = {
  // E-commerce / Shopping system
  ecommerce: {
    classes: [
      {
        id: 'user',
        name: 'User',
        attributes: ['- id: string', '- email: string', '- password: string', '+ name: string'],
        operations: ['+ register()', '+ login()', '+ logout()']
      },
      {
        id: 'product',
        name: 'Product',
        attributes: ['- id: string', '+ name: string', '+ price: number', '+ description: string'],
        operations: ['+ getDetails()', '+ updateStock()']
      },
      {
        id: 'order',
        name: 'Order',
        attributes: ['- id: string', '- userId: string', '+ total: number', '+ status: string'],
        operations: ['+ create()', '+ cancel()', '+ getItems()']
      },
      {
        id: 'cart',
        name: 'ShoppingCart',
        attributes: ['- id: string', '- items: CartItem[]'],
        operations: ['+ addItem()', '+ removeItem()', '+ checkout()']
      }
    ],
    relationships: [
      { source: 'user', target: 'order', type: 'association', label: 'places' },
      { source: 'user', target: 'cart', type: 'composition', label: 'has' },
      { source: 'order', target: 'product', type: 'aggregation', label: 'contains' },
      { source: 'cart', target: 'product', type: 'aggregation', label: 'contains' }
    ]
  },

  // Library system
  library: {
    classes: [
      {
        id: 'book',
        name: 'Book',
        attributes: ['- isbn: string', '+ title: string', '+ author: string', '- available: boolean'],
        operations: ['+ borrow()', '+ return()', '+ getInfo()']
      },
      {
        id: 'member',
        name: 'Member',
        attributes: ['- id: string', '+ name: string', '+ email: string', '- borrowedBooks: Book[]'],
        operations: ['+ register()', '+ borrowBook()', '+ returnBook()']
      },
      {
        id: 'librarian',
        name: 'Librarian',
        attributes: ['- employeeId: string', '+ name: string'],
        operations: ['+ addBook()', '+ removeBook()', '+ manageMember()']
      },
      {
        id: 'loan',
        name: 'Loan',
        attributes: ['- id: string', '- dueDate: Date', '- returnDate: Date'],
        operations: ['+ extend()', '+ calculateFine()']
      }
    ],
    relationships: [
      { source: 'member', target: 'loan', type: 'association', label: 'has' },
      { source: 'loan', target: 'book', type: 'association', label: 'for' },
      { source: 'librarian', target: 'member', type: 'inheritance' },
      { source: 'librarian', target: 'book', type: 'association', label: 'manages' }
    ]
  },

  // Vehicle / Car system
  vehicle: {
    classes: [
      {
        id: 'vehicle',
        name: 'Vehicle',
        attributes: ['# id: string', '# brand: string', '# model: string', '# year: number'],
        operations: ['+ start()', '+ stop()', '+ getInfo()']
      },
      {
        id: 'car',
        name: 'Car',
        attributes: ['- numDoors: number', '- fuelType: string'],
        operations: ['+ openTrunk()', '+ refuel()']
      },
      {
        id: 'motorcycle',
        name: 'Motorcycle',
        attributes: ['- hasSidecar: boolean'],
        operations: ['+ wheelie()']
      },
      {
        id: 'engine',
        name: 'Engine',
        attributes: ['- horsepower: number', '- displacement: number'],
        operations: ['+ ignite()', '+ shutdown()']
      }
    ],
    relationships: [
      { source: 'car', target: 'vehicle', type: 'inheritance' },
      { source: 'motorcycle', target: 'vehicle', type: 'inheritance' },
      { source: 'vehicle', target: 'engine', type: 'composition', label: 'has' }
    ]
  },

  // Default / Simple system
  default: {
    classes: [
      {
        id: 'class1',
        name: 'Entity',
        attributes: ['- id: string', '+ name: string'],
        operations: ['+ create()', '+ update()', '+ delete()']
      },
      {
        id: 'class2',
        name: 'Service',
        attributes: ['- config: object'],
        operations: ['+ process()', '+ validate()']
      }
    ],
    relationships: [
      { source: 'class2', target: 'class1', type: 'association', label: 'manages' }
    ]
  }
};

/**
 * Detects keywords in the prompt to select appropriate template
 */
function detectTemplate(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('shop') || lowerPrompt.includes('ecommerce') || 
      lowerPrompt.includes('e-commerce') || lowerPrompt.includes('store') ||
      lowerPrompt.includes('cart') || lowerPrompt.includes('order') ||
      lowerPrompt.includes('product')) {
    return 'ecommerce';
  }
  
  if (lowerPrompt.includes('library') || lowerPrompt.includes('book') ||
      lowerPrompt.includes('borrow') || lowerPrompt.includes('loan')) {
    return 'library';
  }
  
  if (lowerPrompt.includes('vehicle') || lowerPrompt.includes('car') ||
      lowerPrompt.includes('motorcycle') || lowerPrompt.includes('engine') ||
      lowerPrompt.includes('automobile')) {
    return 'vehicle';
  }
  
  return 'default';
}

/**
 * Configuration for the AI service
 */
export interface AIServiceConfig {
  /** Whether to simulate network delay (default: true) */
  simulateDelay?: boolean;
  /** Minimum delay in ms (default: 500) */
  minDelay?: number;
  /** Maximum delay in ms (default: 1500) */
  maxDelay?: number;
}

const defaultConfig: Required<AIServiceConfig> = {
  simulateDelay: true,
  minDelay: 500,
  maxDelay: 1500,
};

/**
 * Simulates network delay for realistic async behavior
 */
function simulateDelay(config: Required<AIServiceConfig>): Promise<void> {
  if (!config.simulateDelay) {
    return Promise.resolve();
  }
  const delay = config.minDelay + Math.random() * (config.maxDelay - config.minDelay);
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Generates a UML diagram from a natural language prompt
 * This is a simulated implementation that returns predefined responses
 * Can be replaced with actual LLM API calls
 * 
 * @param prompt - Natural language description of the system
 * @param config - Optional configuration for delay simulation
 * @returns Promise resolving to a UMLDiagram
 */
export async function generateUML(prompt: string, config?: AIServiceConfig): Promise<UMLDiagram> {
  const mergedConfig = { ...defaultConfig, ...config };
  
  // Simulate API delay if enabled
  await simulateDelay(mergedConfig);
  
  // Detect which template to use based on prompt keywords
  const templateKey = detectTemplate(prompt);
  
  // Return a deep copy of the template to prevent mutation
  const template = responseTemplates[templateKey];
  return JSON.parse(JSON.stringify(template)) as UMLDiagram;
}

/**
 * Default AI service instance
 */
export const aiService: AIService = {
  generateUML
};

export default aiService;
