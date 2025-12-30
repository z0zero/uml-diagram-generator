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

  // Blog / CMS system
  blog: {
    classes: [
      {
        id: 'user',
        name: 'User',
        attributes: ['- id: string', '+ username: string', '+ email: string', '- role: string'],
        operations: ['+ login()', '+ logout()', '+ updateProfile()']
      },
      {
        id: 'post',
        name: 'Post',
        attributes: ['- id: string', '+ title: string', '+ content: string', '+ publishedAt: Date', '- status: string'],
        operations: ['+ publish()', '+ unpublish()', '+ edit()']
      },
      {
        id: 'comment',
        name: 'Comment',
        attributes: ['- id: string', '+ content: string', '+ createdAt: Date'],
        operations: ['+ edit()', '+ delete()']
      },
      {
        id: 'category',
        name: 'Category',
        attributes: ['- id: string', '+ name: string', '+ description: string'],
        operations: ['+ getPosts()']
      },
      {
        id: 'tag',
        name: 'Tag',
        attributes: ['- id: string', '+ name: string'],
        operations: ['+ getPosts()']
      }
    ],
    relationships: [
      { source: 'user', target: 'post', type: 'association', label: 'writes' },
      { source: 'user', target: 'comment', type: 'association', label: 'writes' },
      { source: 'post', target: 'comment', type: 'composition', label: 'has' },
      { source: 'post', target: 'category', type: 'association', label: 'belongs to' },
      { source: 'post', target: 'tag', type: 'aggregation', label: 'tagged with' }
    ]
  },

  // Hospital / Healthcare system
  hospital: {
    classes: [
      {
        id: 'person',
        name: 'Person',
        attributes: ['# id: string', '# name: string', '# dateOfBirth: Date', '# phone: string'],
        operations: ['+ getAge()', '+ updateContact()']
      },
      {
        id: 'patient',
        name: 'Patient',
        attributes: ['- medicalRecordNo: string', '- bloodType: string', '- allergies: string[]'],
        operations: ['+ getHistory()', '+ scheduleAppointment()']
      },
      {
        id: 'doctor',
        name: 'Doctor',
        attributes: ['- licenseNo: string', '- specialization: string', '- department: string'],
        operations: ['+ diagnose()', '+ prescribe()', '+ getSchedule()']
      },
      {
        id: 'appointment',
        name: 'Appointment',
        attributes: ['- id: string', '+ dateTime: Date', '+ status: string', '+ notes: string'],
        operations: ['+ confirm()', '+ cancel()', '+ reschedule()']
      },
      {
        id: 'prescription',
        name: 'Prescription',
        attributes: ['- id: string', '+ medication: string', '+ dosage: string', '+ duration: string'],
        operations: ['+ refill()', '+ cancel()']
      }
    ],
    relationships: [
      { source: 'patient', target: 'person', type: 'inheritance' },
      { source: 'doctor', target: 'person', type: 'inheritance' },
      { source: 'patient', target: 'appointment', type: 'association', label: 'schedules' },
      { source: 'doctor', target: 'appointment', type: 'association', label: 'attends' },
      { source: 'doctor', target: 'prescription', type: 'association', label: 'writes' },
      { source: 'patient', target: 'prescription', type: 'association', label: 'receives' }
    ]
  },

  // School / Education system
  school: {
    classes: [
      {
        id: 'person',
        name: 'Person',
        attributes: ['# id: string', '# name: string', '# email: string'],
        operations: ['+ getInfo()']
      },
      {
        id: 'student',
        name: 'Student',
        attributes: ['- studentId: string', '- enrollmentDate: Date', '- gpa: number'],
        operations: ['+ enroll()', '+ drop()', '+ getTranscript()']
      },
      {
        id: 'teacher',
        name: 'Teacher',
        attributes: ['- employeeId: string', '- department: string', '- salary: number'],
        operations: ['+ teach()', '+ gradeAssignment()']
      },
      {
        id: 'course',
        name: 'Course',
        attributes: ['- id: string', '+ name: string', '+ credits: number', '+ description: string'],
        operations: ['+ addStudent()', '+ removeStudent()', '+ getSyllabus()']
      },
      {
        id: 'enrollment',
        name: 'Enrollment',
        attributes: ['- id: string', '+ grade: string', '+ semester: string'],
        operations: ['+ updateGrade()']
      }
    ],
    relationships: [
      { source: 'student', target: 'person', type: 'inheritance' },
      { source: 'teacher', target: 'person', type: 'inheritance' },
      { source: 'teacher', target: 'course', type: 'association', label: 'teaches' },
      { source: 'student', target: 'enrollment', type: 'association', label: 'has' },
      { source: 'enrollment', target: 'course', type: 'association', label: 'for' }
    ]
  },

  // Restaurant / Food ordering system
  restaurant: {
    classes: [
      {
        id: 'customer',
        name: 'Customer',
        attributes: ['- id: string', '+ name: string', '+ phone: string', '- loyaltyPoints: number'],
        operations: ['+ placeOrder()', '+ makeReservation()']
      },
      {
        id: 'menuitem',
        name: 'MenuItem',
        attributes: ['- id: string', '+ name: string', '+ price: number', '+ category: string', '- available: boolean'],
        operations: ['+ updatePrice()', '+ setAvailability()']
      },
      {
        id: 'order',
        name: 'Order',
        attributes: ['- id: string', '+ total: number', '+ status: string', '+ createdAt: Date'],
        operations: ['+ addItem()', '+ removeItem()', '+ calculateTotal()']
      },
      {
        id: 'orderitem',
        name: 'OrderItem',
        attributes: ['- quantity: number', '+ specialInstructions: string'],
        operations: ['+ updateQuantity()']
      },
      {
        id: 'table',
        name: 'Table',
        attributes: ['- id: string', '+ number: number', '+ capacity: number', '- status: string'],
        operations: ['+ reserve()', '+ release()']
      }
    ],
    relationships: [
      { source: 'customer', target: 'order', type: 'association', label: 'places' },
      { source: 'order', target: 'orderitem', type: 'composition', label: 'contains' },
      { source: 'orderitem', target: 'menuitem', type: 'association', label: 'references' },
      { source: 'order', target: 'table', type: 'association', label: 'assigned to' }
    ]
  },

  // Banking / Finance system
  banking: {
    classes: [
      {
        id: 'customer',
        name: 'Customer',
        attributes: ['- id: string', '+ name: string', '- ssn: string', '+ address: string'],
        operations: ['+ openAccount()', '+ closeAccount()', '+ getStatement()']
      },
      {
        id: 'account',
        name: 'Account',
        attributes: ['# accountNo: string', '# balance: number', '# openedDate: Date', '# status: string'],
        operations: ['+ deposit()', '+ withdraw()', '+ getBalance()']
      },
      {
        id: 'savingsaccount',
        name: 'SavingsAccount',
        attributes: ['- interestRate: number', '- minBalance: number'],
        operations: ['+ calculateInterest()', '+ applyInterest()']
      },
      {
        id: 'checkingaccount',
        name: 'CheckingAccount',
        attributes: ['- overdraftLimit: number'],
        operations: ['+ writeCheck()']
      },
      {
        id: 'transaction',
        name: 'Transaction',
        attributes: ['- id: string', '+ amount: number', '+ type: string', '+ timestamp: Date'],
        operations: ['+ process()', '+ reverse()']
      }
    ],
    relationships: [
      { source: 'customer', target: 'account', type: 'association', label: 'owns' },
      { source: 'savingsaccount', target: 'account', type: 'inheritance' },
      { source: 'checkingaccount', target: 'account', type: 'inheritance' },
      { source: 'account', target: 'transaction', type: 'composition', label: 'has' }
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
  
  // E-commerce / Shopping system
  if (lowerPrompt.includes('shop') || lowerPrompt.includes('ecommerce') || 
      lowerPrompt.includes('e-commerce') || lowerPrompt.includes('store') ||
      lowerPrompt.includes('cart') || lowerPrompt.includes('order') ||
      lowerPrompt.includes('product') || lowerPrompt.includes('online store')) {
    return 'ecommerce';
  }
  
  // Library system
  if (lowerPrompt.includes('library') || lowerPrompt.includes('book') ||
      lowerPrompt.includes('borrow') || lowerPrompt.includes('loan') ||
      lowerPrompt.includes('librarian')) {
    return 'library';
  }
  
  // Vehicle / Car system
  if (lowerPrompt.includes('vehicle') || lowerPrompt.includes('car') ||
      lowerPrompt.includes('motorcycle') || lowerPrompt.includes('engine') ||
      lowerPrompt.includes('automobile') || lowerPrompt.includes('truck')) {
    return 'vehicle';
  }

  // Blog / CMS system
  if (lowerPrompt.includes('blog') || lowerPrompt.includes('cms') ||
      lowerPrompt.includes('post') || lowerPrompt.includes('article') ||
      lowerPrompt.includes('comment') || lowerPrompt.includes('content management')) {
    return 'blog';
  }

  // Hospital / Healthcare system
  if (lowerPrompt.includes('hospital') || lowerPrompt.includes('healthcare') ||
      lowerPrompt.includes('patient') || lowerPrompt.includes('doctor') ||
      lowerPrompt.includes('medical') || lowerPrompt.includes('clinic') ||
      lowerPrompt.includes('appointment') || lowerPrompt.includes('prescription')) {
    return 'hospital';
  }

  // School / Education system
  if (lowerPrompt.includes('school') || lowerPrompt.includes('education') ||
      lowerPrompt.includes('student') || lowerPrompt.includes('teacher') ||
      lowerPrompt.includes('course') || lowerPrompt.includes('university') ||
      lowerPrompt.includes('college') || lowerPrompt.includes('class')) {
    return 'school';
  }

  // Restaurant / Food ordering system
  if (lowerPrompt.includes('restaurant') || lowerPrompt.includes('food') ||
      lowerPrompt.includes('menu') || lowerPrompt.includes('table') ||
      lowerPrompt.includes('reservation') || lowerPrompt.includes('dining') ||
      lowerPrompt.includes('cafe') || lowerPrompt.includes('kitchen')) {
    return 'restaurant';
  }

  // Banking / Finance system
  if (lowerPrompt.includes('bank') || lowerPrompt.includes('finance') ||
      lowerPrompt.includes('account') || lowerPrompt.includes('transaction') ||
      lowerPrompt.includes('savings') || lowerPrompt.includes('checking') ||
      lowerPrompt.includes('deposit') || lowerPrompt.includes('withdraw')) {
    return 'banking';
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
