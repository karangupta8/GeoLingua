import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LanguageData } from '@/data/languages';
import { languageService } from '@/services/languageService';

interface Globe3DProps {
  selectedLanguages: string[];
}

interface CountryData {
  code: string;
  name: string;
  position: [number, number, number];
  speakerPercentage: number;
  isOfficial: boolean;
  languages: string[];
}

// Country positions (simplified for demo - in real app, you'd use a GeoJSON file)
const countryPositions: Record<string, [number, number, number]> = {
  US: [1.5, 0.8, 0.5],
  GB: [0.2, 1.2, 0.8],
  CA: [1.2, 1.5, 0.3],
  AU: [-1.2, -1.0, 0.8],
  IN: [-0.5, 0.3, 1.8],
  NG: [-0.3, 0.1, 1.7],
  ZA: [-0.5, -1.2, 1.5],
  MX: [1.8, 0.2, 0.8],
  ES: [0.1, 0.8, 1.8],
  AR: [1.0, -1.8, 0.5],
  CO: [1.5, 0.2, 1.2],
  PE: [1.8, -0.5, 1.0],
  VE: [1.2, 0.5, 1.5],
  CN: [-1.8, 0.5, 0.8],
  TW: [-1.5, 0.2, 1.5],
  SG: [-1.0, -0.2, 1.8],
  MY: [-1.2, 0.0, 1.5],
  FR: [0.0, 1.0, 1.8],
  CD: [-0.2, -0.3, 1.7],
  BE: [0.1, 1.1, 1.7],
  CH: [0.0, 0.9, 1.8],
  SN: [0.5, 0.5, 1.7],
  BR: [1.5, -1.0, 1.2],
  PT: [0.3, 0.8, 1.7],
  AO: [-0.2, -0.8, 1.6],
  MZ: [-0.8, -1.0, 1.4],
  EG: [-0.3, 0.8, 1.7],
  SA: [-0.8, 0.3, 1.6],
  DZ: [0.0, 0.9, 1.8],
  SD: [-0.5, 0.2, 1.7],
  IQ: [-0.8, 0.5, 1.6],
  MA: [0.3, 0.7, 1.8],
};

function GlobeGeometry({ countryData, hoveredCountry, setHoveredCountry }: {
  countryData: CountryData[];
  hoveredCountry: string | null;
  setHoveredCountry: (country: string | null) => void;
}) {
  const globeRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.005;
    }
  });

  const getCountryColor = (country: CountryData) => {
    if (country.languages.length === 0) return '#334155';
    const intensity = country.speakerPercentage / 100;
    return `hsl(${210 + intensity * 60}, ${70 + intensity * 30}%, ${50 + intensity * 30}%)`;
  };

  return (
    <group>
      {/* Globe sphere */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
          color="hsl(var(--muted))" 
          transparent 
          opacity={0.8}
          wireframe={false}
        />
      </mesh>

      {/* Country markers */}
      {countryData.map((country) => (
        <mesh
          key={country.code}
          position={country.position}
          onClick={() => setHoveredCountry(country.code)}
          onPointerOver={() => setHoveredCountry(country.code)}
          onPointerOut={() => setHoveredCountry(null)}
        >
          <sphereGeometry args={[0.05 + (country.speakerPercentage / 100) * 0.1, 16, 16]} />
          <meshStandardMaterial 
            color={getCountryColor(country)}
            emissive={hoveredCountry === country.code ? '#ffffff' : '#000000'}
            emissiveIntensity={hoveredCountry === country.code ? 0.3 : 0}
          />
        </mesh>
      ))}

      {/* Country labels for hovered country */}
      {hoveredCountry && countryData.find(c => c.code === hoveredCountry) && (
        <Text
          position={[
            countryPositions[hoveredCountry][0] + 0.3,
            countryPositions[hoveredCountry][1] + 0.3,
            countryPositions[hoveredCountry][2]
          ]}
          fontSize={0.15}
          color="hsl(var(--foreground))"
          anchorX="left"
          anchorY="middle"
        >
          {countryData.find(c => c.code === hoveredCountry)?.name}
        </Text>
      )}
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

        // Create country data
        const countries: CountryData[] = [];
        const countryMap = new Map<string, CountryData>();

        languageData.forEach(language => {
          const isSelected = selectedLanguages.includes(language.id);
          
          language.countries.forEach(country => {
            const position = countryPositions[country.code];
            if (!position) return;

            if (!countryMap.has(country.code)) {
              countryMap.set(country.code, {
                code: country.code,
                name: country.name,
                position,
                speakerPercentage: 0,
                isOfficial: false,
                languages: []
              });
            }

            const countryData = countryMap.get(country.code)!;
            if (isSelected) {
              countryData.languages.push(language.name);
              countryData.speakerPercentage = Math.max(countryData.speakerPercentage, country.speakerPercentage);
              countryData.isOfficial = countryData.isOfficial || country.isOfficial;
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
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            <GlobeGeometry 
              countryData={countryData}
              hoveredCountry={hoveredCountry}
              setHoveredCountry={setHoveredCountry}
            />
            
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={8}
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
            <div className="w-4 h-4 rounded-full bg-slate-500" />
            <span className="text-sm">No selected languages</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-blue-400" />
            <span className="text-sm">Low speaker percentage (0-50%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-blue-600" />
            <span className="text-sm">High speaker percentage (50-100%)</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Marker size indicates speaker percentage. Click and drag to rotate, scroll to zoom.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Globe3D;