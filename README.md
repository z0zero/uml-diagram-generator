# UML Diagram Generator

A React application that generates UML Class Diagrams from natural language prompts. Describe your system in plain English and get a visual UML diagram instantly.

## Features

- **Natural Language Input**: Describe your system and generate UML diagrams automatically
- **Interactive Canvas**: Pan, zoom, and explore your diagrams using React Flow
- **Project Management**: Create, save, load, and delete diagram projects
- **Multiple Templates**: Built-in support for e-commerce, library, hospital, school, restaurant, banking, blog, and vehicle systems
- **UML Notation**: Proper class diagrams with attributes, operations, and visibility markers
- **Relationship Types**: Association, inheritance, composition, and aggregation with appropriate visual markers
- **Auto Layout**: Automatic hierarchical layout using Dagre algorithm
- **Conversation History**: Track your prompts and responses

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **React Flow** for diagram visualization
- **Zustand** for state management
- **Dagre** for automatic graph layout
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vitest + fast-check** for testing (including property-based tests)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

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

### Usage

1. Click **Create New** to start a new project
2. Enter a description of your system in the prompt panel (e.g., "Design an e-commerce system with users, products, and orders")
3. Click **Generate** to create the UML diagram
4. Use the canvas controls to pan and zoom
5. Click **Save** to persist your project to local storage

## Project Structure

```
src/
├── components/
│   ├── Canvas/          # React Flow canvas and custom nodes/edges
│   ├── PromptPanel/     # Chat interface for prompts
│   └── Sidebar/         # Project management
├── services/
│   ├── aiService.ts     # AI response simulation
│   ├── umlParser.ts     # JSON to React Flow transformation
│   └── layoutEngine.ts  # Dagre layout calculation
├── store/
│   └── diagramStore.ts  # Zustand state management
├── types/
│   └── index.ts         # TypeScript interfaces
└── utils/
    └── storage.ts       # LocalStorage utilities
```

## Example Prompts

- "Design an e-commerce system with users, products, orders, and shopping cart"
- "Create a library management system with books, members, and loans"
- "Model a hospital system with patients, doctors, and appointments"
- "Design a school system with students, teachers, and courses"

## License

MIT
