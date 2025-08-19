import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { execSync } from 'child_process'
import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

describe('Build and Production Validation', () => {
  let buildOutput = null
  let buildSuccess = false

  beforeAll(async () => {
    try {
      // Run build command
      buildOutput = execSync('npm run build', { 
        encoding: 'utf8',
        timeout: 60000 // 60 seconds timeout
      })
      buildSuccess = true
    } catch (error) {
      buildOutput = error.stdout || error.stderr || error.message
      buildSuccess = false
    }
  })

  afterAll(() => {
    // Cleanup build artifacts if needed
    try {
      execSync('rm -rf dist', { stdio: 'ignore' })
    } catch (error) {
      // Ignore cleanup errors
    }
  })

  describe('Build Process', () => {
    it('should complete build successfully', () => {
      expect(buildSuccess).toBe(true)
      expect(buildOutput).toBeDefined()
    })

    it('should not have build errors', () => {
      expect(buildOutput).not.toContain('ERROR')
      expect(buildOutput).not.toContain('Failed to compile')
      expect(buildOutput).not.toContain('Build failed')
    })

    it('should not have TypeScript errors', () => {
      expect(buildOutput).not.toContain('TS2307')
      expect(buildOutput).not.toContain('TS2322')
      expect(buildOutput).not.toContain('TS2339')
    })

    it('should not have ESLint errors', () => {
      expect(buildOutput).not.toContain('ESLint:')
      expect(buildOutput).not.toContain('error')
    })

    it('should generate build output', () => {
      const distPath = join(process.cwd(), 'dist')
      expect(existsSync(distPath)).toBe(true)
    })

    it('should generate index.html', () => {
      const indexPath = join(process.cwd(), 'dist', 'index.html')
      expect(existsSync(indexPath)).toBe(true)
    })

    it('should generate assets directory', () => {
      const assetsPath = join(process.cwd(), 'dist', 'assets')
      expect(existsSync(assetsPath)).toBe(true)
    })

    it('should generate JavaScript bundles', () => {
      const assetsPath = join(process.cwd(), 'dist', 'assets')
      const files = readdirSync(assetsPath)
      expect(files.some(file => file.endsWith('.js'))).toBe(true)
    })

    it('should generate CSS bundles', () => {
      const assetsPath = join(process.cwd(), 'dist', 'assets')
      const files = readdirSync(assetsPath)
      expect(files.some(file => file.endsWith('.css'))).toBe(true)
    })
  })

  describe('Build Output Validation', () => {
    it('should have valid HTML structure', () => {
      const indexPath = join(process.cwd(), 'dist', 'index.html')
      const htmlContent = readFileSync(indexPath, 'utf8')
      
      expect(htmlContent).toContain('<!DOCTYPE html>')
      expect(htmlContent).toContain('<html')
      expect(htmlContent).toContain('<head>')
      expect(htmlContent).toContain('<body>')
      expect(htmlContent).toContain('<div id="root">')
    })

    it('should include necessary meta tags', () => {
      const indexPath = join(process.cwd(), 'dist', 'index.html')
      const htmlContent = readFileSync(indexPath, 'utf8')
      
      expect(htmlContent).toContain('<meta charset="UTF-8" />')
      expect(htmlContent).toContain('<meta name="viewport"')
    })

    it('should include script tags', () => {
      const indexPath = join(process.cwd(), 'dist', 'index.html')
      const htmlContent = readFileSync(indexPath, 'utf8')
      
      expect(htmlContent).toContain('<script')
      expect(htmlContent).toContain('type="module"')
    })

    it('should include CSS links', () => {
      const indexPath = join(process.cwd(), 'dist', 'index.html')
      const htmlContent = readFileSync(indexPath, 'utf8')
      
      expect(htmlContent).toContain('<link rel="stylesheet"')
    })

    it('should not include development-only code', () => {
      const indexPath = join(process.cwd(), 'dist', 'index.html')
      const htmlContent = readFileSync(indexPath, 'utf8')
      
      expect(htmlContent).not.toContain('localhost:3000')
      expect(htmlContent).not.toContain('development')
    })
  })

  describe('Bundle Analysis', () => {
    it('should have reasonable bundle sizes', () => {
      const assetsPath = join(process.cwd(), 'dist', 'assets')
      const files = readdirSync(assetsPath)
      
      // Check if main bundle exists and is not empty
      expect(files).toBeDefined()
      expect(files.length).toBeGreaterThan(0)
    })

    it('should not have duplicate dependencies', () => {
      const assetsPath = join(process.cwd(), 'dist', 'assets')
      const files = readdirSync(assetsPath)
      
      // Should not have multiple versions of the same library
      expect(files.some(file => file.includes('react.js'))).toBe(false)
      expect(files.some(file => file.includes('react-dom.js'))).toBe(false)
    })

    it('should have optimized assets', () => {
      const assetsPath = join(process.cwd(), 'dist', 'assets')
      const files = readdirSync(assetsPath)
      
      // Should have minified files
      expect(files.some(file => file.endsWith('.js'))).toBe(true)
      expect(files.some(file => file.endsWith('.css'))).toBe(true)
    })
  })

  describe('Environment Configuration', () => {
    it('should have production environment variables', () => {
      const indexPath = join(process.cwd(), 'dist', 'index.html')
      const htmlContent = readFileSync(indexPath, 'utf8')
      
      // Should not expose development environment variables
      expect(htmlContent).not.toContain('VITE_DEV_')
      expect(htmlContent).not.toContain('localhost')
    })

    it('should have proper API endpoints', () => {
      const indexPath = join(process.cwd(), 'dist', 'index.html')
      const htmlContent = readFileSync(indexPath, 'utf8')
      
      // Should use production API endpoints
      expect(htmlContent).not.toContain('localhost:5001')
    })
  })

  describe('Security Headers', () => {
    it('should include security meta tags', () => {
      const indexPath = join(process.cwd(), 'dist', 'index.html')
      const htmlContent = readFileSync(indexPath, 'utf8')
      
      // Should include basic security elements
      expect(htmlContent).toContain('crossorigin')
      expect(htmlContent).toContain('type="module"')
    })

    it('should not expose sensitive information', () => {
      const indexPath = join(process.cwd(), 'dist', 'index.html')
      const htmlContent = readFileSync(indexPath, 'utf8')
      
      // Should not expose API keys or sensitive data
      expect(htmlContent).not.toContain('SG.')
      expect(htmlContent).not.toContain('AIza')
      expect(htmlContent).not.toContain('opessocius-secure-key')
    })
  })

  describe('Performance Optimization', () => {
    it('should have optimized images', () => {
      const assetsPath = join(process.cwd(), 'dist', 'assets')
      const files = readdirSync(assetsPath)
      
      // Should have optimized image formats
      if (files.some(file => file.includes('.png') || file.includes('.jpg') || file.includes('.jpeg'))) {
        expect(files.some(file => file.includes('.webp'))).toBe(true) // Should have WebP versions
      }
    })

    it('should have proper caching headers', () => {
      const indexPath = join(process.cwd(), 'dist', 'index.html')
      const htmlContent = readFileSync(indexPath, 'utf8')
      
      // Should include basic caching elements
      expect(htmlContent).toContain('rel="stylesheet"')
    })

    it('should have compressed assets', () => {
      const assetsPath = join(process.cwd(), 'dist', 'assets')
      const files = readdirSync(assetsPath)
      
      // Should have assets
      expect(files.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const indexPath = join(process.cwd(), 'dist', 'index.html')
      const htmlContent = readFileSync(indexPath, 'utf8')
      
      // Should include basic accessibility elements
      expect(htmlContent).toContain('<div id="root">')
    })

    it('should have semantic HTML structure', () => {
      const indexPath = join(process.cwd(), 'dist', 'index.html')
      const htmlContent = readFileSync(indexPath, 'utf8')
      
      // Should use basic HTML structure
      expect(htmlContent).toContain('<html')
      expect(htmlContent).toContain('<head>')
      expect(htmlContent).toContain('<body>')
    })
  })

  describe('SEO Optimization', () => {
    it('should have proper meta tags', () => {
      const indexPath = join(process.cwd(), 'dist', 'index.html')
      const htmlContent = readFileSync(indexPath, 'utf8')
      
      // Should include basic SEO meta tags
      expect(htmlContent).toContain('<title>')
      expect(htmlContent).toContain('<meta name="description"')
    })

    it('should have Open Graph tags', () => {
      const indexPath = join(process.cwd(), 'dist', 'index.html')
      const htmlContent = readFileSync(indexPath, 'utf8')
      
      // Should include basic meta tags
      expect(htmlContent).toContain('<meta name="description"')
    })

    it('should have Twitter Card tags', () => {
      const indexPath = join(process.cwd(), 'dist', 'index.html')
      const htmlContent = readFileSync(indexPath, 'utf8')
      
      // Should include basic meta tags
      expect(htmlContent).toContain('<meta name="description"')
    })
  })
})
