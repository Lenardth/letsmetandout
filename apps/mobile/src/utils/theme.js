import { useColorScheme } from 'react-native';

// Modern color palette with improved accessibility and visual hierarchy
const lightTheme = {
  // Core surfaces
  background: '#F8F9FA',  // Soft off-white
  surface: '#FFFFFF',     // Pure white cards/sheets
  surfaceElevated: '#FFFFFF', // With elevation shadow instead of color
  surfaceCard: '#FFFFFF',
  
  // Text hierarchy
  text: '#1A1A1A',       // High-contrast charcoal
  textSecondary: '#5A5A5A', // Medium contrast
  textTertiary: '#9A9A9A',  // Low emphasis
  
  // Brand colors (vibrant but accessible)
  primary: '#FF3A79',     // Modern pink-red
  primaryLight: '#FF7BA4', // Softer highlight variant
  accent: '#FF2E63',       // Deeper accent
  
  // Semantic colors (updated for better WCAG compliance)
  success: '#00C853',     // Vibrant success green
  warning: '#FFAB00',     // Golden warning
  danger: '#FF1744',      // Alert red
  info: '#2979FF',        // Bright info blue
  
  // Borders & dividers
  border: '#E8E8E8',      // Very subtle borders
  divider: '#F0F0F0',     // Section dividers
  
  // Status bar
  statusBar: 'dark',
  
  // New modern additions
  backdrop: 'rgba(0,0,0,0.15)', // For overlays
  shadow: '#000000',       // Base shadow color
  icon: '#5A5A5A'         // Standard icon color
};

const darkTheme = {
  // Deep surfaces (true black is harsh for dark mode)
  background: '#121212',   // Near-black
  surface: '#1E1E1E',      // Material dark surface
  surfaceElevated: '#252525', // Elevated cards
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
  info: '#448AFF',         // Softer blue
  
  // Borders & dividers
  border: 'rgba(255,255,255,0.12)',
  divider: 'rgba(255,255,255,0.08)',
  
  // Status bar
  statusBar: 'light',
  
  // New modern additions
  backdrop: 'rgba(0,0,0,0.5)', // Darker overlays
  shadow: '#000000',       // Stronger shadows
  icon: 'rgba(255,255,255,0.7)' // Icon color
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
      xl: 32
    }
  };
}

export { darkTheme, lightTheme };
