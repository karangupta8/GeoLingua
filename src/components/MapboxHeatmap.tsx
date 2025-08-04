import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Map, Maximize2, RotateCcw } from 'lucide-react';
import { MAPBOX_ACCESS_TOKEN, DEFAULT_MAP_CONFIG, MAPBOX_STYLES } from '@/config/mapbox';
import { useLanguages } from '@/hooks/useLanguages';
import { processLanguageDataForHeatmap, generateCountryPolygonFeatures } from '@/utils/geoDataProcessor';
import { useTranslation } from 'react-i18next';
import countryBorders from '@/data/country-borders.json';

interface MapboxHeatmapProps {
  selectedLanguages: string[];
}

const MapboxHeatmap = React.forwardRef<HTMLDivElement, MapboxHeatmapProps>(({ selectedLanguages }, ref) => {
  const { t } = useTranslation(['dashboard', 'countries']);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const { languages, isLoading } = useLanguages();
  
  const [mapStyle, setMapStyle] = useState<'globe' | 'flat'>('globe');
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapDataLoaded, setMapDataLoaded] = useState(false);

  // Check if Mapbox token is configured
  const isMapboxConfigured = MAPBOX_ACCESS_TOKEN && MAPBOX_ACCESS_TOKEN.length > 0;

  // Memoized function to update map data
  const updateMapData = useCallback(() => {
    if (!map.current || !languages.length || !mapLoaded) {
      console.log('Map data update skipped:', { 
        mapExists: !!map.current, 
        languagesCount: languages.length, 
        mapLoaded 
      });
      return;
    }

    // If no languages are selected, clear the map data
    if (!selectedLanguages.length) {
      console.log('Clearing map data - no languages selected');
      if (map.current && map.current.getSource('country-heatmap')) {
        try {
          map.current.removeLayer('country-fill-layer');
          map.current.removeLayer('country-border-layer');
          map.current.removeSource('country-heatmap');
        } catch (error) {
          console.warn('Error clearing map data:', error);
        }
      }
      setMapDataLoaded(false);
      return;
    }

    console.log('Updating map data for languages:', selectedLanguages);

    try {
      const heatmapData = processLanguageDataForHeatmap(languages, selectedLanguages);
      const countryPolygonFeatures = generateCountryPolygonFeatures(heatmapData.countries, countryBorders);

      console.log('Generated country polygon features:', countryPolygonFeatures.length);

      // Don't proceed if no data
      if (countryPolygonFeatures.length === 0) {
        console.warn('No country polygon features generated for selected languages');
        setMapDataLoaded(false);
        return;
      }

      // Remove existing sources and layers
      if (map.current.getSource('country-heatmap')) {
        try {
          map.current.removeLayer('country-fill-layer');
          map.current.removeLayer('country-border-layer');
          map.current.removeSource('country-heatmap');
        } catch (error) {
          console.warn('Error removing existing layers:', error);
        }
      }

      // Add new data source
      map.current.addSource('country-heatmap', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: countryPolygonFeatures,
        },
      });

      // Add country fill layer (the heatmap)
      map.current.addLayer({
        id: 'country-fill-layer',
        type: 'fill',
        source: 'country-heatmap',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'intensity'],
            0, '#FEF3C7',    // Very light yellow
            25, '#FBBF24',   // Yellow
            50, '#F59E0B',   // Orange
            75, '#DC2626',   // Red
            100, '#7C2D12'   // Dark red
          ],
          'fill-opacity': [
            'interpolate',
            ['linear'],
            ['get', 'intensity'],
            0, 0.3,
            25, 0.5,
            50, 0.7,
            75, 0.8,
            100, 0.9
          ],
        },
      });

      // Add country border layer
      map.current.addLayer({
        id: 'country-border-layer',
        type: 'line',
        source: 'country-heatmap',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 1,
          'line-opacity': 0.6,
        },
      });

      console.log('Map data updated successfully');
      setMapDataLoaded(true);
    } catch (error) {
      console.error('Error updating map data:', error);
      setMapDataLoaded(false);
    }
  }, [languages, selectedLanguages, mapLoaded]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !isMapboxConfigured) return;

    console.log('Initializing map...');
    setMapLoaded(false);
    setMapDataLoaded(false);

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

    // Handle map load event
    const handleMapLoad = () => {
      console.log('Map loaded successfully');
      setMapLoaded(true);
      
      // Ensure proper centering on initial load
      if (map.current) {
        const center = mapStyle === 'globe' ? [20, 20] : [0, 0];
        map.current.easeTo({
          center: center as [number, number],
          zoom: DEFAULT_MAP_CONFIG.zoom,
          bearing: DEFAULT_MAP_CONFIG.bearing,
          pitch: mapStyle === 'globe' ? DEFAULT_MAP_CONFIG.pitch : 0,
          duration: 500,
        });
      }
    };

    map.current.on('load', handleMapLoad);

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
      setMapLoaded(false);
      setMapDataLoaded(false);
    };
  }, [mapStyle, isRotating, isMapboxConfigured]);

  // Update map data when dependencies change
  useEffect(() => {
    // Use a small delay to ensure proper sequencing
    const timer = setTimeout(() => {
      updateMapData();
    }, 100);

    return () => clearTimeout(timer);
  }, [updateMapData]);

  // Separate useEffect for hover effects
  useEffect(() => {
    if (!map.current || !languages.length || !mapDataLoaded) return;

    const addHoverEffects = () => {
      if (!map.current) return;

      // Remove existing event listeners to prevent duplicates
      map.current.off('mouseenter', 'country-fill-layer', undefined);
      map.current.off('mouseleave', 'country-fill-layer', undefined);

      map.current.on('mouseenter', 'country-fill-layer', (e) => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = 'pointer';
        
        if (e.features && e.features[0]) {
          const feature = e.features[0];
          const { name, speakerPercentage, population, isOfficial, languages: countryLanguages } = feature.properties;
          
          setHoveredCountry(name);

          // Remove any existing popup first
          if (popup.current) {
            popup.current.remove();
            popup.current = null;
          }

          // Create new popup
          popup.current = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 15,
            className: 'country-popup',
          });

          // Fix: Ensure countryLanguages is an array before calling map
          const languageNames = Array.isArray(countryLanguages) 
            ? countryLanguages.map((langId: string) => {
                const lang = languages.find(l => l.id === langId);
                return lang?.name || langId;
              }).join(', ')
            : 'Unknown';

          // Get the center of the polygon for popup positioning
          const center = getPolygonCenter(feature.geometry);
          
          // Validate coordinates before setting popup position
          if (center && Array.isArray(center) && center.length === 2 && 
              typeof center[0] === 'number' && typeof center[1] === 'number' &&
              !isNaN(center[0]) && !isNaN(center[1])) {
            
            popup.current
              .setLngLat(center)
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
          } else {
            console.warn('Invalid coordinates for popup:', center, 'for country:', name);
          }
        }
      });

      map.current.on('mouseleave', 'country-fill-layer', () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = '';
        setHoveredCountry(null);
        if (popup.current) {
          popup.current.remove();
          popup.current = null;
        }
      });
    };

    // Add hover effects when map and data are ready
    if (map.current.isStyleLoaded() && mapDataLoaded) {
      addHoverEffects();
    } else {
      const handleStyleLoad = () => {
        if (mapDataLoaded) {
          addHoverEffects();
        }
      };
      map.current.once('load', handleStyleLoad);
    }

    // Cleanup function to remove event listeners and popup
    return () => {
      if (map.current) {
        map.current.off('mouseenter', 'country-fill-layer', undefined);
        map.current.off('mouseleave', 'country-fill-layer', undefined);
      }
      if (popup.current) {
        popup.current.remove();
        popup.current = null;
      }
    };
  }, [languages, t, mapDataLoaded]);

  // Helper function to get the center of a polygon
  function getPolygonCenter(geometry: any): [number, number] {
    if (geometry.type === 'Point') {
      return geometry.coordinates;
    }
    
    if (geometry.type === 'Polygon') {
      const coordinates = geometry.coordinates[0];
      if (!coordinates || coordinates.length === 0) {
        console.warn('Empty polygon coordinates');
        return [0, 0];
      }
      
      const center = coordinates.reduce(
        (acc: [number, number], coord: [number, number]) => [
          acc[0] + coord[0],
          acc[1] + coord[1]
        ],
        [0, 0]
      );
      return [center[0] / coordinates.length, center[1] / coordinates.length];
    }
    
    if (geometry.type === 'MultiPolygon') {
      // For MultiPolygon, use the first polygon
      if (geometry.coordinates && geometry.coordinates[0] && geometry.coordinates[0][0]) {
        return getPolygonCenter({ 
          type: 'Polygon', 
          coordinates: geometry.coordinates[0] 
        });
      }
      console.warn('Invalid MultiPolygon coordinates');
      return [0, 0];
    }
    
    console.warn('Unknown geometry type:', geometry.type);
    return [0, 0]; // fallback
  }

  const toggleMapStyle = () => {
    const newStyle = mapStyle === 'globe' ? 'flat' : 'globe';
    setMapStyle(newStyle);
    
    if (map.current) {
      // Use setProjection instead of recreating the map
      map.current.setProjection(newStyle === 'globe' ? 'globe' : 'mercator');
      
      // Update pitch and fog for the new projection
      if (newStyle === 'globe') {
        map.current.setPitch(DEFAULT_MAP_CONFIG.pitch);
        map.current.setFog({
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
        });
      } else {
        map.current.setPitch(0);
        map.current.setFog(null);
      }
      
      // Better centering for globe mode
      map.current.easeTo({
        center: newStyle === 'globe' ? [20, 20] : [0, 0],
        zoom: DEFAULT_MAP_CONFIG.zoom,
        bearing: DEFAULT_MAP_CONFIG.bearing,
        duration: 1000,
      });
    }
  };

  const resetRotation = () => {
    setIsRotating(true);
    if (map.current) {
      const center = mapStyle === 'globe' ? [20, 20] : [0, 0];
      map.current.easeTo({
        center: center as [number, number],
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

  return (
    <div ref={ref} id="mapbox-heatmap" className="space-y-4">
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
          {!selectedLanguages.length && (
            <Badge variant="secondary" className="text-sm">
              No Languages Selected
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
          className="w-full h-[600px] rounded-lg"
        />
      </Card>

      {/* Legend */}
      <Card className="p-4">
        {selectedLanguages.length > 0 ? (
          <>
            <h4 className="font-medium mb-3">Language Speaker Density</h4>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-100"></div>
                <span>Low (0-25%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-400"></div>
                <span>Medium (25-50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-500"></div>
                <span>High (50-75%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-600"></div>
                <span>Very High (75%+)</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <h4 className="font-medium mb-3">Interactive Globe</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Select languages from the sidebar to see their global distribution</p>
              <p>• Use the controls above to switch between 3D Globe and 2D Map views</p>
              <p>• Click and drag to explore different regions</p>
              <p>• Use the mouse wheel to zoom in and out</p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
});

MapboxHeatmap.displayName = 'MapboxHeatmap';

export default React.memo(MapboxHeatmap);