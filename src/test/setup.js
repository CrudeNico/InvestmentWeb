import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables for testing
process.env.VITE_ENCRYPTION_KEY = 'test-encryption-key-123'
process.env.SENDGRID_API_KEY = 'test-sendgrid-key'
process.env.VITE_FIREBASE_API_KEY = 'test-firebase-key'
process.env.VITE_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com'
process.env.VITE_FIREBASE_PROJECT_ID = 'test-project'
process.env.VITE_FIREBASE_STORAGE_BUCKET = 'test.appspot.com'
process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = '123456789'
process.env.VITE_FIREBASE_APP_ID = 'test-app-id'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock fetch
global.fetch = vi.fn()

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

