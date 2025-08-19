import { describe, it, expect, beforeEach } from 'vitest'
import { 
  hashPassword, 
  comparePassword, 
  encryptForURL, 
  decryptFromURL, 
  generateSecureToken, 
  validatePasswordStrength 
} from '../utils/security'

describe('Security Utilities', () => {
  describe('Password Hashing', () => {
    it('should hash passwords correctly', async () => {
      const password = 'testPassword123!'
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d{1,2}\$/)
    })

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123!'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      
      expect(hash1).not.toBe(hash2)
    })

    it('should handle empty password', async () => {
      const hashedPassword = await hashPassword('')
      expect(hashedPassword).toBeDefined()
    })

    it('should handle special characters in password', async () => {
      const password = 'test@#$%^&*()_+-=[]{}|;:,.<>?'
      const hashedPassword = await hashPassword(password)
      expect(hashedPassword).toBeDefined()
    })
  })

  describe('Password Comparison', () => {
    it('should correctly compare password with hash', async () => {
      const password = 'testPassword123!'
      const hashedPassword = await hashPassword(password)
      
      const isValid = await comparePassword(password, hashedPassword)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testPassword123!'
      const wrongPassword = 'wrongPassword123!'
      const hashedPassword = await hashPassword(password)
      
      const isValid = await comparePassword(wrongPassword, hashedPassword)
      expect(isValid).toBe(false)
    })

    it('should handle empty password comparison', async () => {
      const hashedPassword = await hashPassword('')
      const isValid = await comparePassword('', hashedPassword)
      expect(isValid).toBe(false) // Empty passwords should not match
    })

    it('should handle null/undefined password', async () => {
      const hashedPassword = await hashPassword('test')
      const isValid = await comparePassword(null, hashedPassword)
      expect(isValid).toBe(false)
    })
  })

  describe('URL Encryption/Decryption', () => {
    it('should encrypt and decrypt data correctly', () => {
      const originalData = 'test-data-123'
      const encrypted = encryptForURL(originalData)
      const decrypted = decryptFromURL(encrypted)
      
      expect(encrypted).toBeDefined()
      expect(encrypted).not.toBe(originalData)
      expect(decrypted).toBe(originalData)
    })

    it('should handle special characters in data', () => {
      const originalData = 'test@#$%^&*()_+-=[]{}|;:,.<>?'
      const encrypted = encryptForURL(originalData)
      const decrypted = decryptFromURL(encrypted)
      
      expect(decrypted).toBe(originalData)
    })

    it('should handle empty data', () => {
      const originalData = ''
      const encrypted = encryptForURL(originalData)
      const decrypted = decryptFromURL(encrypted)
      
      expect(decrypted).toBe(originalData || null)
    })

    it('should handle long data', () => {
      const originalData = 'a'.repeat(1000)
      const encrypted = encryptForURL(originalData)
      const decrypted = decryptFromURL(encrypted)
      
      expect(decrypted).toBe(originalData)
    })

    it('should return null for invalid encrypted data', () => {
      const decrypted = decryptFromURL('invalid-encrypted-data')
      expect(decrypted).toBeNull()
    })

    it('should handle URL encoding correctly', () => {
      const originalData = 'test data with spaces and special chars: @#$%'
      const encrypted = encryptForURL(originalData)
      
      // Should be URL safe (base64 encoded, then URL encoded)
      expect(encrypted).not.toContain(' ')
      expect(encrypted).not.toContain('@')
      expect(encrypted).not.toContain('#')
      expect(encrypted).not.toContain('$')
      // Note: % is expected in URL encoding
      
      const decrypted = decryptFromURL(encrypted)
      expect(decrypted).toBe(originalData)
    })
  })

  describe('Secure Token Generation', () => {
    it('should generate tokens of specified length', () => {
      const token = generateSecureToken(16)
      expect(token).toHaveLength(16)
    })

    it('should generate tokens of default length', () => {
      const token = generateSecureToken()
      expect(token).toHaveLength(32)
    })

    it('should generate unique tokens', () => {
      const token1 = generateSecureToken(16)
      const token2 = generateSecureToken(16)
      expect(token1).not.toBe(token2)
    })

    it('should generate alphanumeric tokens', () => {
      const token = generateSecureToken(50)
      expect(token).toMatch(/^[A-Za-z0-9]+$/)
    })

    it('should handle zero length', () => {
      const token = generateSecureToken(0)
      expect(token).toHaveLength(0)
    })

    it('should handle negative length', () => {
      const token = generateSecureToken(-5)
      expect(token).toHaveLength(0)
    })
  })

  describe('Password Strength Validation', () => {
    it('should validate strong password', () => {
      const password = 'StrongPass123!'
      const result = validatePasswordStrength(password)
      
      expect(result.score).toBe(5)
      expect(result.feedback).toHaveLength(0)
    })

    it('should validate weak password', () => {
      const password = 'weak'
      const result = validatePasswordStrength(password)
      
      expect(result.score).toBeLessThan(3)
      expect(result.feedback.length).toBeGreaterThan(0)
    })

    it('should check minimum length', () => {
      const password = 'Short'
      const result = validatePasswordStrength(password)
      
      const hasLengthFeedback = result.feedback.some(feedback => 
        feedback.includes('8 characters')
      )
      expect(hasLengthFeedback).toBe(true)
    })

    it('should check lowercase letters', () => {
      const password = 'UPPERCASE123!'
      const result = validatePasswordStrength(password)
      
      const hasLowercaseFeedback = result.feedback.some(feedback => 
        feedback.includes('lowercase')
      )
      expect(hasLowercaseFeedback).toBe(true)
    })

    it('should check uppercase letters', () => {
      const password = 'lowercase123!'
      const result = validatePasswordStrength(password)
      
      const hasUppercaseFeedback = result.feedback.some(feedback => 
        feedback.includes('uppercase')
      )
      expect(hasUppercaseFeedback).toBe(true)
    })

    it('should check numbers', () => {
      const password = 'NoNumbers!'
      const result = validatePasswordStrength(password)
      
      const hasNumberFeedback = result.feedback.some(feedback => 
        feedback.includes('number')
      )
      expect(hasNumberFeedback).toBe(true)
    })

    it('should check special characters', () => {
      const password = 'NoSpecial123'
      const result = validatePasswordStrength(password)
      
      const hasSpecialFeedback = result.feedback.some(feedback => 
        feedback.includes('special character')
      )
      expect(hasSpecialFeedback).toBe(true)
    })

    it('should handle empty password', () => {
      const password = ''
      const result = validatePasswordStrength(password)
      
      expect(result.score).toBe(0)
      expect(result.feedback.length).toBeGreaterThan(0)
    })

    it('should handle password with all requirements', () => {
      const password = 'PerfectPass123!@#'
      const result = validatePasswordStrength(password)
      
      expect(result.score).toBe(5)
      expect(result.feedback).toHaveLength(0)
    })
  })

  describe('Security Edge Cases', () => {
    it('should handle null inputs gracefully', async () => {
      await expect(hashPassword(null)).rejects.toThrow()
      await expect(comparePassword(null, 'hash')).resolves.toBe(false)
      expect(() => encryptForURL(null)).toThrow()
      expect(decryptFromURL(null)).toBeNull()
      expect(() => generateSecureToken(null)).toThrow()
      expect(() => validatePasswordStrength(null)).toThrow()
    })

    it('should handle undefined inputs gracefully', async () => {
      await expect(hashPassword(undefined)).rejects.toThrow()
      await expect(comparePassword(undefined, 'hash')).resolves.toBe(false)
      expect(() => encryptForURL(undefined)).toThrow()
      expect(decryptFromURL(undefined)).toBeNull()
      // generateSecureToken has a default parameter, so undefined becomes 32
      expect(() => generateSecureToken(undefined)).not.toThrow()
      expect(() => validatePasswordStrength(undefined)).toThrow()
    })

    it('should handle very long inputs', async () => {
      const longPassword = 'a'.repeat(10000)
      const hashedPassword = await hashPassword(longPassword)
      expect(hashedPassword).toBeDefined()
      
      const longData = 'b'.repeat(10000)
      const encrypted = encryptForURL(longData)
      const decrypted = decryptFromURL(encrypted)
      expect(decrypted).toBe(longData)
    })

    it('should handle unicode characters', async () => {
      const unicodePassword = 'test密码123!@#'
      const hashedPassword = await hashPassword(unicodePassword)
      expect(hashedPassword).toBeDefined()
      
      const unicodeData = 'test数据with特殊字符'
      const encrypted = encryptForURL(unicodeData)
      const decrypted = decryptFromURL(encrypted)
      expect(decrypted).toBe(unicodeData)
    })
  })
})
