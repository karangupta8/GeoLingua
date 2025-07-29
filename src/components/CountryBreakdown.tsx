import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Flag, Info, Loader2 } from 'lucide-react';
import { languageService } from '@/services/languageService';
import { LanguageData, CountryInfo } from '@/data/languages';

interface CountryBreakdownProps {
  selectedLanguages: string[];
}

const CountryBreakdown: React.FC<CountryBreakdownProps> = ({ selectedLanguages }) => {
  const [allCountries, setAllCountries] = useState<Array<{
    country: CountryInfo;
    language: string;
    languageName: string;
    color: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCountryData = async () => {
      if (selectedLanguages.length === 0) {
        setAllCountries([]);
        return;
      }

      setIsLoading(true);
      try {
        const countries: Array<{
          country: CountryInfo;
          language: string;
          languageName: string;
          color: string;
        }> = [];

        for (const langId of selectedLanguages) {
          const language = await languageService.getLanguageById(langId);
          if (language) {
            language.countries.forEach(country => {
              countries.push({
                country,
                language: langId,
                languageName: language.name,
                color: language.color
              });
            });
          }
        }

        setAllCountries(countries);
      } catch (error) {
        console.error('Error loading country data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCountryData();
  }, [selectedLanguages]);

  // Group countries by country code
  const groupedCountries = allCountries.reduce((acc, item) => {
    const { country, languageName, color } = item;
    const key = country.code;
    
    if (!acc[key]) {
      acc[key] = {
        ...country,
        languages: []
      };
    }
    
    acc[key].languages.push({
      name: languageName,
      color,
      percentage: country.speakerPercentage,
      isOfficial: country.isOfficial
    });
    
    return acc;
  }, {} as Record<string, any>);

  const countries = Object.values(groupedCountries).sort((a: any, b: any) => 
    Math.max(...b.languages.map((l: any) => l.percentage)) - Math.max(...a.languages.map((l: any) => l.percentage))
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  if (selectedLanguages.length === 0) {
    return (
      <Card className="p-8 text-center shadow-card-custom">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Country Analysis</h3>
            <p className="text-muted-foreground">
              Select languages to see detailed country-wise breakdown and travel insights
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-8 text-center shadow-card-custom">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading country data...</p>
      </Card>
    );
  }

  return (
    <Card className="shadow-card-custom">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Flag className="w-5 h-5 text-primary" />
          <span>Country Analysis</span>
        </CardTitle>
        <p className="text-muted-foreground">
          Detailed breakdown of countries where your languages are spoken
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {countries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No country data available for selected languages.</p>
          </div>
        ) : (
          <>
            {/* Summary Message at Top */}
            <Card className="bg-gradient-primary text-primary-foreground">
              <CardContent className="p-4 text-center">
                <p className="text-lg font-semibold">
                  You can communicate effectively in <strong>{countries.length} countries</strong> with your selected languages
                </p>
              </CardContent>
            </Card>

            {countries.map((country: any, index: number) => (
              <Card key={country.code} className="border-l-4 border-primary">
                <CardContent className="p-4 space-y-4">
                  {/* Country Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-semibold text-foreground">
                        {country.name}
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{formatNumber(country.population)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-primary">
                        {Math.max(...country.languages.map((l: any) => l.percentage))}% max
                      </div>
                      <div className="text-xs text-muted-foreground">
                        speaker density
                      </div>
                    </div>
                  </div>

                  {/* Languages in this country */}
                  <div className="space-y-2">
                    {country.languages.map((lang: any, langIndex: number) => (
                      <div 
                        key={langIndex}
                        className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border"
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: `hsl(var(--${lang.color}))` }}
                          />
                          <span className="font-medium text-foreground">{lang.name}</span>
                          {lang.isOfficial && (
                            <Badge variant="secondary" className="text-xs px-2 py-0">
                              Official
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">{lang.percentage}%</div>
                          <div className="text-xs text-muted-foreground">speakers</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cultural Notes */}
                  {country.culturalNotes && (
                    <div className="flex items-start space-x-2 p-3 bg-accent/10 rounded-lg">
                      <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-foreground mb-1">Cultural Context</div>
                        <div className="text-xs text-muted-foreground">{country.culturalNotes}</div>
                      </div>
                    </div>
                  )}

                  {/* Travel Insight */}
                  <div className="p-3 bg-gradient-secondary rounded-lg text-secondary-foreground">
                    <div className="text-sm">
                      <strong>Travel Insight:</strong> {
                        Math.max(...country.languages.map((l: any) => l.percentage)) >= 70 
                          ? "Excellent communication - you'll have no trouble getting around!"
                          : Math.max(...country.languages.map((l: any) => l.percentage)) >= 40
                          ? "Good communication - locals will appreciate your effort!"
                          : "Limited communication - consider learning key phrases or using translation tools."
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CountryBreakdown;