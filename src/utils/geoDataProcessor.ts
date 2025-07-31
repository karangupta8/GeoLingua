import { LanguageData, CountryInfo } from '@/data/languages';

// Country code to coordinates mapping for positioning
const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  US: [-95.7129, 37.0902],
  GB: [-3.4360, 55.3781],
  AU: [133.7751, -25.2744],
  CA: [-106.3468, 56.1304],
  IN: [78.9629, 20.5937],
  MX: [-102.5528, 23.6345],
  ES: [-3.7492, 40.4637],
  AR: [-63.6167, -38.4161],
  CO: [-74.2973, 4.5709],
  PE: [-75.0152, -9.1900],
  CL: [-71.5430, -35.6751],
  CN: [104.1954, 35.8617],
  TW: [120.9605, 23.6978],
  SG: [103.8198, 1.3521],
  MY: [101.9758, 4.2105],
  FR: [2.2137, 46.2276],
  BE: [4.4699, 50.5039],
  CH: [8.2275, 46.8182],
  LU: [6.1296, 49.8153],
  MC: [7.4167, 43.7333],
  SA: [45.0792, 23.8859],
  AE: [53.8478, 23.4241],
  EG: [30.8025, 26.8206],
  MA: [-7.0926, 31.7917],
  TN: [9.5375, 33.8869],
  DZ: [1.6596, 28.0339],
  LY: [17.2283, 26.3351],
  SD: [30.2176, 12.8628],
  IQ: [43.6793, 33.2232],
  SY: [38.9968, 34.8021],
  JO: [36.2384, 30.5852],
  LB: [35.8623, 33.8547],
  KW: [47.4818, 29.3117],
  QA: [51.1839, 25.3548],
  BH: [50.6344, 26.0667],
  OM: [55.9754, 21.4735],
  YE: [48.5164, 15.5527],
  BR: [-51.9253, -14.2351],
  PT: [-8.2245, 39.3999],
  AO: [17.8739, -11.2027],
  MZ: [35.5296, -18.6657],
  CV: [-24.0132, 16.5388],
  GW: [-15.1804, 11.8037],
  ST: [6.6071, 0.1864],
  TL: [125.7275, -8.8742],
  MO: [113.5439, 22.1987],
};

export interface ProcessedCountryData {
  code: string;
  name: string;
  coordinates: [number, number];
  speakerPercentage: number;
  isOfficial: boolean;
  population: number;
  languages: string[];
  color: string;
  intensity: number;
}

export interface HeatmapData {
  countries: ProcessedCountryData[];
  maxIntensity: number;
  colorScale: string[];
}

export function processLanguageDataForHeatmap(
  languages: LanguageData[],
  selectedLanguageIds: string[]
): HeatmapData {
  const countryDataMap = new Map<string, ProcessedCountryData>();
  const allLanguageColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  
  let maxIntensity = 0;

  selectedLanguageIds.forEach((langId, index) => {
    const language = languages.find(lang => lang.id === langId);
    if (!language) return;

    const languageColor = allLanguageColors[index % allLanguageColors.length];

    language.countries.forEach((country: CountryInfo) => {
      const coordinates = COUNTRY_COORDINATES[country.code];
      if (!coordinates) return;

      const existingCountry = countryDataMap.get(country.code);
      const currentIntensity = country.speakerPercentage;
      
      if (existingCountry) {
        // Combine data for countries with multiple selected languages
        existingCountry.speakerPercentage = Math.max(
          existingCountry.speakerPercentage,
          currentIntensity
        );
        existingCountry.languages.push(langId);
        existingCountry.intensity = Math.max(existingCountry.intensity, currentIntensity);
      } else {
        const processedCountry: ProcessedCountryData = {
          code: country.code,
          name: country.name,
          coordinates,
          speakerPercentage: currentIntensity,
          isOfficial: country.isOfficial,
          population: country.population,
          languages: [langId],
          color: languageColor,
          intensity: currentIntensity,
        };
        countryDataMap.set(country.code, processedCountry);
      }

      maxIntensity = Math.max(maxIntensity, currentIntensity);
    });
  });

  const countries = Array.from(countryDataMap.values());
  
  // Generate color scale based on intensity ranges
  const colorScale = generateColorScale(maxIntensity);

  return {
    countries,
    maxIntensity,
    colorScale,
  };
}

function generateColorScale(maxIntensity: number): string[] {
  const ranges = [
    { min: 0, max: 10, color: '#FEF3C7' },      // Very light yellow
    { min: 10, max: 25, color: '#FDE68A' },     // Light yellow
    { min: 25, max: 50, color: '#FBBF24' },     // Yellow
    { min: 50, max: 75, color: '#F59E0B' },     // Orange
    { min: 75, max: 90, color: '#DC2626' },     // Red
    { min: 90, max: 100, color: '#7C2D12' },    // Dark red
  ];

  return ranges
    .filter(range => range.min <= maxIntensity)
    .map(range => range.color);
}

export function generateGeoJSONFeatures(countries: ProcessedCountryData[]) {
  return countries.map(country => ({
    type: 'Feature' as const,
    properties: {
      code: country.code,
      name: country.name,
      speakerPercentage: country.speakerPercentage,
      isOfficial: country.isOfficial,
      population: country.population,
      languages: country.languages,
      intensity: country.intensity,
      color: country.color,
    },
    geometry: {
      type: 'Point' as const,
      coordinates: country.coordinates,
    },
  }));
}