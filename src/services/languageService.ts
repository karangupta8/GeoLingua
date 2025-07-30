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
    const countryPopulations = new Map<string, number>();
    let totalSpeakers = 0;

    selectedLanguages.forEach(langId => {
      const language = languages.find(lang => lang.id === langId);
      if (language) {
        language.countries.forEach(country => {
          allCountries.add(country.code);
          // Track the maximum population that can be reached in each country
          const reachablePopulation = Math.floor(country.population * (country.speakerPercentage / 100));
          const existingPopulation = countryPopulations.get(country.code) || 0;
          countryPopulations.set(country.code, Math.max(existingPopulation, reachablePopulation));
        });
        totalSpeakers += language.totalSpeakers;
      }
    });

    // Calculate actual global coverage based on unique population reached
    const totalReachablePopulation = Array.from(countryPopulations.values()).reduce((sum, pop) => sum + pop, 0);
    const worldPopulation = 8000000000; // Approximate current world population
    const globalCoverage = Math.min((totalReachablePopulation / worldPopulation) * 100, 100);

    return {
      totalSpeakers,
      countries: allCountries,
      globalCoverage: Math.round(globalCoverage * 10) / 10 // Round to 1 decimal place
    };
  }

  clearCache(): void {
    this.cache = null;
  }
}

export const languageService = new LanguageService();