import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Breakpoints for responsive design
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1200,
};

// Device type detection
export const isMobile = width < breakpoints.tablet;
export const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;
export const isDesktop = width >= breakpoints.desktop;
export const isLargeDesktop = width >= breakpoints.largeDesktop;

// Responsive dimensions
export const responsiveDimensions = {
  screenWidth: width,
  screenHeight: height,
  isMobile,
  isTablet,
  isDesktop,
  isLargeDesktop,
};

// Responsive font sizes
export const fontSizes = {
  xs: isMobile ? 10 : 12,
  sm: isMobile ? 12 : 14,
  base: isMobile ? 14 : 16,
  lg: isMobile ? 16 : 18,
  xl: isMobile ? 18 : 20,
  '2xl': isMobile ? 20 : 24,
  '3xl': isMobile ? 24 : 28,
  '4xl': isMobile ? 28 : 32,
  '5xl': isMobile ? 32 : 36,
};

// Responsive spacing
export const spacing = {
  xs: isMobile ? 4 : 6,
  sm: isMobile ? 8 : 12,
  base: isMobile ? 16 : 20,
  lg: isMobile ? 20 : 24,
  xl: isMobile ? 24 : 32,
  '2xl': isMobile ? 32 : 40,
  '3xl': isMobile ? 40 : 48,
  '4xl': isMobile ? 48 : 64,
};

// Responsive container widths
export const containerWidths = {
  mobile: '95%',
  tablet: '90%',
  desktop: '85%',
  largeDesktop: '80%',
  maxWidth: isMobile ? '100%' : isTablet ? '90%' : isDesktop ? '1200px' : '1400px',
};

// Responsive grid columns
export const gridColumns = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
  largeDesktop: 4,
};

// Get responsive value based on screen size
export const getResponsiveValue = (mobile, tablet, desktop, largeDesktop) => {
  if (isMobile) return mobile;
  if (isTablet) return tablet;
  if (isDesktop) return desktop;
  return largeDesktop || desktop;
};

// Responsive padding
export const getResponsivePadding = () => {
  return {
    horizontal: isMobile ? 16 : isTablet ? 24 : 32,
    vertical: isMobile ? 16 : isTablet ? 20 : 24,
  };
};

// Responsive margins
export const getResponsiveMargins = () => {
  return {
    horizontal: isMobile ? 12 : isTablet ? 20 : 24,
    vertical: isMobile ? 12 : isTablet ? 16 : 20,
  };
};

// Card dimensions
export const cardDimensions = {
  width: isMobile ? '100%' : isTablet ? '90%' : '80%',
  maxWidth: isMobile ? 400 : isTablet ? 600 : 800,
  padding: isMobile ? 16 : isTablet ? 20 : 24,
};

// Button dimensions
export const buttonDimensions = {
  height: isMobile ? 44 : 48,
  minWidth: isMobile ? 100 : 120,
  paddingHorizontal: isMobile ? 16 : 20,
  paddingVertical: isMobile ? 12 : 14,
  fontSize: isMobile ? 14 : 16,
};

// Input dimensions
export const inputDimensions = {
  height: isMobile ? 48 : 52,
  paddingHorizontal: isMobile ? 16 : 20,
  paddingVertical: isMobile ? 12 : 16,
  fontSize: isMobile ? 16 : 18,
};

// Modal dimensions
export const modalDimensions = {
  width: isMobile ? '95%' : isTablet ? '85%' : '70%',
  maxWidth: isMobile ? 400 : isTablet ? 600 : 800,
  padding: isMobile ? 20 : isTablet ? 24 : 32,
};

// Grid layout helpers
export const getGridStyle = (columns = 1) => {
  const cols = isMobile ? 1 : isTablet ? Math.min(columns, 2) : columns;
  return {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.base,
  };
};

export const getGridItemStyle = (columns = 1) => {
  const cols = isMobile ? 1 : isTablet ? Math.min(columns, 2) : columns;
  const itemWidth = cols === 1 ? '100%' : `${(100 / cols) - 2}%`;
  return {
    width: itemWidth,
    minWidth: isMobile ? 280 : 300,
  };
};

// Scroll behavior configuration
export const scrollConfig = {
  showsVerticalScrollIndicator: true,
  bounces: true,
  scrollEnabled: true,
  // Web-specific scroll styling
  ...(Platform.OS === 'web' && {
    style: {
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      height: '100%',
      flex: 1,
    },
  }),
  // Force web styles to be applied
  ...(Platform.OS === 'web' && {
    overflowY: 'auto',
    overflowX: 'hidden',
    WebkitOverflowScrolling: 'touch',
  }),
  // Remove contentContainerStyle to avoid conflicts
  // Individual screens can define their own contentContainerStyle
};

// Professional color scheme
export const colors = {
  primary: '#4a90e2',
  primaryDark: '#357abd',
  primaryLight: '#6ba3e8',
  secondary: '#6f42c1',
  success: '#28a745',
  warning: '#ffc107',
  danger: '#dc3545',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  text: {
    primary: '#1a1a1a',
    secondary: '#666666',
    muted: '#9ca3af',
    inverse: '#ffffff',
  },
  background: {
    primary: '#ffffff',
    secondary: '#f8f9fa',
    tertiary: '#e9ecef',
  },
  border: {
    light: '#e1e5e9',
    medium: '#d1d5db',
    dark: '#9ca3af',
  },
};

// Shadow configurations
export const shadows = {
  sm: {
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  base: {
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  lg: {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  xl: {
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
    elevation: 6,
  },
};

// Border radius
export const borderRadius = {
  sm: 4,
  base: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Animation durations
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
};

export default {
  breakpoints,
  responsiveDimensions,
  fontSizes,
  spacing,
  containerWidths,
  gridColumns,
  getResponsiveValue,
  getResponsivePadding,
  getResponsiveMargins,
  cardDimensions,
  buttonDimensions,
  inputDimensions,
  modalDimensions,
  getGridStyle,
  getGridItemStyle,
  scrollConfig,
  colors,
  shadows,
  borderRadius,
  animations,
};
