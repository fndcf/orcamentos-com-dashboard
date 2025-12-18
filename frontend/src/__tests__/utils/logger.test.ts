import { describe, it, expect, vi, beforeEach, afterEach, MockInstance } from 'vitest';
import { logger } from '../../utils/logger';

describe('Logger', () => {
  let consoleLogSpy: MockInstance;
  let consoleWarnSpy: MockInstance;
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('info', () => {
    it('deve chamar console.log com mensagem formatada em desenvolvimento', () => {
      // Em ambiente de teste, isDevelopment é true
      logger.info('Mensagem de info');

      expect(consoleLogSpy).toHaveBeenCalled();
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('[INFO]');
      expect(call).toContain('Mensagem de info');
    });

    it('deve incluir metadados quando fornecidos', () => {
      logger.info('Mensagem com meta', { userId: 123, action: 'test' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('[INFO]');
      expect(call).toContain('Mensagem com meta');
      expect(call).toContain('"userId":123');
      expect(call).toContain('"action":"test"');
    });
  });

  describe('warn', () => {
    it('deve chamar console.warn com mensagem formatada', () => {
      logger.warn('Mensagem de aviso');

      expect(consoleWarnSpy).toHaveBeenCalled();
      const call = consoleWarnSpy.mock.calls[0][0];
      expect(call).toContain('[WARN]');
      expect(call).toContain('Mensagem de aviso');
    });

    it('deve incluir metadados quando fornecidos', () => {
      logger.warn('Aviso com meta', { warning: 'deprecation' });

      expect(consoleWarnSpy).toHaveBeenCalled();
      const call = consoleWarnSpy.mock.calls[0][0];
      expect(call).toContain('[WARN]');
      expect(call).toContain('"warning":"deprecation"');
    });
  });

  describe('error', () => {
    it('deve chamar console.error com mensagem formatada', () => {
      logger.error('Mensagem de erro');

      expect(consoleErrorSpy).toHaveBeenCalled();
      const call = consoleErrorSpy.mock.calls[0][0];
      expect(call).toContain('[ERROR]');
      expect(call).toContain('Mensagem de erro');
    });

    it('deve incluir metadados quando fornecidos', () => {
      const error = new Error('Erro de teste');
      logger.error('Erro ocorreu', { error });

      expect(consoleErrorSpy).toHaveBeenCalled();
      const call = consoleErrorSpy.mock.calls[0][0];
      expect(call).toContain('[ERROR]');
      expect(call).toContain('Erro ocorreu');
    });

    it('deve sempre logar erros mesmo sem metadados', () => {
      logger.error('Erro simples');

      expect(consoleErrorSpy).toHaveBeenCalled();
      const call = consoleErrorSpy.mock.calls[0][0];
      expect(call).toContain('[ERROR]');
      expect(call).toContain('Erro simples');
    });
  });

  describe('debug', () => {
    it('deve chamar console.log com mensagem formatada em desenvolvimento', () => {
      logger.debug('Mensagem de debug');

      expect(consoleLogSpy).toHaveBeenCalled();
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('[DEBUG]');
      expect(call).toContain('Mensagem de debug');
    });

    it('deve incluir metadados quando fornecidos', () => {
      logger.debug('Debug com meta', { variable: 'value', count: 42 });

      expect(consoleLogSpy).toHaveBeenCalled();
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('[DEBUG]');
      expect(call).toContain('"variable":"value"');
      expect(call).toContain('"count":42');
    });
  });

  describe('formatMessage', () => {
    it('deve incluir timestamp ISO no formato da mensagem', () => {
      logger.info('Test message');

      const call = consoleLogSpy.mock.calls[0][0];
      // Verifica se contém um timestamp no formato ISO
      expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('deve formatar mensagem sem metadados corretamente', () => {
      logger.info('Mensagem simples');

      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toMatch(/\[.*\] \[INFO\] Mensagem simples$/);
    });

    it('deve formatar mensagem com metadados corretamente', () => {
      logger.info('Mensagem', { key: 'value' });

      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('{"key":"value"}');
    });
  });
});
