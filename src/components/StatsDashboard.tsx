import React from 'react';
import { Card } from '@/components/ui/card';
import { calculateCommunicationReach } from '@/data/languages';
import { Globe, Users, MapPin, TrendingUp } from 'lucide-react';

interface StatsDashboardProps {
  selectedLanguages: string[];
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ selectedLanguages }) => {
  const stats = calculateCommunicationReach(selectedLanguages);

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
      description: "People you can potentially communicate with",
      icon: Users,
      color: "text-language-english",
      bgColor: "bg-language-english/10"
    },
    {
      title: "Countries",
      value: stats.countries.size.toString(),
      description: "Countries where these languages are spoken",
      icon: MapPin,
      color: "text-language-spanish",
      bgColor: "bg-language-spanish/10"
    },
    {
      title: "Global Coverage",
      value: `${stats.globalCoverage.toFixed(1)}%`,
      description: "Of world population you can reach",
      icon: Globe,
      color: "text-language-french",
      bgColor: "bg-language-french/10"
    },
    {
      title: "Communication Power",
      value: selectedLanguages.length > 0 ? "High" : "None",
      description: "Your multilingual advantage",
      icon: TrendingUp,
      color: "text-language-mandarin",
      bgColor: "bg-language-mandarin/10"
    }
  ];

  if (selectedLanguages.length === 0) {
    return (
      <Card className="p-8 bg-card shadow-card-custom">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Globe className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Select Languages to See Stats</h3>
          <p className="text-muted-foreground">
            Choose one or more languages to discover your global communication reach
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Your Language Impact
        </h2>
        <p className="text-muted-foreground">
          Discover your global communication potential
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className="p-6 bg-card shadow-card-custom hover:shadow-language transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {stat.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedLanguages.length > 1 && (
        <Card className="p-6 bg-gradient-secondary text-primary-foreground shadow-language">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Multilingual Advantage</h3>
            <p className="text-sm opacity-90">
              Speaking {selectedLanguages.length} languages gives you access to {formatNumber(stats.totalSpeakers)} speakers 
              across {stats.countries.size} countries - that's {stats.globalCoverage.toFixed(1)}% of the world's population!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StatsDashboard;