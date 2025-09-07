import { snapshotService } from './snapshotService';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('snapshotService', () => {
  beforeEach(() => {
    // Reset the DOM before each test
    document.body.innerHTML = '';
  });

  describe('generateFilename', () => {
    it('should generate a filename with language names if elements are found', () => {
      // Arrange
      const selectedLanguages = ['en', 'fr'];
      const enElement = document.createElement('div');
      enElement.setAttribute('data-language-id', 'en');
      enElement.textContent = 'English';
      document.body.appendChild(enElement);

      const frElement = document.createElement('div');
      frElement.setAttribute('data-language-id', 'fr');
      frElement.textContent = 'French';
      document.body.appendChild(frElement);

      const timestamp = new Date().toISOString().split('T')[0];

      // Act
      const filename = snapshotService.generateFilename(selectedLanguages);

      // Assert
      expect(filename).toBe(`language-insights-english-french-${timestamp}`);
    });

    it('should generate a filename with language IDs if elements are not found', () => {
      // Arrange
      const selectedLanguages = ['en', 'fr'];
      const timestamp = new Date().toISOString().split('T')[0];

      // Act
      const filename = snapshotService.generateFilename(selectedLanguages);

      // Assert
      expect(filename).toBe(`language-insights-en-fr-${timestamp}`);
    });

    it('should handle empty selectedLanguages array', () => {
      // Arrange
      const selectedLanguages: string[] = [];
      const timestamp = new Date().toISOString().split('T')[0];

      // Act
      const filename = snapshotService.generateFilename(selectedLanguages);

      // Assert
      expect(filename).toBe(`language-insights-global-${timestamp}`);
    });

    it('should handle special characters in language names', () => {
        // Arrange
        const selectedLanguages = ['zh-CN'];
        const element = document.createElement('div');
        element.setAttribute('data-language-id', 'zh-CN');
        element.textContent = 'Chinese (Simplified)';
        document.body.appendChild(element);

        const timestamp = new Date().toISOString().split('T')[0];

        // Act
        const filename = snapshotService.generateFilename(selectedLanguages);

        // Assert
        expect(filename).toBe(`language-insights-chinese-(simplified)-${timestamp}`);
      });
  });
});
