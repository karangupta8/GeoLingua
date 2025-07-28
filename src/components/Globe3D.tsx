import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LanguageData } from '@/data/languages';
import { languageService } from '@/services/languageService';
import { extend } from '@react-three/fiber';

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

// Generate realistic Earth colors for countries
const getCountryColor = (intensity: number, hasLanguage: boolean): THREE.Color => {
  if (!hasLanguage) {
    return new THREE.Color(0x2d5a27); // Forest green for land without selected languages
  }
  
  // Gradient from green to bright yellow-orange for language coverage
  const hue = (1 - intensity) * 0.33; // Green (0.33) to Red (0)
  const saturation = 0.7 + intensity * 0.3;
  const lightness = 0.4 + intensity * 0.4;
  
  return new THREE.Color().setHSL(hue, saturation, lightness);
};

// Create realistic Earth textures
const createEarthTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const context = canvas.getContext('2d')!;
  
  // Create Earth-like base texture
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#87CEEB'); // Sky blue at poles
  gradient.addColorStop(0.3, '#4682B4'); // Steel blue
  gradient.addColorStop(0.7, '#228B22'); // Forest green
  gradient.addColorStop(1, '#87CEEB'); // Sky blue at bottom pole
  
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add continents (simplified landmasses)
  context.fillStyle = '#2F4F2F'; // Dark green for land
  
  // North America
  context.fillRect(200, 200, 400, 300);
  context.fillRect(150, 350, 300, 200);
  
  // South America  
  context.fillRect(400, 600, 200, 400);
  
  // Europe/Asia
  context.fillRect(800, 150, 800, 400);
  context.fillRect(900, 250, 600, 300);
  
  // Africa
  context.fillRect(900, 450, 300, 500);
  
  // Australia
  context.fillRect(1300, 700, 200, 150);
  
  return new THREE.CanvasTexture(canvas);
};

// Create bump texture for terrain relief
const createBumpTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d')!;
  
  // Create noise pattern for terrain
  const imageData = context.createImageData(canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 255;
    data[i] = noise;     // Red
    data[i + 1] = noise; // Green  
    data[i + 2] = noise; // Blue
    data[i + 3] = 255;   // Alpha
  }
  
  context.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
};

function RealisticGlobe({ countryData, hoveredCountry, setHoveredCountry }: {
  countryData: CountryData[];
  hoveredCountry: string | null;
  setHoveredCountry: (country: string | null) => void;
}) {
  const globeRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const { camera } = useThree();

  // Pause auto-rotation when user interacts
  const handleInteractionStart = () => setAutoRotate(false);
  const handleInteractionEnd = () => {
    setTimeout(() => setAutoRotate(true), 2000);
  };

  useFrame((state) => {
    if (globeRef.current && autoRotate) {
      globeRef.current.rotation.y += 0.002;
    }
    
    // Atmosphere glow effect
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.001;
    }
  });

  // Create realistic Earth texture with country overlays
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d')!;
    
    // Base Earth texture - oceans
    const oceanGradient = context.createLinearGradient(0, 0, 0, canvas.height);
    oceanGradient.addColorStop(0, '#1e3a5f'); // Deep ocean blue at top
    oceanGradient.addColorStop(0.5, '#2563eb'); // Bright ocean blue
    oceanGradient.addColorStop(1, '#1e3a5f'); // Deep ocean blue at bottom
    
    context.fillStyle = oceanGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw continents with realistic shapes (simplified)
    context.fillStyle = '#22c55e'; // Green landmass base
    
    // North America (rough shape)
    context.beginPath();
    context.ellipse(300, 350, 180, 120, 0, 0, Math.PI * 2);
    context.fill();
    
    // South America
    context.beginPath();
    context.ellipse(450, 650, 80, 200, 0, 0, Math.PI * 2);
    context.fill();
    
    // Europe/Asia landmass
    context.beginPath();
    context.ellipse(1100, 300, 300, 150, 0, 0, Math.PI * 2);
    context.fill();
    
    // Africa
    context.beginPath();
    context.ellipse(1000, 550, 120, 180, 0, 0, Math.PI * 2);
    context.fill();
    
    // Australia
    context.beginPath();
    context.ellipse(1400, 750, 80, 50, 0, 0, Math.PI * 2);
    context.fill();
    
    // Overlay country language coverage
    countryData.forEach(country => {
      if (country.languages.length > 0) {
        const x = ((country.lng + 180) / 360) * canvas.width;
        const y = ((90 - country.lat) / 180) * canvas.height;
        
        const intensity = country.speakerPercentage / 100;
        const radius = 25 + intensity * 35;
        
        // Create glowing effect for language coverage
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        
        const color = getCountryColor(intensity, true);
        const rgbColor = `rgb(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)})`;
        const rgbaColor = `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 0.5)`;
        
        gradient.addColorStop(0, rgbColor);
        gradient.addColorStop(0.7, rgbaColor); // Semi-transparent using RGBA
        gradient.addColorStop(1, 'transparent');
        
        context.globalCompositeOperation = 'overlay';
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        context.globalCompositeOperation = 'source-over';
      }
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [countryData]);

  const bumpTexture = useMemo(() => createBumpTexture(), []);

  // Country markers as subtle surface indicators
  const countryMarkers = countryData
    .filter(country => country.languages.length > 0)
    .map((country) => {
      const position = latLngToVector3(country.lat, country.lng, 2.01);
      const isHovered = hoveredCountry === country.code;
      const intensity = country.speakerPercentage / 100;
      
      return (
        <group key={country.code}>
          <mesh
            position={position}
            onPointerOver={() => setHoveredCountry(country.code)}
            onPointerOut={() => setHoveredCountry(null)}
          >
            <sphereGeometry args={[0.02 + intensity * 0.03, 8, 8]} />
            <meshStandardMaterial 
              color={getCountryColor(intensity, true)}
              emissive={getCountryColor(intensity, true)}
              emissiveIntensity={isHovered ? 0.6 : 0.2}
              transparent
              opacity={isHovered ? 1.0 : 0.8}
            />
          </mesh>
          
          {/* Pulsing ring effect for hovered countries */}
          {isHovered && (
            <mesh position={position}>
              <ringGeometry args={[0.08, 0.12, 16]} />
              <meshBasicMaterial 
                color={getCountryColor(intensity, true)}
                transparent
                opacity={0.5}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
        </group>
      );
    });

  return (
    <group>
      {/* Main Earth sphere */}
      <mesh 
        ref={globeRef}
        onPointerDown={handleInteractionStart}
        onPointerUp={handleInteractionEnd}
      >
        <sphereGeometry args={[2, 128, 64]} />
        <meshStandardMaterial 
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={0.05}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Atmospheric glow - simplified using standard material */}
      <mesh ref={atmosphereRef} scale={[1.05, 1.05, 1.05]}>
        <sphereGeometry args={[2, 64, 32]} />
        <meshBasicMaterial 
          color={0x4dd0e7}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Country markers */}
      {countryMarkers}
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
                color: `rgb(${Math.floor(getCountryColor(0, false).r * 255)}, ${Math.floor(getCountryColor(0, false).g * 255)}, ${Math.floor(getCountryColor(0, false).b * 255)})`
              });
            }

            const countryData = countryMap.get(country.code)!;
            if (isSelected) {
              countryData.languages.push(language.name);
              countryData.speakerPercentage = Math.max(countryData.speakerPercentage, country.speakerPercentage);
              countryData.isOfficial = countryData.isOfficial || country.isOfficial;
              
              // Update color based on coverage
              const intensity = countryData.speakerPercentage / 100;
              countryData.color = `rgb(${Math.floor(getCountryColor(intensity, true).r * 255)}, ${Math.floor(getCountryColor(intensity, true).g * 255)}, ${Math.floor(getCountryColor(intensity, true).b * 255)})`;
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
          <Canvas 
            camera={{ position: [0, 0, 5], fov: 75 }}
            shadows
          >
            {/* Enhanced lighting setup */}
            <ambientLight intensity={0.2} color="#ffffff" />
            <directionalLight 
              position={[5, 3, 5]} 
              intensity={1.2} 
              color="#ffffff"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight 
              position={[-3, 2, 4]} 
              intensity={0.8} 
              color="#4dd0e7"
              distance={10}
            />
            <hemisphereLight 
              args={["#87CEEB", "#2F4F4F", 0.3]}
            />
            
            <RealisticGlobe 
              countryData={countryData}
              hoveredCountry={hoveredCountry}
              setHoveredCountry={setHoveredCountry}
            />
            
            <OrbitControls 
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              enableDamping={true}
              dampingFactor={0.05}
              minDistance={2.8}
              maxDistance={8}
              rotateSpeed={0.3}
              zoomSpeed={0.6}
              autoRotate={false}
              autoRotateSpeed={0.5}
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
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getCountryColor(0, false).getStyle() }} />
            <span className="text-sm">Land without selected languages</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getCountryColor(0.25, true).getStyle() }} />
            <span className="text-sm">Low coverage (0-25%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getCountryColor(0.5, true).getStyle() }} />
            <span className="text-sm">Medium coverage (25-75%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getCountryColor(1.0, true).getStyle() }} />
            <span className="text-sm">High coverage (75-100%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300" />
            <span className="text-sm">Atmospheric glow effect</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Realistic Earth surface with language coverage overlays. Click and drag to rotate, scroll to zoom.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Globe3D;