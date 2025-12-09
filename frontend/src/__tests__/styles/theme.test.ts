import { describe, it, expect } from 'vitest';
import { theme } from '../../styles/theme';

describe('Theme', () => {
  describe('colors', () => {
    it('deve ter cores primárias definidas', () => {
      expect(theme.colors.primary).toBe('#FF6B35');
      expect(theme.colors.primaryDark).toBe('#E55A2B');
      expect(theme.colors.primaryLight).toBe('#FF8C5A');
    });

    it('deve ter cores secundárias definidas', () => {
      expect(theme.colors.secondary).toBe('#1A1A2E');
      expect(theme.colors.secondaryLight).toBe('#16213E');
    });

    it('deve ter cores de fundo e superfície', () => {
      expect(theme.colors.background).toBe('#F5F5F5');
      expect(theme.colors.surface).toBe('#FFFFFF');
    });

    it('deve ter cores de texto', () => {
      expect(theme.colors.textPrimary).toBe('#1A1A2E');
      expect(theme.colors.textSecondary).toBe('#666666');
      expect(theme.colors.textLight).toBe('#999999');
    });

    it('deve ter cores de status', () => {
      expect(theme.colors.success).toBe('#4CAF50');
      expect(theme.colors.warning).toBe('#FFC107');
      expect(theme.colors.error).toBe('#F44336');
      expect(theme.colors.info).toBe('#2196F3');
    });

    it('deve ter cor de borda', () => {
      expect(theme.colors.border).toBe('#E0E0E0');
    });
  });

  describe('shadows', () => {
    it('deve ter sombras definidas', () => {
      expect(theme.shadows.small).toBe('0 2px 4px rgba(0, 0, 0, 0.1)');
      expect(theme.shadows.medium).toBe('0 4px 8px rgba(0, 0, 0, 0.1)');
      expect(theme.shadows.large).toBe('0 8px 16px rgba(0, 0, 0, 0.1)');
    });
  });

  describe('borderRadius', () => {
    it('deve ter border radius definidos', () => {
      expect(theme.borderRadius.small).toBe('4px');
      expect(theme.borderRadius.medium).toBe('8px');
      expect(theme.borderRadius.large).toBe('12px');
      expect(theme.borderRadius.round).toBe('50%');
    });
  });

  describe('spacing', () => {
    it('deve ter espaçamentos definidos', () => {
      expect(theme.spacing.xs).toBe('4px');
      expect(theme.spacing.sm).toBe('8px');
      expect(theme.spacing.md).toBe('16px');
      expect(theme.spacing.lg).toBe('24px');
      expect(theme.spacing.xl).toBe('32px');
      expect(theme.spacing.xxl).toBe('48px');
    });
  });

  describe('breakpoints', () => {
    it('deve ter breakpoints definidos', () => {
      expect(theme.breakpoints.mobile).toBe('480px');
      expect(theme.breakpoints.tablet).toBe('768px');
      expect(theme.breakpoints.desktop).toBe('1024px');
      expect(theme.breakpoints.wide).toBe('1280px');
    });
  });
});
