import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';
import StatsDashboard from '@/components/StatsDashboard';
import WorldMap from '@/components/WorldMap';
import CountryBreakdown from '@/components/CountryBreakdown';
import { Globe } from 'lucide-react';
import Globe3D from '@/components/Globe3D';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const Index = () => {
  const { t } = useTranslation(['hero', 'navigation']);
  const [selectedLanguages, setSelectedLanguages] = React.useState<string[]>([]);

  const handleLanguageToggle = (languageId: string) => {
    setSelectedLanguages(prev => 
      prev.includes(languageId)
        ? prev.filter(id => id !== languageId)
        : [...prev, languageId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header with Language Switcher */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Modern Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl mx-4 mt-4 mb-8 overflow-hidden shadow-2xl">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[500px]">
            {/* Left Side - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                 <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                   <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                     GeoLingua
                   </span>
                   <br />
                   <span className="text-foreground text-4xl lg:text-5xl">
                     {t('hero:title')}
                   </span>
                 </h1>
                 
                 <div className="space-y-4 text-lg text-muted-foreground max-w-xl">
                   <p>{t('hero:subtitle')}</p>
                 </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-primary/10 text-primary px-6 py-3 rounded-full text-sm font-medium border border-primary/20">
                  ✨ Interactive Language Explorer
                </div>
                <div className="bg-secondary/10 text-secondary-foreground px-6 py-3 rounded-full text-sm font-medium border border-secondary/20">
                  🌍 Global Communication Insights
                </div>
              </div>
            </div>

            {/* Right Side - 3D Globe Placeholder */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 shadow-2xl animate-pulse">
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-300 via-purple-400 to-indigo-500 opacity-80">
                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-200 via-purple-300 to-indigo-400 opacity-60">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Globe className="w-32 h-32 text-white animate-spin" style={{ animationDuration: '20s' }} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
                  <span className="text-2xl">🗣️</span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '1s' }}>
                  <span className="text-2xl">🌏</span>
                </div>
                <div className="absolute top-1/2 -right-8 w-12 h-12 bg-red-400 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '1.5s' }}>
                  <span className="text-xl">💬</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Language Selector Sidebar */}
          <div className="lg:col-span-1">
            <LanguageSelector
              selectedLanguages={selectedLanguages}
              onLanguageToggle={handleLanguageToggle}
            />
          </div>

          {/* Main Dashboard - Vertically Stacked Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Statistics Dashboard Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                📊 Language Insights
              </h2>
              <StatsDashboard selectedLanguages={selectedLanguages} />
            </div>

            {/* 3D Globe Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                🌍 Interactive Globe
              </h2>
              <Globe3D selectedLanguages={selectedLanguages} />
            </div>

            {/* Country Breakdown Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                🏆 Country Breakdown
              </h2>
              <CountryBreakdown selectedLanguages={selectedLanguages} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-card border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              Explore the world through languages • Connect across cultures • Discover global communication opportunities
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
