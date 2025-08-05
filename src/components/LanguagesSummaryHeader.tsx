import React from 'react';
import { Clock, Globe2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguages } from '@/hooks/useLanguages';

interface LanguagesSummaryHeaderProps {
  selectedLanguages: string[];
}

const LanguagesSummaryHeader: React.FC<LanguagesSummaryHeaderProps> = ({ selectedLanguages }) => {
  const { languages } = useLanguages();
  
  const selectedLanguageData = selectedLanguages
    .map(id => languages.find(lang => lang.id === id))
    .filter(Boolean);

  const formatTimestamp = () => {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="mb-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe2 className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Language Insights Report</h1>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Generated on {formatTimestamp()}</span>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Selected Languages</h2>
              <div className="flex flex-wrap justify-center gap-2">
                {selectedLanguageData.map((language, index) => (
                  <div 
                    key={language?.id}
                    className="flex items-center gap-2 px-3 py-2 bg-background/80 rounded-full border"
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: `hsl(var(--${language?.color}))` }}
                    />
                    <span className="text-sm font-medium">{language?.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Analyzing communication potential across {selectedLanguageData.length} selected {selectedLanguageData.length === 1 ? 'language' : 'languages'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguagesSummaryHeader;