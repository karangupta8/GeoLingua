import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LanguageData } from '@/data/languages';
import { languageService } from '@/services/languageService';

interface Globe3DProps {
  selectedLanguages: string[];
}

interface CountryData {
  code: string;
  name: string;
  lat: number;
  lng: number;
  speakerPercentage: number;
  isOfficial: boolean;
  languages: string[];
  color: string;
}

// Country coordinates (lat, lng) for proper geographic positioning
const countryCoordinates: Record<string, [number, number]> = {
  US: [39.8283, -98.5795],
  GB: [55.3781, -3.4360],
  CA: [56.1304, -106.3468],
  AU: [-25.2744, 133.7751],
  IN: [20.5937, 78.9629],
  NG: [9.0820, 8.6753],
  ZA: [-30.5595, 22.9375],
  MX: [23.6345, -102.5528],
  ES: [40.4637, -3.7492],
  AR: [-38.4161, -63.6167],
  CO: [4.5709, -74.2973],
  PE: [-9.1900, -75.0152],
  VE: [6.4238, -66.5897],
  CN: [35.8617, 104.1954],
  TW: [23.6978, 120.9605],
  SG: [1.3521, 103.8198],
  MY: [4.2105, 101.9758],
  FR: [46.6034, 2.2137],
  CD: [-4.0383, 21.7587],
  BE: [50.5039, 4.4699],
  CH: [46.8182, 8.2275],
  SN: [14.4974, -14.4524],
  BR: [-14.2350, -51.9253],
  PT: [39.3999, -8.2245],
  AO: [-11.2027, 17.8739],
  MZ: [-18.6657, 35.5296],
  EG: [26.0975, 30.0444],
  SA: [23.8859, 45.0792],
  DZ: [28.0339, 1.6596],
  SD: [12.8628, 30.2176],
  IQ: [33.2232, 43.6793],
  MA: [31.7917, -7.0926],
};

// Convert lat/lng to 3D sphere coordinates
const latLngToVector3 = (lat: number, lng: number, radius: number = 2): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
};

// Generate heatmap color based on coverage intensity
const getHeatmapColor = (intensity: number, hasLanguage: boolean): string => {
  if (!hasLanguage) return 'hsl(220, 20%, 30%)'; // Dark blue-gray for unselected
  
  // Blue to cyan gradient for coverage intensity
  const hue = 200 + intensity * 60; // 200 (blue) to 260 (cyan)
  const saturation = 70 + intensity * 20; // 70% to 90%
  const lightness = 40 + intensity * 30; // 40% to 70%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

function CountryMarker({ country, isHovered, onHover, onLeave }: {
  country: CountryData;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const position = latLngToVector3(country.lat, country.lng, 2.05);
  const markerRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (markerRef.current && isHovered) {
      markerRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.008) * 0.1);
    } else if (markerRef.current) {
      markerRef.current.scale.setScalar(1);
    }
  });

  const intensity = country.speakerPercentage / 100;
  const size = 0.03 + intensity * 0.07;

  return (
    <group>
      <mesh
        ref={markerRef}
        position={position}
        onPointerOver={onHover}
        onPointerOut={onLeave}
      >
        <sphereGeometry args={[size, 8, 8]} />
        <meshStandardMaterial 
          color={country.color}
          emissive={isHovered ? country.color : '#000000'}
          emissiveIntensity={isHovered ? 0.4 : 0}
        />
      </mesh>
      
      {isHovered && (
        <Text
          position={[position.x + 0.2, position.y + 0.2, position.z]}
          fontSize={0.12}
          color="white"
          anchorX="left"
          anchorY="middle"
        >
          {country.name}
        </Text>
      )}
    </group>
  );
}

function GlobeGeometry({ countryData, hoveredCountry, setHoveredCountry }: {
  countryData: CountryData[];
  hoveredCountry: string | null;
  setHoveredCountry: (country: string | null) => void;
}) {
  const globeRef = useRef<THREE.Mesh>(null);
  const { scene } = useThree();

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.003;
    }
  });

  // Create heatmap texture
  const heatmapTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d')!;
    
    // Base ocean color
    context.fillStyle = 'hsl(220, 20%, 25%)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw country heatmap regions
    countryData.forEach(country => {
      if (country.languages.length > 0) {
        const x = ((country.lng + 180) / 360) * canvas.width;
        const y = ((90 - country.lat) / 180) * canvas.height;
        
        const intensity = country.speakerPercentage / 100;
        const radius = 40 + intensity * 60;
        
        // Create gradient for smooth blending
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, country.color);
        gradient.addColorStop(0.7, country.color + '80'); // Semi-transparent
        gradient.addColorStop(1, 'transparent');
        
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [countryData]);

  return (
    <group>
      {/* Globe with heatmap texture */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 128, 64]} />
        <meshStandardMaterial 
          map={heatmapTexture}
          transparent={false}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Country boundary wireframe overlay */}
      <mesh>
        <sphereGeometry args={[2.002, 64, 32]} />
        <meshBasicMaterial 
          color="hsl(220, 30%, 60%)"
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>

      {/* Interactive country markers */}
      {countryData
        .filter(country => country.languages.length > 0)
        .map((country) => (
          <CountryMarker
            key={country.code}
            country={country}
            isHovered={hoveredCountry === country.code}
            onHover={() => setHoveredCountry(country.code)}
            onLeave={() => setHoveredCountry(null)}
          />
        ))}
    </group>
  );
}

const Globe3D: React.FC<Globe3DProps> = ({ selectedLanguages }) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [languages, setLanguages] = useState<LanguageData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const languageData = await languageService.fetchLanguages();
        setLanguages(languageData);

        // Create country data with geographic coordinates
        const countryMap = new Map<string, CountryData>();

        languageData.forEach(language => {
          const isSelected = selectedLanguages.includes(language.id);
          
          language.countries.forEach(country => {
            const coordinates = countryCoordinates[country.code];
            if (!coordinates) return;

            if (!countryMap.has(country.code)) {
              countryMap.set(country.code, {
                code: country.code,
                name: country.name,
                lat: coordinates[0],
                lng: coordinates[1],
                speakerPercentage: 0,
                isOfficial: false,
                languages: [],
                color: getHeatmapColor(0, false)
              });
            }

            const countryData = countryMap.get(country.code)!;
            if (isSelected) {
              countryData.languages.push(language.name);
              countryData.speakerPercentage = Math.max(countryData.speakerPercentage, country.speakerPercentage);
              countryData.isOfficial = countryData.isOfficial || country.isOfficial;
              
              // Update color based on coverage
              const intensity = countryData.speakerPercentage / 100;
              countryData.color = getHeatmapColor(intensity, true);
            }
          });
        });

        setCountryData(Array.from(countryMap.values()));
      } catch (error) {
        console.error('Error loading globe data:', error);
      }
    };

    loadData();
  }, [selectedLanguages]);

  const hoveredCountryData = useMemo(() => {
    return hoveredCountry ? countryData.find(c => c.code === hoveredCountry) : null;
  }, [hoveredCountry, countryData]);

  if (selectedLanguages.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
            <div className="w-8 h-8 bg-primary-foreground rounded-full" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Interactive 3D Globe</h3>
            <p className="text-muted-foreground">
              Select languages to see their global distribution on an interactive 3D globe
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="h-96 relative">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <pointLight position={[-5, 5, 5]} intensity={0.6} color="#87CEEB" />
            
            <GlobeGeometry 
              countryData={countryData}
              hoveredCountry={hoveredCountry}
              setHoveredCountry={setHoveredCountry}
            />
            
            <OrbitControls 
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={2.5}
              maxDistance={6}
              rotateSpeed={0.5}
              zoomSpeed={0.8}
            />
          </Canvas>

          {/* Hover tooltip */}
          {hoveredCountryData && (
            <div className="absolute top-4 left-4 z-10">
              <Card className="p-3 max-w-xs">
                <div className="space-y-2">
                  <h4 className="font-semibold">{hoveredCountryData.name}</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Speaker Percentage: {hoveredCountryData.speakerPercentage}%
                    </p>
                    {hoveredCountryData.isOfficial && (
                      <Badge variant="secondary" className="text-xs">Official Language</Badge>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {hoveredCountryData.languages.map((lang, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Globe Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'hsl(220, 20%, 30%)' }} />
            <span className="text-sm">Unselected regions</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'hsl(220, 75%, 50%)' }} />
            <span className="text-sm">Low coverage (0-50%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'hsl(240, 85%, 60%)' }} />
            <span className="text-sm">Medium coverage (50-75%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'hsl(260, 90%, 70%)' }} />
            <span className="text-sm">High coverage (75-100%)</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Surface coloring shows language coverage intensity. Hover over markers for details.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Globe3D;