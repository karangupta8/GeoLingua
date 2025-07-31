import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Map, Maximize2, RotateCcw } from 'lucide-react';
import { MAPBOX_ACCESS_TOKEN, DEFAULT_MAP_CONFIG, MAPBOX_STYLES } from '@/config/mapbox';
import { useLanguages } from '@/hooks/useLanguages';
import { processLanguageDataForHeatmap, generateGeoJSONFeatures } from '@/utils/geoDataProcessor';
import { useTranslation } from 'react-i18next';

interface MapboxHeatmapProps {
  selectedLanguages: string[];
}

const MapboxHeatmap: React.FC<MapboxHeatmapProps> = ({ selectedLanguages }) => {
  const { t } = useTranslation(['dashboard', 'countries']);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const { languages, isLoading } = useLanguages();
  
  const [mapStyle, setMapStyle] = useState<'globe' | 'flat'>('globe');
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(true);

  // Check if Mapbox token is configured
  const isMapboxConfigured = MAPBOX_ACCESS_TOKEN && MAPBOX_ACCESS_TOKEN !== 'your-mapbox-access-token-here';

  useEffect(() => {
    if (!mapContainer.current || !isMapboxConfigured) return;

    // Initialize Mapbox
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_STYLES.dark,
      projection: mapStyle === 'globe' ? 'globe' : 'mercator',
      zoom: DEFAULT_MAP_CONFIG.zoom,
      center: DEFAULT_MAP_CONFIG.center,
      pitch: mapStyle === 'globe' ? DEFAULT_MAP_CONFIG.pitch : 0,
      bearing: DEFAULT_MAP_CONFIG.bearing,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add atmosphere for globe mode
    if (mapStyle === 'globe') {
      map.current.on('style.load', () => {
        if (map.current) {
          map.current.setFog({
            color: 'rgb(186, 210, 235)',
            'high-color': 'rgb(36, 92, 223)',
            'horizon-blend': 0.02,
          });
        }
      });
    }

    // Auto-rotation for globe mode
    let rotationAnimation: number;
    if (mapStyle === 'globe' && isRotating) {
      const rotateGlobe = () => {
        if (map.current && isRotating) {
          const center = map.current.getCenter();
          center.lng -= 0.2;
          map.current.easeTo({ center, duration: 100, easing: (n) => n });
          rotationAnimation = requestAnimationFrame(rotateGlobe);
        }
      };
      rotateGlobe();
    }

    // Stop rotation on user interaction
    const stopRotation = () => setIsRotating(false);
    map.current.on('mousedown', stopRotation);
    map.current.on('touchstart', stopRotation);

    return () => {
      if (rotationAnimation) {
        cancelAnimationFrame(rotationAnimation);
      }
      map.current?.remove();
    };
  }, [mapStyle, isRotating, isMapboxConfigured]);

  // Update heatmap data when languages change
  useEffect(() => {
    if (!map.current || !languages.length || !selectedLanguages.length) return;

    const heatmapData = processLanguageDataForHeatmap(languages, selectedLanguages);
    const geoJsonFeatures = generateGeoJSONFeatures(heatmapData.countries);

    map.current.on('load', () => {
      if (!map.current) return;

      // Remove existing sources and layers
      if (map.current.getSource('language-heatmap')) {
        map.current.removeLayer('heatmap-layer');
        map.current.removeLayer('country-points');
        map.current.removeSource('language-heatmap');
      }

      // Add new data source
      map.current.addSource('language-heatmap', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: geoJsonFeatures,
        },
      });

      // Add heatmap layer
      map.current.addLayer({
        id: 'heatmap-layer',
        type: 'heatmap',
        source: 'language-heatmap',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'intensity'],
            0, 0,
            100, 1
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            9, 3
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 20,
            9, 40
          ],
        },
      });

      // Add country points for detailed view
      map.current.addLayer({
        id: 'country-points',
        type: 'circle',
        source: 'language-heatmap',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'intensity'],
            0, 4,
            100, 20
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'intensity'],
            0, '#FEF3C7',
            25, '#FBBF24',
            50, '#F59E0B',
            75, '#DC2626',
            100, '#7C2D12'
          ],
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
        },
      });

      // Add hover effects
      map.current.on('mouseenter', 'country-points', (e) => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = 'pointer';
        
        if (e.features && e.features[0]) {
          const feature = e.features[0];
          const { name, speakerPercentage, population, isOfficial, languages: countryLanguages } = feature.properties;
          
          setHoveredCountry(name);

          // Create popup
          if (!popup.current) {
            popup.current = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 15,
            });
          }

          const languageNames = countryLanguages.map((langId: string) => {
            const lang = languages.find(l => l.id === langId);
            return lang?.name || langId;
          }).join(', ');

          popup.current
            .setLngLat((feature.geometry as any).coordinates)
            .setHTML(`
              <div class="p-3 min-w-48">
                <h3 class="font-semibold text-lg mb-2">${name}</h3>
                <div class="space-y-1 text-sm">
                  <div><strong>${t('countries:speakers')}:</strong> ${speakerPercentage}%</div>
                  <div><strong>${t('countries:population')}:</strong> ${(population / 1000000).toFixed(1)}M</div>
                  <div><strong>Languages:</strong> ${languageNames}</div>
                  ${isOfficial ? `<div class="text-green-600 font-medium">${t('countries:official')}</div>` : ''}
                </div>
              </div>
            `)
            .addTo(map.current);
        }
      });

      map.current.on('mouseleave', 'country-points', () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = '';
        setHoveredCountry(null);
        if (popup.current) {
          popup.current.remove();
        }
      });
    });

    // If map is already loaded, trigger the load event
    if (map.current.isStyleLoaded()) {
      map.current.fire('load');
    }
  }, [languages, selectedLanguages, t]);

  const toggleMapStyle = () => {
    setMapStyle(prev => prev === 'globe' ? 'flat' : 'globe');
  };

  const resetRotation = () => {
    setIsRotating(true);
    if (map.current) {
      map.current.easeTo({
        center: DEFAULT_MAP_CONFIG.center,
        zoom: DEFAULT_MAP_CONFIG.zoom,
        bearing: DEFAULT_MAP_CONFIG.bearing,
        pitch: mapStyle === 'globe' ? DEFAULT_MAP_CONFIG.pitch : 0,
        duration: 1000,
      });
    }
  };

  if (!isMapboxConfigured) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Globe className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Mapbox Configuration Required</h3>
            <p className="text-muted-foreground mb-4">
              To display the interactive heatmap, please configure your Mapbox access token.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg text-sm text-left">
              <p className="font-medium mb-2">Setup Instructions:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Get your free Mapbox token from <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a></li>
                <li>Copy <code className="bg-background px-1 rounded">src/config/mapbox.example.ts</code> to <code className="bg-background px-1 rounded">src/config/mapbox.ts</code></li>
                <li>Replace the placeholder token with your actual Mapbox token</li>
                <li>Refresh the page to see the interactive heatmap</li>
              </ol>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="aspect-video flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading map data...</p>
        </div>
      </Card>
    );
  }

  if (!selectedLanguages.length) {
    return (
      <Card className="aspect-video flex items-center justify-center">
        <div className="text-center space-y-4">
          <Globe className="w-16 h-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Select Languages</h3>
            <p className="text-muted-foreground">
              Choose languages to see their global distribution on the interactive heatmap.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {mapStyle === 'globe' ? '3D Globe' : '2D Map'} View
          </Badge>
          {hoveredCountry && (
            <Badge variant="secondary" className="text-sm">
              {hoveredCountry}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMapStyle}
            className="gap-2"
          >
            {mapStyle === 'globe' ? <Map className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
            {mapStyle === 'globe' ? '2D Map' : '3D Globe'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetRotation}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <Card className="overflow-hidden">
        <div 
          ref={mapContainer} 
          className="w-full aspect-video min-h-[400px] rounded-lg"
        />
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Language Speaker Density</h4>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-yellow-100 to-yellow-300"></div>
            <span>Low (0-25%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-yellow-400 to-orange-400"></div>
            <span>Medium (25-50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-orange-500 to-red-500"></div>
            <span>High (50-75%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-red-600 to-red-900"></div>
            <span>Very High (75%+)</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MapboxHeatmap;