import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getLanguageById } from '@/data/languages';
import { Users, MapPin, Info } from 'lucide-react';

interface CountryBreakdownProps {
  selectedLanguages: string[];
}

const CountryBreakdown: React.FC<CountryBreakdownProps> = ({ selectedLanguages }) => {
  // Get all unique countries from selected languages
  const getCountryBreakdown = () => {
    const countryMap = new Map();

    selectedLanguages.forEach(langId => {
      const language = getLanguageById(langId);
      if (language) {
        language.countries.forEach(country => {
          const key = country.code;
          if (!countryMap.has(key)) {
            countryMap.set(key, {
              ...country,
              languages: []
            });
          }
          countryMap.get(key).languages.push({
            name: language.name,
            color: language.color,
            percentage: country.speakerPercentage,
            isOfficial: country.isOfficial
          });
        });
      }
    });

    return Array.from(countryMap.values()).sort((a, b) => 
      Math.max(...b.languages.map(l => l.percentage)) - Math.max(...a.languages.map(l => l.percentage))
    );
  };

  const countries = getCountryBreakdown();

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  if (selectedLanguages.length === 0) {
    return (
      <Card className="p-8 bg-card shadow-card-custom">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Country Analysis</h3>
          <p className="text-muted-foreground">
            Select languages to see detailed country breakdowns and cultural insights
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card shadow-card-custom">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Country Breakdown</h2>
          <p className="text-muted-foreground">
            Detailed analysis of countries where your languages are spoken
          </p>
        </div>

        <div className="space-y-4">
          {countries.map((country, index) => (
            <Card key={country.code} className="p-5 bg-secondary/20 border-l-4 border-primary">
              <div className="space-y-4">
                {/* Country Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-xl font-semibold text-foreground">
                      {country.name}
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{formatNumber(country.population)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-primary">
                      {Math.max(...country.languages.map(l => l.percentage))}% max
                    </div>
                    <div className="text-xs text-muted-foreground">
                      speaker density
                    </div>
                  </div>
                </div>

                {/* Languages in this country */}
                <div className="space-y-2">
                  {country.languages.map((lang, langIndex) => (
                    <div 
                      key={langIndex}
                      className="flex items-center justify-between p-3 bg-card rounded-lg border"
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
                <div className="p-3 bg-gradient-secondary rounded-lg text-primary-foreground">
                  <div className="text-sm">
                    <strong>Travel Insight:</strong> {
                      Math.max(...country.languages.map(l => l.percentage)) >= 70 
                        ? "Excellent communication - you'll have no trouble getting around!"
                        : Math.max(...country.languages.map(l => l.percentage)) >= 40
                        ? "Good communication - locals will appreciate your effort!"
                        : "Limited communication - consider learning key phrases or using translation tools."
                    }
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {countries.length > 0 && (
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              You can communicate effectively in <strong>{countries.length} countries</strong> with your selected languages
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CountryBreakdown;