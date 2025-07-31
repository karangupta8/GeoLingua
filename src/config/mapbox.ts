// Mapbox configuration
// Add your Mapbox access token here
// Get your token from: https://account.mapbox.com/access-tokens/
export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoia2FyYW5ndXB0YTgiLCJhIjoiY21kam8zdm5oMGhoNTJyczU3aGtiZTcwMiJ9.BZfMMtGuqqoXp7PjG4QCmg';

// Mapbox style configurations
export const MAPBOX_STYLES = {
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
} as const;

// Default map settings
export const DEFAULT_MAP_CONFIG = {
  center: [0, 0] as [number, number], // Changed from [0, 20] to [0, 0] for true center
  zoom: 1.5,
  pitch: 45,
  bearing: 0,
  projection: 'globe' as const,
  style: MAPBOX_STYLES.light,
};