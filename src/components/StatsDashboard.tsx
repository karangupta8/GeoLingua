import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Earth, MapPin, TrendingUp, Loader2 } from 'lucide-react';
import { languageService } from '@/services/languageService';

interface StatsDashboardProps {
  selectedLanguages: string[];
}

const StatsDashboard = React.forwardRef<HTMLDivElement, StatsDashboardProps>(({ selectedLanguages }, ref) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [stats, setStats] = useState({ totalSpeakers: 0, countries: new Set<string>(), globalCoverage: 0 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      if (selectedLanguages.length === 0) {
        setStats({ totalSpeakers: 0, countries: new Set<string>(), globalCoverage: 0 });
        return;
      }

      setIsLoading(true);
      try {
        const result = await languageService.calculateCommunicationReach(selectedLanguages);
        setStats(result);
      } catch (error) {
        console.error('Error calculating stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [selectedLanguages]);

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const statsCards = [
    {
      title: t('dashboard:totalSpeakers'),
      value: formatNumber(stats.totalSpeakers),
      description: t('dashboard:speakersDescription'),
      icon: Users,
      gradient: "bg-gradient-primary"
    },
    {
      title: t('dashboard:countriesCovered'),
      value: stats.countries.size.toString(),
      description: t('dashboard:countriesDescription'),
      icon: MapPin,
      gradient: "bg-gradient-secondary"
    },
    {
      title: t('dashboard:globalReach'),
      value: `${stats.globalCoverage.toFixed(1)}%`,
      description: t('dashboard:reachDescription'),
      icon: Earth,
      gradient: "bg-gradient-accent"
    }
  ];

  if (selectedLanguages.length === 0) {
    return (
      <Card className="p-8 text-center shadow-card-custom">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
            <TrendingUp className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{t('dashboard:totalSpeakers')}</h3>
            <p className="text-muted-foreground">
              {t('dashboard:selectLanguages')}
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
        <p className="text-muted-foreground">{t('common:loading')}</p>
      </Card>
    );
  }

  return (
    <div ref={ref} id="stats-dashboard" className="space-y-6">
      {/* Simplified Communication Reach */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsCards.map((card, index) => (
          <Card key={index} className="relative overflow-hidden shadow-card-custom hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 ${card.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-2xl font-bold text-foreground mb-1">{card.value}</div>
                  <div className="text-sm font-medium text-foreground">{card.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{card.description}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Multilingual Advantage */}
      {selectedLanguages.length > 1 && (
        <Card className="shadow-card-custom bg-gradient-secondary">
          <CardContent className="p-6 text-secondary-foreground">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">{t('dashboard:multilingualAdvantage')}</h3>
              <p className="text-sm opacity-90">
                {t('dashboard:advantageDescription', { 
                  speakers: formatNumber(stats.totalSpeakers), 
                  countries: stats.countries.size,
                  coverage: stats.globalCoverage.toFixed(1)
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

StatsDashboard.displayName = 'StatsDashboard';

export default React.memo(StatsDashboard);