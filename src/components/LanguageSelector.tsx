import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { languages, LanguageData } from '@/data/languages';
import { Search, X, Globe, Users } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onLanguageToggle: (languageId: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguages,
  onLanguageToggle,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <Card className="p-6 bg-card shadow-card-custom">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Select Languages</h2>
          <p className="text-muted-foreground">Choose the languages you speak or are learning</p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search languages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selected Languages */}
        {selectedLanguages.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Selected Languages</h3>
            <div className="flex flex-wrap gap-2">
              {selectedLanguages.map(langId => {
                const language = languages.find(l => l.id === langId);
                if (!language) return null;
                
                return (
                  <Badge
                    key={langId}
                    variant="secondary"
                    className="px-3 py-2 text-sm bg-gradient-primary text-primary-foreground hover:opacity-90 transition-all duration-300"
                  >
                    <span className="mr-2">{language.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onLanguageToggle(langId)}
                      className="h-4 w-4 p-0 hover:bg-white/20"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Languages */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Available Languages</h3>
          <div className="grid gap-3">
            {filteredLanguages.map((language: LanguageData) => {
              const isSelected = selectedLanguages.includes(language.id);
              
              return (
                <div
                  key={language.id}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                    ${isSelected 
                      ? 'border-primary bg-primary/5 shadow-language' 
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }
                  `}
                  onClick={() => onLanguageToggle(language.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className={`w-4 h-4 rounded-full bg-${language.color}`}
                        style={{ backgroundColor: `hsl(var(--${language.color}))` }}
                      />
                      <div>
                        <h4 className="font-semibold text-foreground">{language.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{formatNumber(language.totalSpeakers)} speakers</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Globe className="w-3 h-3" />
                            <span>{language.officialCountries} countries</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-foreground">
                        {language.globalCoverage}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        global reach
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LanguageSelector;