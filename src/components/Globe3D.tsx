import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LanguageData } from '@/data/languages';
import { languageService } from '@/services/languageService';
import { extend } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import countryBorders from '@/data/country-borders.json';

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
  JP: [36.2048, 138.2529],
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

// Create day/night Earth texture with realistic geography
const createDayNightTexture = (time: number = 0) => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const context = canvas.getContext('2d')!;
  
  // Create ocean gradient (deep blue)
  const oceanGradient = context.createLinearGradient(0, 0, 0, canvas.height);
  oceanGradient.addColorStop(0, '#0f172a'); // Dark blue at poles
  oceanGradient.addColorStop(0.5, '#1e40af'); // Ocean blue
  oceanGradient.addColorStop(1, '#0f172a'); // Dark blue at bottom
  
  context.fillStyle = oceanGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add realistic continent shapes with proper colors
  const drawContinents = () => {
    context.fillStyle = '#15803d'; // Forest green for land
    
    // North America
    context.beginPath();
    context.moveTo(200, 250);
    context.quadraticCurveTo(350, 200, 500, 280);
    context.quadraticCurveTo(450, 400, 300, 450);
    context.quadraticCurveTo(150, 420, 200, 250);
    context.fill();
    
    // Greenland
    context.beginPath();
    context.ellipse(600, 150, 40, 60, 0, 0, Math.PI * 2);
    context.fill();
    
    // South America
    context.beginPath();
    context.moveTo(420, 500);
    context.quadraticCurveTo(480, 520, 460, 650);
    context.quadraticCurveTo(440, 800, 400, 900);
    context.quadraticCurveTo(350, 850, 380, 700);
    context.quadraticCurveTo(360, 550, 420, 500);
    context.fill();
    
    // Europe
    context.beginPath();
    context.ellipse(950, 280, 120, 80, 0, 0, Math.PI * 2);
    context.fill();
    
    // Asia
    context.beginPath();
    context.ellipse(1300, 320, 300, 150, 0, 0, Math.PI * 2);
    context.fill();
    
    // Africa
    context.beginPath();
    context.moveTo(920, 420);
    context.quadraticCurveTo(1000, 450, 980, 600);
    context.quadraticCurveTo(950, 750, 900, 800);
    context.quadraticCurveTo(850, 750, 880, 600);
    context.quadraticCurveTo(860, 450, 920, 420);
    context.fill();
    
    // Australia
    context.beginPath();
    context.ellipse(1450, 750, 120, 70, 0, 0, Math.PI * 2);
    context.fill();
    
    // Antarctica (bottom edge)
    context.fillRect(0, 950, canvas.width, 74);
  };
  
  drawContinents();
  
  // Add country borders
  context.strokeStyle = '#10b981'; // Emerald color for borders
  context.lineWidth = 1;
  context.globalAlpha = 0.6;
  
  // Draw major country border lines
  const drawBorders = () => {
    // USA-Canada border
    context.beginPath();
    context.moveTo(200, 300);
    context.lineTo(500, 290);
    context.stroke();
    
    // Mexico border
    context.beginPath();
    context.moveTo(250, 400);
    context.lineTo(450, 420);
    context.stroke();
    
    // European borders
    for (let i = 0; i < 8; i++) {
      context.beginPath();
      context.moveTo(850 + i * 25, 250);
      context.lineTo(860 + i * 25, 320);
      context.stroke();
    }
    
    // African country borders
    for (let i = 0; i < 6; i++) {
      context.beginPath();
      context.moveTo(880, 450 + i * 50);
      context.lineTo(980, 460 + i * 50);
      context.stroke();
    }
  };
  
  drawBorders();
  context.globalAlpha = 1.0;
  
  // Add day/night terminator
  const terminatorX = (time * canvas.width) % canvas.width;
  const nightGradient = context.createLinearGradient(terminatorX - 100, 0, terminatorX + 100, 0);
  nightGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  nightGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.7)');
  nightGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  
  context.fillStyle = nightGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  return new THREE.CanvasTexture(canvas);
};

// Create normal map for enhanced surface detail
const createNormalTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d')!;
  
  // Base normal color (pointing up)
  context.fillStyle = '#8080ff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add terrain variation
  const imageData = context.createImageData(canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % canvas.width;
    const y = Math.floor((i / 4) / canvas.width);
    
    // Create terrain-like normal variations
    const noise = (Math.sin(x * 0.1) + Math.cos(y * 0.08)) * 0.3 + 0.5;
    const normal = 128 + noise * 20;
    
    data[i] = normal;     // Red (X normal)
    data[i + 1] = normal; // Green (Y normal)  
    data[i + 2] = 255;    // Blue (Z normal - pointing up)
    data[i + 3] = 255;    // Alpha
  }
  
  context.putImageData(imageData, 0, 0);
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

function getBorderLinesFromGeoJSON(geojson: any, radius = 2.021) {
  const lines: Array<Array<[number, number, number]>> = [];
  geojson.features.forEach((feature: any) => {
    const { coordinates, type } = feature.geometry;
    if (type === 'Polygon') {
      coordinates.forEach((ring: any) => {
        lines.push(ring.map(([lng, lat]: [number, number]) => latLngToVector3(lat, lng, radius).toArray()));
      });
    } else if (type === 'MultiPolygon') {
      coordinates.forEach((polygon: any) => {
        polygon.forEach((ring: any) => {
          lines.push(ring.map(([lng, lat]: [number, number]) => latLngToVector3(lat, lng, radius).toArray()));
        });
      });
    }
  });
  return lines;
}

function RealisticGlobe({ countryData, hoveredCountry, setHoveredCountry }: {
  countryData: CountryData[];
  hoveredCountry: string | null;
  setHoveredCountry: (country: string | null) => void;
}) {
  const globeRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const arcsRef = useRef<THREE.Group>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [timeOffset, setTimeOffset] = useState(0);
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
    
    // Update day/night cycle
    setTimeOffset(state.clock.elapsedTime * 0.1);
    
    // Animate language arcs
    if (arcsRef.current) {
      arcsRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshBasicMaterial;
          const pulse = Math.sin(state.clock.elapsedTime * 2 + index * 0.5) * 0.3 + 0.7;
          material.opacity = pulse;
        }
      });
    }
  });

  // Enhanced Earth texture with day/night cycle and language coverage
  const earthTexture = useMemo(() => {
    return createDayNightTexture(timeOffset);
  }, [timeOffset]);

  const normalTexture = useMemo(() => createNormalTexture(), []);

  const bumpTexture = useMemo(() => createBumpTexture(), []);

  const borderLines = useMemo(() => getBorderLinesFromGeoJSON(countryBorders), []);

  // Create language connection arcs between countries
  const languageArcs = useMemo(() => {
    const arcs: JSX.Element[] = [];
    const processedPairs = new Set<string>();
    
    countryData.forEach((country1, i) => {
      if (country1.languages.length === 0) return;
      
      countryData.forEach((country2, j) => {
        if (i >= j || country2.languages.length === 0) return;
        
        // Check if countries share languages
        const sharedLanguages = country1.languages.filter(lang => 
          country2.languages.includes(lang)
        );
        
        if (sharedLanguages.length > 0) {
          const pairKey = `${country1.code}-${country2.code}`;
          const reversePairKey = `${country2.code}-${country1.code}`;
          
          if (processedPairs.has(pairKey) || processedPairs.has(reversePairKey)) return;
          processedPairs.add(pairKey);
          
          const start = latLngToVector3(country1.lat, country1.lng, 2.02);
          const end = latLngToVector3(country2.lat, country2.lng, 2.02);
          
          // Create arc curve
          const midpoint = start.clone().add(end).multiplyScalar(0.5);
          const distance = start.distanceTo(end);
          const arcHeight = Math.min(distance * 0.8, 1.5);
          midpoint.normalize().multiplyScalar(2 + arcHeight);
          
          const curve = new THREE.QuadraticBezierCurve3(start, midpoint, end);
          const points = curve.getPoints(32);
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          
          const intensity = Math.max(country1.speakerPercentage, country2.speakerPercentage) / 100;
          const arcColor = getCountryColor(intensity, true).getHex(); // <-- fix here
          
          arcs.push(
            <Line
              key={pairKey}
              points={points} // points: Vector3[]
              color={arcColor}
              transparent
              opacity={0.6}
              lineWidth={3}
            />
          );
        }
      });
    });
    
    return arcs;
  }, [countryData]);

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
      {/* Main Earth sphere with enhanced textures */}
      <mesh 
        ref={globeRef}
        onPointerDown={handleInteractionStart}
        onPointerUp={handleInteractionEnd}
      >
        <sphereGeometry args={[2, 256, 128]} />
        <meshStandardMaterial 
          map={earthTexture}
          normalMap={normalTexture}
          normalScale={new THREE.Vector2(0.3, 0.3)}
          bumpMap={bumpTexture}
          bumpScale={0.02}
          roughness={0.7}
          metalness={0.1}
          emissive={new THREE.Color(0x001122)}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Multi-layer atmospheric glow */}
      <mesh ref={atmosphereRef} scale={[1.03, 1.03, 1.03]}>
        <sphereGeometry args={[2, 64, 32]} />
        <meshBasicMaterial 
          color={0x87ceeb}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Outer atmospheric glow */}
      <mesh scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[2, 32, 16]} />
        <meshBasicMaterial 
          color={0x4dd0e7}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Language connection arcs */}
      <group ref={arcsRef}>
        {languageArcs}
      </group>

      {/* Country markers with enhanced effects */}
      {countryMarkers}

      {borderLines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color="black"
          lineWidth={1}
          transparent
          opacity={0.6}
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
        <div className="h-[700px] relative flex items-center justify-center">
            <Canvas 
            camera={{ position: [0, 0, 5], fov: 60 }} // Center the camera position
            shadows
            gl={{ antialias: true, alpha: true }}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Realistic lighting setup for day/night */}
            <ambientLight intensity={0.15} color="#404080" />
            <directionalLight 
              position={[5, 3, 5]} 
              intensity={1.5} 
              color="#ffffff"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-near={0.1}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            <directionalLight 
              position={[-5, -3, -5]} 
              intensity={0.3} 
              color="#1e3a8a"
            />
            <pointLight 
              position={[0, 0, 8]} 
              intensity={0.4} 
              color="#60a5fa"
              distance={20}
            />
            <hemisphereLight 
              args={["#87CEEB", "#1e3a8a", 0.4]}
            />
            
            {<RealisticGlobe 
              countryData={countryData}
              hoveredCountry={hoveredCountry}
              setHoveredCountry={setHoveredCountry}
            />}
            
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              enableDamping={true}
              dampingFactor={0.03}
              minDistance={2.5}
              maxDistance={12}
              rotateSpeed={0.5}
              zoomSpeed={0.8}
              panSpeed={0.5}
              autoRotate={false}
              autoRotateSpeed={0.3}
              maxPolarAngle={Math.PI}
              minPolarAngle={0}
              target={[0, 0, 0]}
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