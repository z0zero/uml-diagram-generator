import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { UnifiedDiagram, DiagramType } from '../types';
import { getApiKey } from './apiKeyService';
import { validateUnifiedDiagram } from './diagramParser';

/**
 * AI Service Interface
 */
export interface AIService {
  generateUML: (prompt: string, diagramType?: DiagramType) => Promise<UnifiedDiagram>;
}

/**
 * Configuration for the AI service
 */
export interface AIServiceConfig {
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
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'UMLGenerationError';
    this.cause = cause;
  }
}

/**
 * System prompts for each diagram type
 */
const SYSTEM_PROMPTS: Record<DiagramType, string> = {
  class: `You are a UML class diagram generator. Generate a valid Class Diagram in JSON format.

IMPORTANT: Respond ONLY with valid JSON, no explanation or markdown code blocks.

JSON Schema:
{
  "type": "class",
  "classes": [
    { "id": "unique_id", "name": "ClassName", "attributes": ["- privateAttr: type", "+ publicAttr: type"], "operations": ["+ method(): returnType"] }
  ],
  "relationships": [
    { "source": "source_id", "target": "target_id", "type": "association|inheritance|composition|aggregation", "label": "optional" }
  ]
}

Rules:
- Class IDs must be lowercase and unique
- Use visibility markers: + (public), - (private), # (protected)
- Relationship types: inheritance, composition, aggregation, association
- Generate 3-8 meaningful classes with relationships`,

  useCase: `You are a UML use case diagram generator. Generate a valid Use Case Diagram in JSON format.

IMPORTANT: Respond ONLY with valid JSON, no explanation or markdown code blocks.

JSON Schema:
{
  "type": "useCase",
  "actors": [
    { "id": "unique_id", "name": "Actor Name" }
  ],
  "useCases": [
    { "id": "unique_id", "name": "Use Case Name", "description": "optional description" }
  ],
  "useCaseRelationships": [
    { "source": "actor_or_usecase_id", "target": "usecase_id", "type": "association|include|extend|generalization", "label": "optional" }
  ]
}

Rules:
- Actors are external entities that interact with the system
- Use cases represent system functionality
- Types: association (actor-usecase), include (<<include>>), extend (<<extend>>), generalization
- Generate realistic actors and 4-8 use cases`,

  activity: `You are a UML activity diagram generator. Generate a valid Activity Diagram in JSON format.

IMPORTANT: Respond ONLY with valid JSON, no explanation or markdown code blocks.

JSON Schema:
{
  "type": "activity",
  "activities": [
    { "id": "unique_id", "type": "initial|action|decision|merge|fork|join|final|flowFinal", "label": "Activity Label" }
  ],
  "transitions": [
    { "source": "source_id", "target": "target_id", "guard": "[condition]", "label": "optional" }
  ]
}

Rules:
- Must have exactly one "initial" node and at least one "final" or "flowFinal" node
- decision nodes should have multiple outgoing transitions with guards
- fork/join are for parallel activities
- Generate a logical flow with 5-10 activities`,

  sequence: `You are a UML sequence diagram generator. Generate a valid Sequence Diagram in JSON format.

IMPORTANT: Respond ONLY with valid JSON, no explanation or markdown code blocks.

JSON Schema:
{
  "type": "sequence",
  "participants": [
    { "id": "unique_id", "name": "Participant Name", "type": "actor|object|boundary|control|entity" }
  ],
  "messages": [
    { "id": "msg_id", "from": "participant_id", "to": "participant_id", "label": "message()", "type": "sync|async|return|create|destroy", "order": 1 }
  ]
}

Rules:
- Participants are ordered left to right
- Messages have sequential order numbers
- Types: actor (user), object (class), boundary (UI), control (logic), entity (data)
- Message types: sync (->), async (-->), return (<--), create, destroy
- Generate 3-6 participants with 5-10 messages`,

  stateMachine: `You are a UML state machine diagram generator. Generate a valid State Machine Diagram in JSON format.

IMPORTANT: Respond ONLY with valid JSON, no explanation or markdown code blocks.

JSON Schema:
{
  "type": "stateMachine",
  "states": [
    { "id": "unique_id", "name": "State Name", "isInitial": false, "isFinal": false, "entryAction": "optional", "exitAction": "optional" }
  ],
  "stateTransitions": [
    { "source": "state_id", "target": "state_id", "trigger": "event", "guard": "[condition]", "action": "doSomething()" }
  ]
}

Rules:
- Must have exactly one state with isInitial: true
- Can have multiple final states with isFinal: true
- Transitions have trigger (event), guard (condition), action
- Generate 4-8 states with meaningful transitions`,

  component: `You are a UML component diagram generator. Generate a valid Component Diagram in JSON format.

IMPORTANT: Respond ONLY with valid JSON, no explanation or markdown code blocks.

JSON Schema:
{
  "type": "component",
  "components": [
    { "id": "unique_id", "name": "Component Name", "stereotype": "service|library|database|ui", "interfaces": [{ "id": "iface_id", "name": "IInterface", "type": "provided|required" }] }
  ],
  "dependencies": [
    { "source": "component_id", "target": "component_id", "label": "uses", "type": "dependency|realization" }
  ]
}

Rules:
- Components represent modular parts of a system
- Provided interfaces are implemented by the component (lollipop)
- Required interfaces are needed by the component (socket)
- Dependencies show usage relationships
- Generate 4-8 components representing a realistic architecture`,
};

/**
 * Parses the Gemini response to extract valid JSON
 */
function parseGeminiResponse(text: string, diagramType: DiagramType): UnifiedDiagram {
  let jsonText = text.trim();

  // Remove markdown code blocks if present
  const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1].trim();
  }

  // Find JSON object boundaries
  const startIdx = jsonText.indexOf('{');
  const endIdx = jsonText.lastIndexOf('}');

  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error('No valid JSON object found in response');
  }

  jsonText = jsonText.slice(startIdx, endIdx + 1);

  try {
    const parsed = JSON.parse(jsonText) as UnifiedDiagram;

    // Ensure type is set correctly
    parsed.type = diagramType;

    // Validate the parsed object
    const validation = validateUnifiedDiagram(parsed);
    if (!validation.valid) {
      console.warn('UML validation warnings:', validation.errors);
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
 */
export async function generateUML(
  prompt: string,
  diagramType: DiagramType = 'class',
  config?: AIServiceConfig
): Promise<UnifiedDiagram> {
  const apiKey = config?.apiKey ?? getApiKey();

  if (!apiKey) {
    throw new ApiKeyNotConfiguredError();
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const systemPrompt = SYSTEM_PROMPTS[diagramType];

    const response = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\nUser Request: ${prompt}`,
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

    let fullText = '';
    for await (const chunk of response) {
      if (chunk.text) {
        fullText += chunk.text;
      }
    }

    if (!fullText || fullText.trim().length === 0) {
      throw new Error('Empty response from Gemini API');
    }

    return parseGeminiResponse(fullText, diagramType);

  } catch (error) {
    if (error instanceof ApiKeyNotConfiguredError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('401')) {
        throw new UMLGenerationError('Invalid API key. Please check your Gemini API key.', error);
      }

      if (error.message.includes('429') || error.message.includes('quota')) {
        throw new UMLGenerationError('API rate limit exceeded. Please wait and try again.', error);
      }

      throw new UMLGenerationError(`Failed to generate diagram: ${error.message}`, error);
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
