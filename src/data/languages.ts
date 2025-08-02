export interface LanguageData {
  id: string;
  name: string;
  color: string;
  totalSpeakers: number;
  countries: CountryInfo[];
  globalCoverage: number; // percentage of world population
  officialCountries: number;
}

export interface CountryInfo {
  code: string;
  name: string;
  speakerPercentage: number;
  isOfficial: boolean;
  population: number;
  culturalNotes?: string;
}

export const languages: LanguageData[] = [
    {
    id: "english",
    name: "English",
    color: "language-english",
    totalSpeakers: 1500000000,
    globalCoverage: 18.8,
    officialCountries: 67,
    countries: [
      { code: "US", name: "United States", speakerPercentage: 95, isOfficial: true, population: 331000000, culturalNotes: "Primary language in business and education" },
      { code: "GB", name: "United Kingdom", speakerPercentage: 98, isOfficial: true, population: 67000000, culturalNotes: "Native English-speaking country" },
      { code: "CA", name: "Canada", speakerPercentage: 86, isOfficial: true, population: 38000000, culturalNotes: "Official language alongside French" },
      { code: "AU", name: "Australia", speakerPercentage: 96, isOfficial: true, population: 26000000, culturalNotes: "Primary language across the continent" },
      { code: "NZ", name: "New Zealand", speakerPercentage: 95, isOfficial: true, population: 5100000, culturalNotes: "Primary language, with Māori and NZ Sign Language also official" },
      { code: "IE", name: "Ireland", speakerPercentage: 97, isOfficial: true, population: 5000000, culturalNotes: "Official language alongside Irish (Gaeilge)" },
      { code: "IN", name: "India", speakerPercentage: 12, isOfficial: true, population: 1400000000, culturalNotes: "Widely used in business and higher education" },
      { code: "PK", name: "Pakistan", speakerPercentage: 48, isOfficial: true, population: 225000000, culturalNotes: "Official language used in government and by the elite, alongside Urdu" },
      { code: "NG", name: "Nigeria", speakerPercentage: 53, isOfficial: true, population: 220000000, culturalNotes: "Official language, unifying diverse ethnic groups" },
      { code: "PH", name: "Philippines", speakerPercentage: 92, isOfficial: true, population: 113000000, culturalNotes: "Co-official with Filipino; used in government, media, and education" },
      { code: "ZA", name: "South Africa", speakerPercentage: 13, isOfficial: true, population: 60000000, culturalNotes: "One of 11 official languages, acts as a lingua franca" },
      { code: "SG", name: "Singapore", speakerPercentage: 83, isOfficial: true, population: 5900000, culturalNotes: "One of four official languages, serves as the primary language of business" },
      { code: "JM", name: "Jamaica", speakerPercentage: 99, isOfficial: true, population: 2900000, culturalNotes: "The official language, though most daily conversation is in Jamaican Patois" }
    ]
  },  
  {
    id: "spanish",
    name: "Spanish",
    color: "language-spanish",
    totalSpeakers: 559000000,
    globalCoverage: 7.0,
    officialCountries: 21,
    countries: [
      { code: "MX", name: "Mexico", speakerPercentage: 98, isOfficial: true, population: 128000000, culturalNotes: "Largest Spanish-speaking country" },
      { code: "ES", name: "Spain", speakerPercentage: 99, isOfficial: true, population: 47000000, culturalNotes: "Origin of the Spanish language" },
      { code: "AR", name: "Argentina", speakerPercentage: 98, isOfficial: true, population: 45000000, culturalNotes: "Distinctive Rioplatense dialect" },
      { code: "CO", name: "Colombia", speakerPercentage: 99, isOfficial: true, population: 51000000, culturalNotes: "Known for clear, neutral accent" },
      { code: "PE", name: "Peru", speakerPercentage: 87, isOfficial: true, population: 33000000, culturalNotes: "Co-official with Quechua" },
      { code: "VE", name: "Venezuela", speakerPercentage: 98, isOfficial: true, population: 28000000, culturalNotes: "Caribbean Spanish variety" },
      { code: "US", name: "United States", speakerPercentage: 13, isOfficial: false, population: 331000000, culturalNotes: "Second largest Spanish-speaking population" },
    ]
  },
  {
    id: "mandarin",
    name: "Mandarin Chinese",
    color: "language-mandarin",
    totalSpeakers: 918000000,
    globalCoverage: 11.5,
    officialCountries: 4,
    countries: [
      { code: "CN", name: "China", speakerPercentage: 70, isOfficial: true, population: 1440000000, culturalNotes: "Standard Chinese, most spoken language" },
      { code: "TW", name: "Taiwan", speakerPercentage: 95, isOfficial: true, population: 24000000, culturalNotes: "Traditional Chinese characters used" },
      { code: "SG", name: "Singapore", speakerPercentage: 35, isOfficial: true, population: 6000000, culturalNotes: "One of four official languages" },
      { code: "MY", name: "Malaysia", speakerPercentage: 19, isOfficial: false, population: 33000000, culturalNotes: "Significant Chinese Malaysian population" },
    ]
  },
  {
    id: "french",
    name: "French",
    color: "language-french",
    totalSpeakers: 280000000,
    globalCoverage: 3.5,
    officialCountries: 29,
    countries: [
      { code: "FR", name: "France", speakerPercentage: 97, isOfficial: true, population: 68000000, culturalNotes: "Origin of the French language" },
      { code: "CD", name: "Democratic Republic of Congo", speakerPercentage: 51, isOfficial: true, population: 95000000, culturalNotes: "Largest French-speaking country by population" },
      { code: "CA", name: "Canada", speakerPercentage: 22, isOfficial: true, population: 38000000, culturalNotes: "Concentrated in Quebec province" },
      { code: "BE", name: "Belgium", speakerPercentage: 38, isOfficial: true, population: 11500000, culturalNotes: "Southern region (Wallonia) primarily French" },
      { code: "CH", name: "Switzerland", speakerPercentage: 18, isOfficial: true, population: 8700000, culturalNotes: "One of four national languages" },
      { code: "SN", name: "Senegal", speakerPercentage: 26, isOfficial: true, population: 17000000, culturalNotes: "Colonial language, widely used in education" },
    ]
  },
  {
    id: "portuguese",
    name: "Portuguese",
    color: "language-portuguese",
    totalSpeakers: 260000000,
    globalCoverage: 3.3,
    officialCountries: 9,
    countries: [
      { code: "BR", name: "Brazil", speakerPercentage: 98, isOfficial: true, population: 215000000, culturalNotes: "Largest Portuguese-speaking country" },
      { code: "PT", name: "Portugal", speakerPercentage: 95, isOfficial: true, population: 10000000, culturalNotes: "Origin of the Portuguese language" },
      { code: "AO", name: "Angola", speakerPercentage: 71, isOfficial: true, population: 33000000, culturalNotes: "Second largest Portuguese-speaking country" },
      { code: "MZ", name: "Mozambique", speakerPercentage: 50, isOfficial: true, population: 32000000, culturalNotes: "Portuguese as lingua franca" },
    ]
  },
  {
    id: "arabic",
    name: "Arabic",
    color: "language-arabic",
    totalSpeakers: 422000000,
    globalCoverage: 5.3,
    officialCountries: 26,
    countries: [
      { code: "EG", name: "Egypt", speakerPercentage: 94, isOfficial: true, population: 104000000, culturalNotes: "Egyptian dialect widely understood" },
      { code: "SA", name: "Saudi Arabia", speakerPercentage: 95, isOfficial: true, population: 35000000, culturalNotes: "Classical Arabic heartland" },
      { code: "DZ", name: "Algeria", speakerPercentage: 81, isOfficial: true, population: 44000000, culturalNotes: "Maghrebi Arabic dialect" },
      { code: "SD", name: "Sudan", speakerPercentage: 70, isOfficial: true, population: 45000000, culturalNotes: "Arabic and local languages coexist" },
      { code: "IQ", name: "Iraq", speakerPercentage: 78, isOfficial: true, population: 41000000, culturalNotes: "Mesopotamian Arabic variety" },
      { code: "MA", name: "Morocco", speakerPercentage: 65, isOfficial: true, population: 37000000, culturalNotes: "Darija (Moroccan Arabic) widely spoken" },
    ]
  }
];

export function getLanguageById(id: string): LanguageData | undefined {
  return languages.find(lang => lang.id === id);
}

export function calculateCommunicationReach(selectedLanguages: string[]): {
  totalSpeakers: number;
  countries: Set<string>;
  globalCoverage: number;
} {
  const allCountries = new Set<string>();
  const countryPopulations = new Map<string, number>();
  let totalSpeakers = 0;

  selectedLanguages.forEach(langId => {
    const language = getLanguageById(langId);
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