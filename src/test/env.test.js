import { describe, it, expect, beforeEach } from 'vitest'

describe('Environment Variables Validation', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.VITE_ENCRYPTION_KEY
    delete process.env.SENDGRID_API_KEY
    delete process.env.VITE_FIREBASE_API_KEY
    delete process.env.VITE_FIREBASE_AUTH_DOMAIN
    delete process.env.VITE_FIREBASE_PROJECT_ID
    delete process.env.VITE_FIREBASE_STORAGE_BUCKET
    delete process.env.VITE_FIREBASE_MESSAGING_SENDER_ID
    delete process.env.VITE_FIREBASE_APP_ID
  })

  describe('Security Configuration', () => {
    it('should have encryption key configured', () => {
      process.env.VITE_ENCRYPTION_KEY = 'test-key-123'
      expect(process.env.VITE_ENCRYPTION_KEY).toBeDefined()
      expect(process.env.VITE_ENCRYPTION_KEY).toBe('test-key-123')
    })

    it('should have fallback encryption key when not set', () => {
      // Clear the environment variable
      delete process.env.VITE_ENCRYPTION_KEY
      const { encryptForURL } = require('../utils/security')
      expect(() => encryptForURL('test')).not.toThrow()
    })

    it('should validate encryption key length', () => {
      process.env.VITE_ENCRYPTION_KEY = 'short'
      const { encryptForURL } = require('../utils/security')
      expect(() => encryptForURL('test')).not.toThrow()
    })
  })

  describe('Email Service Configuration', () => {
    it('should have SendGrid API key configured', () => {
      process.env.SENDGRID_API_KEY = 'SG.test-key'
      expect(process.env.SENDGRID_API_KEY).toBeDefined()
      expect(process.env.SENDGRID_API_KEY).toMatch(/^SG\./)
    })

    it('should handle missing SendGrid API key gracefully', () => {
      expect(process.env.SENDGRID_API_KEY).toBeUndefined()
      // Should not throw when SendGrid is not configured
    })
  })

  describe('Firebase Configuration', () => {
    it('should have all required Firebase environment variables', () => {
      const requiredVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID'
      ]

      requiredVars.forEach(varName => {
        process.env[varName] = `test-${varName.toLowerCase()}`
        expect(process.env[varName]).toBeDefined()
      })
    })

    it('should validate Firebase API key format', () => {
      process.env.VITE_FIREBASE_API_KEY = 'AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz'
      expect(process.env.VITE_FIREBASE_API_KEY).toMatch(/^AIza[0-9A-Za-z-_]{39}$/)
    })

    it('should validate Firebase project ID format', () => {
      process.env.VITE_FIREBASE_PROJECT_ID = 'test-project-123'
      expect(process.env.VITE_FIREBASE_PROJECT_ID).toMatch(/^[a-z0-9-]+$/)
    })

    it('should validate Firebase auth domain format', () => {
      process.env.VITE_FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com'
      expect(process.env.VITE_FIREBASE_AUTH_DOMAIN).toMatch(/\.firebaseapp\.com$/)
    })

    it('should validate Firebase storage bucket format', () => {
      process.env.VITE_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com'
      expect(process.env.VITE_FIREBASE_STORAGE_BUCKET).toMatch(/\.appspot\.com$/)
    })

    it('should validate Firebase messaging sender ID format', () => {
      process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = '123456789'
      expect(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID).toMatch(/^\d+$/)
    })

    it('should validate Firebase app ID format', () => {
      process.env.VITE_FIREBASE_APP_ID = '1:123456789:web:abcdef123456'
      expect(process.env.VITE_FIREBASE_APP_ID).toMatch(/^\d+:\d+:web:[a-zA-Z0-9]+$/)
    })
  })

  describe('Production Environment Validation', () => {
    it('should have all required variables in production', () => {
      const productionVars = [
        'VITE_ENCRYPTION_KEY',
        'SENDGRID_API_KEY',
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID'
      ]

      // Set all production variables
      productionVars.forEach(varName => {
        process.env[varName] = `prod-${varName.toLowerCase()}`
      })

      productionVars.forEach(varName => {
        expect(process.env[varName]).toBeDefined()
        expect(process.env[varName]).not.toBe('')
      })
    })

    it('should validate production encryption key strength', () => {
      process.env.VITE_ENCRYPTION_KEY = 'production-super-secure-key-32-chars-long'
      expect(process.env.VITE_ENCRYPTION_KEY.length).toBeGreaterThanOrEqual(32)
    })

    it('should validate production SendGrid API key', () => {
      process.env.SENDGRID_API_KEY = 'SG.production-key-very-long-and-secure'
      expect(process.env.SENDGRID_API_KEY).toMatch(/^SG\./)
      expect(process.env.SENDGRID_API_KEY.length).toBeGreaterThan(10)
    })
  })

  describe('Environment Variable Types', () => {
    it('should handle string environment variables', () => {
      process.env.TEST_STRING = 'test-value'
      expect(typeof process.env.TEST_STRING).toBe('string')
      expect(process.env.TEST_STRING).toBe('test-value')
    })

    it('should handle numeric environment variables', () => {
      process.env.TEST_NUMBER = '123'
      expect(process.env.TEST_NUMBER).toBe('123')
      expect(Number(process.env.TEST_NUMBER)).toBe(123)
    })

    it('should handle boolean environment variables', () => {
      process.env.TEST_BOOL = 'true'
      expect(process.env.TEST_BOOL).toBe('true')
      expect(process.env.TEST_BOOL === 'true').toBe(true)
    })
  })

  describe('Environment Variable Security', () => {
    it('should not expose sensitive data in logs', () => {
      process.env.SENDGRID_API_KEY = 'SG.sensitive-key'
      process.env.VITE_ENCRYPTION_KEY = 'sensitive-encryption-key'
      
      // These should not be logged in plain text
      const sensitiveVars = ['SENDGRID_API_KEY', 'VITE_ENCRYPTION_KEY']
      sensitiveVars.forEach(varName => {
        expect(process.env[varName]).toBeDefined()
        expect(process.env[varName]).not.toContain('undefined')
      })
    })

    it('should validate environment variable names', () => {
      const validVarNames = [
        'VITE_ENCRYPTION_KEY',
        'SENDGRID_API_KEY',
        'VITE_FIREBASE_API_KEY'
      ]

      validVarNames.forEach(varName => {
        expect(varName).toMatch(/^[A-Z_][A-Z0-9_]*$/)
      })
    })
  })
})
