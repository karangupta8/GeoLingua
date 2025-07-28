import React from 'react';
import { Card } from '@/components/ui/card';
import { languages, getLanguageById } from '@/data/languages';
import { Badge } from '@/components/ui/badge';

interface WorldMapProps {
  selectedLanguages: string[];
}

const WorldMap: React.FC<WorldMapProps> = ({ selectedLanguages }) => {
  // Get all countries that speak the selected languages
  const getCountryData = () => {
    const countryMap = new Map<string, {
      name: string;
      languages: Array<{ name: string; percentage: number; color: string; isOfficial: boolean }>;
      maxPercentage: number;
    }>();

    selectedLanguages.forEach(langId => {
      const language = getLanguageById(langId);
      if (language) {
        language.countries.forEach(country => {
          const existing = countryMap.get(country.code);
          const languageData = {
            name: language.name,
            percentage: country.speakerPercentage,
            color: language.color,
            isOfficial: country.isOfficial
          };

          if (existing) {
            existing.languages.push(languageData);
            existing.maxPercentage = Math.max(existing.maxPercentage, country.speakerPercentage);
          } else {
            countryMap.set(country.code, {
              name: country.name,
              languages: [languageData],
              maxPercentage: country.speakerPercentage
            });
          }
        });
      }
    });

    return countryMap;
  };

  const countryData = getCountryData();

  const getIntensityClass = (percentage: number) => {
    if (percentage >= 80) return 'opacity-100';
    if (percentage >= 60) return 'opacity-80';
    if (percentage >= 40) return 'opacity-60';
    if (percentage >= 20) return 'opacity-40';
    return 'opacity-25';
  };

  const formatPercentage = (num: number) => `${num}%`;

  if (selectedLanguages.length === 0) {
    return (
      <Card className="p-8 bg-card shadow-card-custom">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground">Interactive World Map</h3>
          <p className="text-muted-foreground">
            Select languages to see their global distribution and speaker density
          </p>
        </div>
      </Card>
    );
  }

  // Create a simplified world map visualization
  const regions = [
    { name: 'North America', countries: ['US', 'CA', 'MX'] },
    { name: 'South America', countries: ['BR', 'AR', 'CO', 'PE', 'VE'] },
    { name: 'Europe', countries: ['GB', 'FR', 'ES', 'PT', 'BE', 'CH'] },
    { name: 'Africa', countries: ['NG', 'ZA', 'EG', 'DZ', 'SD', 'MA', 'AO', 'MZ', 'SN', 'CD'] },
    { name: 'Asia', countries: ['CN', 'IN', 'JP', 'SA', 'IQ'] },
    { name: 'Oceania', countries: ['AU'] },
    { name: 'Other', countries: ['TW', 'SG', 'MY'] }
  ];

  return (
    <Card className="p-6 bg-card shadow-card-custom">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Global Language Distribution</h2>
          <p className="text-muted-foreground">
            Regions where your selected languages are spoken
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3">
          {selectedLanguages.map(langId => {
            const language = getLanguageById(langId);
            if (!language) return null;
            
            return (
              <Badge 
                key={langId}
                variant="outline"
                className="flex items-center space-x-2 px-3 py-1"
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: `hsl(var(--${language.color}))` }}
                />
                <span>{language.name}</span>
              </Badge>
            );
          })}
        </div>

        {/* Simplified Map by Regions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.map(region => {
            const regionCountries = region.countries.filter(countryCode => 
              countryData.has(countryCode)
            );

            if (regionCountries.length === 0) return null;

            return (
              <Card key={region.name} className="p-4 bg-secondary/50">
                <h3 className="font-semibold text-foreground mb-3">{region.name}</h3>
                <div className="space-y-2">
                  {regionCountries.map(countryCode => {
                    const country = countryData.get(countryCode);
                    if (!country) return null;

                    return (
                      <div 
                        key={countryCode} 
                        className="p-3 bg-card rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{country.name}</span>
                          <span className="text-xs text-muted-foreground">
                            Up to {formatPercentage(country.maxPercentage)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {country.languages.map((lang, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: `hsl(var(--${lang.color}))` }}
                                />
                                <span>{lang.name}</span>
                                {lang.isOfficial && (
                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                    Official
                                  </Badge>
                                )}
                              </div>
                              <span className="text-muted-foreground">
                                {formatPercentage(lang.percentage)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Summary */}
        <div className="text-center p-4 bg-gradient-primary rounded-lg text-primary-foreground">
          <p className="text-sm">
            Your selected languages are spoken across {countryData.size} countries in {regions.filter(region => 
              region.countries.some(countryCode => countryData.has(countryCode))
            ).length} regions worldwide
          </p>
        </div>
      </div>
    </Card>
  );
};

export default WorldMap;