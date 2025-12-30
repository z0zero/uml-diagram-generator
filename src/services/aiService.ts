import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { UMLDiagram } from '../types';
import { getApiKey } from './apiKeyService';
import { validateUML } from './umlParser';

/**
 * AI Service Interface
 * Provides a function interface for UML diagram generation
 */
export interface AIService {
  generateUML: (prompt: string) => Promise<UMLDiagram>;
}

/**
 * Configuration for the AI service
 */
export interface AIServiceConfig {
  /** Override API key (uses stored key if not provided) */
  apiKey?: string;
}

/**
 * Error thrown when API key is not configured
 */
export class ApiKeyNotConfiguredError extends Error {
  constructor() {
    super('Gemini API key is not configured. Please add your API key in settings.');
    this.name = 'ApiKeyNotConfiguredError';
  }
}

/**
 * Error thrown when UML generation fails
 */
export class UMLGenerationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'UMLGenerationError';
  }
}

/**
 * System prompt for Gemini to generate UML class diagrams
 */
const SYSTEM_PROMPT = `You are a UML class diagram generator. Your task is to analyze the user's description and generate a valid UML class diagram in JSON format.

IMPORTANT: You must respond ONLY with valid JSON, no explanation or markdown code blocks.

The JSON must follow this exact schema:
{
  "classes": [
    {
      "id": "unique_lowercase_id",
      "name": "ClassName",
      "attributes": ["- privateAttr: type", "+ publicAttr: type", "# protectedAttr: type"],
      "operations": ["+ methodName(): returnType", "- privateMethod(param: type)"]
    }
  ],
  "relationships": [
    {
      "source": "source_class_id",
      "target": "target_class_id", 
      "type": "association|inheritance|composition|aggregation",
      "label": "optional relationship label"
    }
  ]
}

Rules:
1. Class IDs must be lowercase, unique, and match the source/target in relationships
2. Use proper UML visibility markers: + (public), - (private), # (protected)
3. Include relevant attributes and operations for each class
4. Use appropriate relationship types:
   - inheritance: for "is-a" relationships (child extends parent)
   - composition: for strong "has-a" (part cannot exist without whole)
   - aggregation: for weak "has-a" (part can exist independently)
   - association: for general relationships
5. Generate 3-8 classes with meaningful relationships
6. Make the diagram represent a complete, coherent system design`;

/**
 * Parses the Gemini response to extract valid JSON
 */
function parseGeminiResponse(text: string): UMLDiagram {
  // Try to extract JSON from the response
  let jsonText = text.trim();

  // Remove markdown code blocks if present
  const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1].trim();
  }

  // Try to find JSON object boundaries
  const startIdx = jsonText.indexOf('{');
  const endIdx = jsonText.lastIndexOf('}');

  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error('No valid JSON object found in response');
  }

  jsonText = jsonText.slice(startIdx, endIdx + 1);

  try {
    const parsed = JSON.parse(jsonText) as UMLDiagram;

    // Validate the parsed object has required structure
    if (!Array.isArray(parsed.classes)) {
      throw new Error('Missing or invalid "classes" array');
    }
    if (!Array.isArray(parsed.relationships)) {
      throw new Error('Missing or invalid "relationships" array');
    }

    // Run through the UML validator
    const validation = validateUML(parsed);
    if (!validation.valid) {
      console.warn('UML validation warnings:', validation.errors);
      // Don't throw - try to use the diagram anyway
    }

    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON syntax: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Generates a UML diagram from a natural language prompt using Gemini AI
 * 
 * @param prompt - Natural language description of the system
 * @param config - Optional configuration (API key override)
 * @returns Promise resolving to a UMLDiagram
 * @throws ApiKeyNotConfiguredError if no API key is available
 * @throws UMLGenerationError if generation fails
 */
export async function generateUML(
  prompt: string,
  config?: AIServiceConfig
): Promise<UMLDiagram> {
  // Get API key
  const apiKey = config?.apiKey ?? getApiKey();

  if (!apiKey) {
    throw new ApiKeyNotConfiguredError();
  }

  try {
    // Initialize Gemini client
    const ai = new GoogleGenAI({ apiKey });

    // Generate content with streaming
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nUser Request: ${prompt}`,
            },
          ],
        },
      ],
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    // Collect the full response
    let fullText = '';
    for await (const chunk of response) {
      if (chunk.text) {
        fullText += chunk.text;
      }
    }

    if (!fullText || fullText.trim().length === 0) {
      throw new Error('Empty response from Gemini API');
    }

    // Parse and validate the response
    return parseGeminiResponse(fullText);

  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof ApiKeyNotConfiguredError) {
      throw error;
    }

    // Handle specific API errors
    if (error instanceof Error) {
      // Check for authentication errors
      if (error.message.includes('API key') || error.message.includes('401')) {
        throw new UMLGenerationError(
          'Invalid API key. Please check your Gemini API key in settings.',
          error
        );
      }

      // Check for rate limiting
      if (error.message.includes('429') || error.message.includes('quota')) {
        throw new UMLGenerationError(
          'API rate limit exceeded. Please wait a moment and try again.',
          error
        );
      }

      throw new UMLGenerationError(
        `Failed to generate UML diagram: ${error.message}`,
        error
      );
    }

    throw new UMLGenerationError('An unexpected error occurred', error);
  }
}

/**
 * Default AI service instance
 */
export const aiService: AIService = {
  generateUML,
};

export default aiService;
