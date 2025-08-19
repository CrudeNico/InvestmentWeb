import bcrypt from 'bcryptjs'
import CryptoJS from 'crypto-js'

// Secret key for encryption (in production, this should be in environment variables)
const ENCRYPTION_KEY = import.meta.env?.VITE_ENCRYPTION_KEY || 'opessocius-secure-key-2024'

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password to compare against
 * @returns {Promise<boolean>} - True if passwords match
 */
export const comparePassword = async (password, hashedPassword) => {
  if (!password || !hashedPassword) {
    return false
  }
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * Encrypt data for URL parameters
 * @param {string} data - Data to encrypt
 * @returns {string} - Encrypted data (URL safe)
 */
export const encryptForURL = (data) => {
  if (data === null || data === undefined) {
    throw new Error('Data cannot be null or undefined')
  }
  const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString()
  return encodeURIComponent(encrypted)
}

/**
 * Decrypt data from URL parameters
 * @param {string} encryptedData - Encrypted data from URL
 * @returns {string} - Decrypted data
 */
export const decryptFromURL = (encryptedData) => {
  try {
    if (!encryptedData) {
      return null
    }
    const decoded = decodeURIComponent(encryptedData)
    const decrypted = CryptoJS.AES.decrypt(decoded, ENCRYPTION_KEY)
    const result = decrypted.toString(CryptoJS.enc.Utf8)
    return result || null
  } catch (error) {
    console.error('Error decrypting URL parameter:', error)
    return null
  }
}

/**
 * Generate a secure random token
 * @param {number} length - Length of the token
 * @returns {string} - Random token
 */
export const generateSecureToken = (length = 32) => {
  if (length === null || length === undefined) {
    throw new Error('Length cannot be null or undefined')
  }
  if (length < 0) {
    length = 0
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with score and feedback
 */
export const validatePasswordStrength = (password) => {
  let score = 0
  const feedback = []

  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Password should be at least 8 characters long')
  }

  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password should contain at least one lowercase letter')
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password should contain at least one uppercase letter')
  }

  if (/[0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password should contain at least one number')
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password should contain at least one special character')
  }

  return { score, feedback }
}
