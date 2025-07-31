// Mapbox configuration template
// Copy this file to mapbox.ts and add your actual Mapbox access token
// Get your token from: https://account.mapbox.com/access-tokens/
export const MAPBOX_ACCESS_TOKEN = 'pk.your-actual-mapbox-access-token-here';

// Mapbox style configurations
export const MAPBOX_STYLES = {
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
} as const;

// Default map settings
export const DEFAULT_MAP_CONFIG = {
  center: [0, 20] as [number, number],
  zoom: 1.5,
  pitch: 45,
  bearing: 0,
  projection: 'globe' as const,
  style: MAPBOX_STYLES.light,
};