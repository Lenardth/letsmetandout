import { useColorScheme } from 'react-native';

// Color scheme based on platform documentation
const lightTheme = {
  // Base colors
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#F5F5F5',
  surfaceCard: '#FFFFFF',
  
  // Text colors
  text: '#000000',
  textSecondary: 'rgba(0,0,0,0.7)',
  textTertiary: 'rgba(0,0,0,0.5)',
  
  // Brand colors (slightly desaturated for dark mode)
  primary: '#FF408C',
  primaryLight: '#FF4FA3',
  accent: '#FF3775',
  
  // Semantic colors
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  info: '#2196F3',
  
  // Border and divider colors
  border: '#E0E0E0',
  divider: '#F0F0F0',
  
  // Status bar
  statusBar: 'dark'
};

const darkTheme = {
  // Base colors - starting with charcoal not pitch black
  background: '#121212',
  surface: '#1E1E1E',
  surfaceElevated: '#262626',
  surfaceCard: '#1E1E1E',
  
  // Text colors - off-white with controlled opacity
  text: 'rgba(255,255,255,0.87)',
  textSecondary: 'rgba(255,255,255,0.6)',
  textTertiary: 'rgba(255,255,255,0.4)',
  
  // Brand colors (slightly desaturated and brightened)
  primary: '#FF5EA0',
  primaryLight: '#FF6FB5',
  accent: '#FF4A88',
  
  // Semantic colors (brightened for dark background)
  success: '#66BB6A',
  warning: '#FFA726',
  danger: '#EF5350',
  info: '#42A5F5',
  
  // Border and divider colors
  border: 'rgba(255,255,255,0.12)',
  divider: 'rgba(255,255,255,0.08)',
  
  // Status bar
  statusBar: 'light'
};

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return {
    colors: isDark ? darkTheme : lightTheme,
    isDark
  };
}

export { lightTheme, darkTheme };