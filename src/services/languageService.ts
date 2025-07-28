import { LanguageData } from '@/data/languages';

interface LanguageResponse {
  languages: LanguageData[];
}

class LanguageService {
  private cache: LanguageData[] | null = null;

  async fetchLanguages(): Promise<LanguageData[]> {
    if (this.cache) {
      return this.cache;
    }

    try {
      const response = await fetch('/data/languages.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch languages: ${response.statusText}`);
      }

      const data: LanguageResponse = await response.json();
      this.cache = data.languages;
      return this.cache;
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw new Error('Failed to load language data');
    }
  }

  async getLanguageById(id: string): Promise<LanguageData | undefined> {
    const languages = await this.fetchLanguages();
    return languages.find(lang => lang.id === id);
  }

  async calculateCommunicationReach(selectedLanguages: string[]): Promise<{
    totalSpeakers: number;
    countries: Set<string>;
    globalCoverage: number;
  }> {
    const languages = await this.fetchLanguages();
    const allCountries = new Set<string>();
    let totalSpeakers = 0;
    let totalCoverage = 0;

    selectedLanguages.forEach(langId => {
      const language = languages.find(lang => lang.id === langId);
      if (language) {
        language.countries.forEach(country => {
          allCountries.add(country.code);
        });
        totalSpeakers += language.totalSpeakers;
        totalCoverage += language.globalCoverage;
      }
    });

    return {
      totalSpeakers,
      countries: allCountries,
      globalCoverage: Math.min(totalCoverage, 100)
    };
  }

  clearCache(): void {
    this.cache = null;
  }
}

export const languageService = new LanguageService();