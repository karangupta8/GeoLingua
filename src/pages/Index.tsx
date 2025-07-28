import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LanguageSelector from '@/components/LanguageSelector';
import StatsDashboard from '@/components/StatsDashboard';
import WorldMap from '@/components/WorldMap';
import CountryBreakdown from '@/components/CountryBreakdown';
import { Globe, BarChart3, Map, Users } from 'lucide-react';
import Globe3D from '@/components/Globe3D';

const Index = () => {
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
      {/* Header */}
      <div className="bg-card shadow-card-custom border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                GeoLingua – Discover Your Global Communication Power
              </h1>
            </div>
            
            {/* Questions Section */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground">
                Answer these questions:
              </h2>
              <div className="space-y-2 text-lg text-muted-foreground max-w-3xl mx-auto">
                <p>Pick a language and instantly see how many people you can connect with, across countries and cultures</p>
                <p>Explore the languages of the world, their speakers, and global influence in one interactive map.</p>
                <p>See where your words can take you—visualize how far your language reaches across the world.</p>
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

          {/* Main Dashboard */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-card">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center space-x-2">
                  <Map className="w-4 h-4" />
                  <span className="hidden sm:inline">Map</span>
                </TabsTrigger>
                <TabsTrigger value="countries" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Countries</span>
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">Insights</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <StatsDashboard selectedLanguages={selectedLanguages} />
              </TabsContent>

              <TabsContent value="map" className="space-y-6">
                <Globe3D selectedLanguages={selectedLanguages} />
              </TabsContent>

              <TabsContent value="countries" className="space-y-6">
                <CountryBreakdown selectedLanguages={selectedLanguages} />
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StatsDashboard selectedLanguages={selectedLanguages} />
                  <Globe3D selectedLanguages={selectedLanguages} />
                </div>
              </TabsContent>
            </Tabs>
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
