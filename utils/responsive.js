import { Dimensions, Platform } from 'react-native';

// Get dynamic dimensions that update on orientation change
const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

// Breakpoints for responsive design
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1200,
  extraLarge: 1440,
};

// Dynamic device type detection
export const getDeviceType = () => {
  const { width, height } = getScreenDimensions();
  const isLandscape = width > height;
  
  return {
    isMobile: width < breakpoints.tablet,
    isTablet: width >= breakpoints.tablet && width < breakpoints.desktop,
    isDesktop: width >= breakpoints.desktop && width < breakpoints.largeDesktop,
    isLargeDesktop: width >= breakpoints.largeDesktop && width < breakpoints.extraLarge,
    isExtraLarge: width >= breakpoints.extraLarge,
    isLandscape,
    isPortrait: !isLandscape,
    width,
    height,
  };
};

// Get current device type
const deviceType = getDeviceType();
export const isMobile = deviceType.isMobile;
export const isTablet = deviceType.isTablet;
export const isDesktop = deviceType.isDesktop;
export const isLargeDesktop = deviceType.isLargeDesktop;
export const isExtraLarge = deviceType.isExtraLarge;
export const isLandscape = deviceType.isLandscape;
export const isPortrait = deviceType.isPortrait;

// Dynamic responsive dimensions
export const getResponsiveDimensions = () => {
  const { width, height } = getScreenDimensions();
  const device = getDeviceType();
  
  return {
    screenWidth: width,
    screenHeight: height,
    ...device,
    // Additional responsive calculations
    availableWidth: width - (device.isMobile ? 32 : device.isTablet ? 48 : 64),
    availableHeight: height - (device.isMobile ? 100 : device.isTablet ? 120 : 140),
    contentWidth: Math.min(width * 0.95, device.isMobile ? width - 32 : 1200),
    headerHeight: device.isMobile ? 60 : device.isTablet ? 70 : 80,
    footerHeight: device.isMobile ? 50 : device.isTablet ? 60 : 70,
  };
};

// Static responsive dimensions for backward compatibility
export const responsiveDimensions = {
  screenWidth: deviceType.width,
  screenHeight: deviceType.height,
  isMobile,
  isTablet,
  isDesktop,
  isLargeDesktop,
  isExtraLarge,
  isLandscape,
  isPortrait,
};

// Dynamic responsive font sizes
export const getResponsiveFontSizes = () => {
  const device = getDeviceType();
  const baseSize = device.isMobile ? 14 : device.isTablet ? 16 : 18;
  
  return {
    xs: Math.round(baseSize * 0.7),
    sm: Math.round(baseSize * 0.85),
    base: baseSize,
    lg: Math.round(baseSize * 1.15),
    xl: Math.round(baseSize * 1.3),
    '2xl': Math.round(baseSize * 1.5),
    '3xl': Math.round(baseSize * 1.8),
    '4xl': Math.round(baseSize * 2.2),
    '5xl': Math.round(baseSize * 2.6),
    '6xl': Math.round(baseSize * 3.0),
  };
};

// Static font sizes for backward compatibility
export const fontSizes = getResponsiveFontSizes();

// Dynamic responsive spacing
export const getResponsiveSpacing = () => {
  const device = getDeviceType();
  const baseSpacing = device.isMobile ? 8 : device.isTablet ? 12 : 16;
  
  return {
    xs: Math.round(baseSpacing * 0.5),
    sm: Math.round(baseSpacing * 1),
    base: baseSpacing,
    lg: Math.round(baseSpacing * 1.5),
    xl: Math.round(baseSpacing * 2),
    '2xl': Math.round(baseSpacing * 2.5),
    '3xl': Math.round(baseSpacing * 3),
    '4xl': Math.round(baseSpacing * 4),
    '5xl': Math.round(baseSpacing * 5),
    '6xl': Math.round(baseSpacing * 6),
  };
};

// Static spacing for backward compatibility
export const spacing = getResponsiveSpacing();

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

// Enhanced responsive value function
export const getResponsiveValue = (mobile, tablet, desktop, largeDesktop, extraLarge) => {
  const device = getDeviceType();
  if (device.isMobile) return mobile;
  if (device.isTablet) return tablet;
  if (device.isDesktop) return desktop;
  if (device.isLargeDesktop) return largeDesktop || desktop;
  if (device.isExtraLarge) return extraLarge || largeDesktop || desktop;
  return desktop;
};

// Get responsive value with orientation consideration
export const getResponsiveValueWithOrientation = (portrait, landscape) => {
  const device = getDeviceType();
  return device.isLandscape ? landscape : portrait;
};

// Get responsive percentage based on screen width
export const getResponsivePercentage = (mobilePercent, tabletPercent, desktopPercent) => {
  const device = getDeviceType();
  if (device.isMobile) return `${mobilePercent}%`;
  if (device.isTablet) return `${tabletPercent}%`;
  return `${desktopPercent}%`;
};

// Get responsive pixel value
export const getResponsivePixels = (mobilePx, tabletPx, desktopPx) => {
  const device = getDeviceType();
  if (device.isMobile) return mobilePx;
  if (device.isTablet) return tabletPx;
  return desktopPx;
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

// Dynamic layout utilities
export const getResponsiveLayout = () => {
  const device = getDeviceType();
  const spacing = getResponsiveSpacing();
  const fontSizes = getResponsiveFontSizes();
  
  return {
    // Header styles
    header: {
      height: device.isMobile ? 60 : device.isTablet ? 70 : 80,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.base,
    },
    
    // Card styles
    card: {
      padding: spacing.lg,
      margin: spacing.base,
      borderRadius: device.isMobile ? 8 : 12,
      minHeight: device.isMobile ? 120 : 140,
    },
    
    // Button styles
    button: {
      height: device.isMobile ? 44 : device.isTablet ? 48 : 52,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.base,
      borderRadius: device.isMobile ? 6 : 8,
      fontSize: fontSizes.base,
    },
    
    // Input styles
    input: {
      height: device.isMobile ? 48 : device.isTablet ? 52 : 56,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderRadius: device.isMobile ? 6 : 8,
      fontSize: fontSizes.base,
    },
    
    // Modal styles
    modal: {
      width: device.isMobile ? '95%' : device.isTablet ? '85%' : '70%',
      maxWidth: device.isMobile ? 400 : device.isTablet ? 600 : 800,
      padding: spacing.xl,
      borderRadius: device.isMobile ? 12 : 16,
    },
    
    // Grid styles
    grid: {
      columns: device.isMobile ? 1 : device.isTablet ? 2 : 3,
      gap: spacing.base,
      padding: spacing.base,
    },
  };
};

// Dynamic text styles
export const getResponsiveTextStyles = () => {
  const device = getDeviceType();
  const fontSizes = getResponsiveFontSizes();
  
  return {
    h1: {
      fontSize: fontSizes['4xl'],
      fontWeight: 'bold',
      lineHeight: device.isMobile ? fontSizes['4xl'] * 1.2 : fontSizes['4xl'] * 1.3,
    },
    h2: {
      fontSize: fontSizes['3xl'],
      fontWeight: 'bold',
      lineHeight: device.isMobile ? fontSizes['3xl'] * 1.2 : fontSizes['3xl'] * 1.3,
    },
    h3: {
      fontSize: fontSizes['2xl'],
      fontWeight: '600',
      lineHeight: device.isMobile ? fontSizes['2xl'] * 1.2 : fontSizes['2xl'] * 1.3,
    },
    body: {
      fontSize: fontSizes.base,
      lineHeight: device.isMobile ? fontSizes.base * 1.4 : fontSizes.base * 1.5,
    },
    caption: {
      fontSize: fontSizes.sm,
      lineHeight: device.isMobile ? fontSizes.sm * 1.3 : fontSizes.sm * 1.4,
    },
  };
};

// Dynamic shadow styles
export const getResponsiveShadows = () => {
  const device = getDeviceType();
  
  return {
    light: {
      boxShadow: device.isMobile 
        ? '0 1px 3px rgba(0, 0, 0, 0.1)' 
        : '0 2px 4px rgba(0, 0, 0, 0.1)',
      elevation: device.isMobile ? 2 : 3,
    },
    medium: {
      boxShadow: device.isMobile 
        ? '0 2px 6px rgba(0, 0, 0, 0.15)' 
        : '0 4px 8px rgba(0, 0, 0, 0.15)',
      elevation: device.isMobile ? 4 : 6,
    },
    heavy: {
      boxShadow: device.isMobile 
        ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
        : '0 8px 16px rgba(0, 0, 0, 0.2)',
      elevation: device.isMobile ? 8 : 12,
    },
  };
};

export default {
  // Core responsive utilities
  breakpoints,
  getDeviceType,
  getScreenDimensions,
  getResponsiveDimensions,
  responsiveDimensions,
  
  // Typography
  getResponsiveFontSizes,
  fontSizes,
  getResponsiveTextStyles,
  
  // Spacing and layout
  getResponsiveSpacing,
  spacing,
  getResponsiveLayout,
  getResponsivePadding,
  getResponsiveMargins,
  
  // Responsive values
  getResponsiveValue,
  getResponsiveValueWithOrientation,
  getResponsivePercentage,
  getResponsivePixels,
  
  // Component dimensions
  containerWidths,
  cardDimensions,
  buttonDimensions,
  inputDimensions,
  modalDimensions,
  
  // Grid system
  gridColumns,
  getGridStyle,
  getGridItemStyle,
  
  // Visual design
  colors,
  shadows,
  getResponsiveShadows,
  borderRadius,
  animations,
  
  // Scroll configuration
  scrollConfig,
  
  // Device type flags
  isMobile,
  isTablet,
  isDesktop,
  isLargeDesktop,
  isExtraLarge,
  isLandscape,
  isPortrait,
};
