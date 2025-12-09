export const theme = {
  colors: {
    primary: '#FF6B35',
    primaryDark: '#E55A2B',
    primaryLight: '#FF8C5A',
    secondary: '#1A1A2E',
    secondaryLight: '#16213E',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    textPrimary: '#1A1A2E',
    textSecondary: '#666666',
    textLight: '#999999',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
    border: '#E0E0E0',
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.1)',
    large: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    round: '50%',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
};

export type Theme = typeof theme;
