import { useColorScheme } from 'react-native';

// Modern color palette with improved accessibility and visual hierarchy
const lightTheme = {
  // Core surfaces
  background: '#F7F7FB',
  surface: '#FFFFFF',
  surfaceElevated: '#FCFCFF',
  surfaceCard: '#FFFFFF',
  
  // Text hierarchy
  text: '#171822',
  textSecondary: '#687080',
  textTertiary: '#98A0AF',
  
  // Brand colors (vibrant but accessible)
  primary: '#FF3A79',     // Modern pink-red
  primaryLight: '#FF7BA4', // Softer highlight variant
  accent: '#FF2E63',       // Deeper accent
  
  // Semantic colors (updated for better WCAG compliance)
  success: '#00C853',     // Vibrant success green
  warning: '#FFAB00',     // Golden warning
  danger: '#FF1744',      // Alert red
  error: '#FF1744',       // Backward-compatible alert alias
  info: '#2979FF',        // Bright info blue
  
  // Borders & dividers
  border: '#E7E8EF',
  divider: '#EFF0F5',
  
  // Status bar
  statusBar: 'dark',
  
  // New modern additions
  backdrop: 'rgba(15, 18, 35, 0.18)',
  shadow: '#171822',
  icon: '#687080',
  radius: 20,
  shadowOpacity: 0.08,
};

const darkTheme = {
  // Deep surfaces (true black is harsh for dark mode)
  background: '#101116',
  surface: '#191A21',
  surfaceElevated: '#22232C',
  surfaceCard: '#1E1E1E',
  
  // Text (with opacity hierarchy)
  text: 'rgba(255,255,255,0.92)', // High contrast
  textSecondary: 'rgba(255,255,255,0.7)',
  textTertiary: 'rgba(255,255,255,0.5)',
  
  // Brand colors (softer in dark mode)
  primary: '#FF5B8D',      // Bright but not overwhelming
  primaryLight: '#FF8CAD', // Light variant
  accent: '#FF4777',       // Focus accent
  
  // Semantic colors (lighter for dark BG)
  success: '#66FFA6',      // Bright success
  warning: '#FFD54F',      // Soft gold
  danger: '#FF616F',       // Coral danger
  error: '#FF616F',        // Backward-compatible alert alias
  info: '#448AFF',         // Softer blue
  
  // Borders & dividers
  border: 'rgba(255,255,255,0.12)',
  divider: 'rgba(255,255,255,0.08)',
  
  // Status bar
  statusBar: 'light',
  
  // New modern additions
  backdrop: 'rgba(0,0,0,0.5)', // Darker overlays
  shadow: '#000000',       // Stronger shadows
  icon: 'rgba(255,255,255,0.7)',
  radius: 20,
  shadowOpacity: 0.24,
};

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return {
    colors: isDark ? darkTheme : lightTheme,
    isDark,
    // Add spacing/metrics here if needed
    spacing: {
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 40,
    }
  };
}

export { darkTheme, lightTheme };
