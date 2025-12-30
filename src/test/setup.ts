import '@testing-library/react'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock ResizeObserver for React Flow tests
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock;

// Cleanup after each test case
afterEach(() => {
  cleanup()
})
