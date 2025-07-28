import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Globe, MapPin, TrendingUp, Loader2 } from 'lucide-react';
import { languageService } from '@/services/languageService';

interface StatsDashboardProps {
  selectedLanguages: string[];
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ selectedLanguages }) => {
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
      title: "Total Speakers",
      value: formatNumber(stats.totalSpeakers),
      description: "People you can communicate with",
      icon: Users,
      gradient: "bg-gradient-primary"
    },
    {
      title: "Countries Covered",
      value: stats.countries.size.toString(),
      description: "Nations where these languages are spoken",
      icon: MapPin,
      gradient: "bg-gradient-secondary"
    },
    {
      title: "Global Reach",
      value: `${stats.globalCoverage.toFixed(1)}%`,
      description: "Of world population coverage",
      icon: Globe,
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
            <h3 className="text-lg font-semibold">Communication Dashboard</h3>
            <p className="text-muted-foreground">
              Select languages to see your global communication reach and insights
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
        <p className="text-muted-foreground">Calculating communication reach...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-card-custom">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Communication Reach</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Your global communication potential with selected languages
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statsCards.map((card, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${card.gradient} rounded-full flex items-center justify-center`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{card.value}</div>
                      <div className="text-sm font-medium text-foreground">{card.title}</div>
                      <div className="text-xs text-muted-foreground">{card.description}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Multilingual Advantage */}
      {selectedLanguages.length > 1 && (
        <Card className="shadow-card-custom bg-gradient-secondary">
          <CardContent className="p-6 text-secondary-foreground">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Multilingual Advantage</h3>
              <p className="text-sm opacity-90">
                Speaking {selectedLanguages.length} languages gives you access to <strong>{formatNumber(stats.totalSpeakers)} people</strong> across <strong>{stats.countries.size} countries</strong>, covering <strong>{stats.globalCoverage.toFixed(1)}%</strong> of the global population.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatsDashboard;