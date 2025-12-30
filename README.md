# UML Diagram Generator

A React application that generates UML diagrams from natural language prompts using Google Gemini AI. Describe your system in plain English and get a visual UML diagram instantly with support for multiple diagram types.

## Features

- **AI-Powered Generation**: Powered by Google Gemini AI for intelligent diagram generation
- **Multiple Diagram Types**: Support for 6 UML diagram types:
  - **Class Diagrams**: Classes with attributes, operations, and relationships
  - **Use Case Diagrams**: Actors, use cases, and their interactions
  - **Activity Diagrams**: Activities, decisions, and flows
  - **Sequence Diagrams**: Participants and message exchanges
  - **State Machine Diagrams**: States and transitions
  - **Component Diagrams**: Components and their dependencies
- **Natural Language Input**: Describe your system and generate UML diagrams automatically
- **Interactive Canvas**: Pan, zoom, and explore your diagrams using React Flow
- **Project Management**: Create, save, load, and delete diagram projects with local storage
- **Export Functionality**: Export diagrams as PNG, JPG, or SVG images
- **Auto Layout**: Automatic hierarchical layout using Dagre algorithm
- **Conversation History**: Track your prompts and responses for each project

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Google Gemini AI** for intelligent diagram generation
- **React Flow** for diagram visualization
- **Zustand** for state management
- **Dagre** for automatic graph layout
- **html-to-image** for diagram export
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vitest + fast-check** for testing (including property-based tests)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- **Google Gemini API Key** - Get yours at [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Build for production
bun run build
```

### Setup

1. **Get a Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/apikey)
   - Sign in with your Google account
   - Click "Create API Key" to generate your key

2. **Configure API Key in the App**:
   - Open the application in your browser
   - Click the settings icon (gear) in the top-right corner
   - Enter your Gemini API key in the dialog
   - Click "Save" to validate and store the key

### Usage

1. **Create a New Project**:
   - Click **Create New** in the sidebar
   - Select the diagram type (Class, Use Case, Activity, Sequence, State Machine, or Component)

2. **Generate Diagrams**:
   - Enter a description of your system in the prompt panel
   - Click **Generate** to create the UML diagram using AI
   - The AI will analyze your prompt and generate an appropriate diagram

3. **Interact with Diagrams**:
   - Pan: Click and drag on the canvas
   - Zoom: Use mouse wheel or zoom controls
   - Export: Click the export button and choose PNG, JPG, or SVG format

4. **Manage Projects**:
   - Save: Click **Save** to persist your project to local storage
   - Load: Click on any project in the sidebar to load it
   - Delete: Click the delete icon next to a project
   - Rename: Click on the project name to edit it

## Project Structure

```
src/
├── components/
│   ├── Canvas/              # React Flow canvas and custom nodes/edges
│   │   ├── ClassNode.tsx    # Class diagram node component
│   │   ├── ExportPanel.tsx  # Export functionality (PNG/JPG/SVG)
│   │   └── nodes/           # Specialized node components for each diagram type
│   ├── PromptPanel/         # Chat interface for prompts
│   ├── Sidebar/             # Project management
│   └── ApiKeyDialog/        # API key configuration dialog
├── services/
│   ├── aiService.ts         # Google Gemini AI integration
│   ├── apiKeyService.ts     # API key management and validation
│   ├── diagramParser.ts     # Unified diagram parsing for all types
│   ├── umlParser.ts         # JSON to React Flow transformation
│   └── layoutEngine.ts      # Dagre layout calculation
├── store/
│   └── diagramStore.ts      # Zustand state management
├── types/
│   └── index.ts             # TypeScript interfaces for all diagram types
└── utils/
    └── storage.ts           # LocalStorage utilities
```

## Example Prompts

### Class Diagrams
- "Design an e-commerce system with users, products, orders, and shopping cart"
- "Create a library management system with books, members, and loans"
- "Model a hospital system with patients, doctors, and appointments"

### Use Case Diagrams
- "Create a use case diagram for an online banking system"
- "Design use cases for a restaurant ordering system"

### Activity Diagrams
- "Show the workflow for processing an online order"
- "Create an activity diagram for user registration"

### Sequence Diagrams
- "Show the sequence of login authentication"
- "Diagram the message flow for a checkout process"

### State Machine Diagrams
- "Create a state machine for an order lifecycle"
- "Design states for a traffic light system"

### Component Diagrams
- "Show the components of a web application architecture"
- "Design a microservices component diagram"

## License

MIT
