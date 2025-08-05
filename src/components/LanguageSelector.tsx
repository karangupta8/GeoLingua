import React, { useState, useEffect } from 'react';
import { Search, X, Globe2, Users, MapPin, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguages } from '@/hooks/useLanguages';
import { LanguageData } from '@/data/languages';

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onLanguageToggle: (languageId: string) => void;
}

// Color palette for languages
const LANGUAGE_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#A855F7', // Violet
  '#F43F5E', // Rose
  '#22C55E', // Emerald
  '#EAB308', // Amber
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#A855F7', // Violet
  '#F43F5E', // Rose
  '#22C55E', // Emerald
];

// Function to get color for a language
const getLanguageColor = (languageId: string, languageIndex: number): string => {
  // Try to use CSS custom property first (for languages that have them defined)
  const cssColor = getComputedStyle(document.documentElement)
    .getPropertyValue(`--language-${languageId}`)
    .trim();
  
  if (cssColor) {
    return `hsl(${cssColor})`;
  }
  
  // Fall back to the color palette
  return LANGUAGE_COLORS[languageIndex % LANGUAGE_COLORS.length];
};

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguages,
  onLanguageToggle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'popular' | 'official'>('all');
  const { languages, isLoading, error, refetch } = useLanguages();

  const filteredLanguages = languages.filter(language => {
    const matchesSearch = language.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'popular') {
      return matchesSearch && language.totalSpeakers > 300000000;
    } else if (filterBy === 'official') {
      return matchesSearch && language.officialCountries > 10;
    }
    
    return matchesSearch;
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  if (isLoading) {
    return (
      <Card className="shadow-card-custom">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading languages...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-card-custom">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card-custom">
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="flex items-center space-x-2">
            <Globe2 className="w-5 h-5 text-primary" />
            <span>Select Languages</span>
          </CardTitle>
          <CardDescription>
            Choose the languages you speak or are learning
          </CardDescription>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search languages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterBy} onValueChange={(value: 'all' | 'popular' | 'official') => setFilterBy(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              <SelectItem value="popular">Popular (300M+ speakers)</SelectItem>
              <SelectItem value="official">Widely Official (10+ countries)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Selected Languages */}
        {selectedLanguages.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Selected Languages</h4>
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
      </CardHeader>

      <CardContent className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground">Available Languages</h4>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredLanguages.map((language: LanguageData, index: number) => {
            const isSelected = selectedLanguages.includes(language.id);
            const languageColor = getLanguageColor(language.id, index);

            return (
              <div
                key={language.id}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover-scale
                  ${isSelected 
                    ? 'border-primary bg-primary/5 shadow-card-custom' 
                    : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  }
                `}
                onClick={() => onLanguageToggle(language.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: languageColor }}
                    />
                    <div>
                      <h4 className="font-semibold text-foreground">{language.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{formatNumber(language.totalSpeakers)} speakers</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
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
      </CardContent>
    </Card>
  );
};

export default LanguageSelector;