import { logger } from '../../utils/logger';

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('info', () => {
    it('deve logar mensagem de info', () => {
      logger.info('Mensagem de teste');

      expect(consoleLogSpy).toHaveBeenCalled();
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('[INFO]');
      expect(loggedMessage).toContain('Mensagem de teste');
    });

    it('deve logar mensagem de info com metadados', () => {
      logger.info('Mensagem com meta', { userId: '123' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('[INFO]');
      expect(loggedMessage).toContain('{"userId":"123"}');
    });
  });

  describe('warn', () => {
    it('deve logar mensagem de warn', () => {
      logger.warn('Mensagem de aviso');

      expect(consoleWarnSpy).toHaveBeenCalled();
      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('[WARN]');
      expect(loggedMessage).toContain('Mensagem de aviso');
    });

    it('deve logar mensagem de warn com metadados', () => {
      logger.warn('Aviso com meta', { code: 'W001' });

      expect(consoleWarnSpy).toHaveBeenCalled();
      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('{"code":"W001"}');
    });
  });

  describe('error', () => {
    it('deve logar mensagem de error', () => {
      logger.error('Mensagem de erro');

      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('[ERROR]');
      expect(loggedMessage).toContain('Mensagem de erro');
    });

    it('deve logar mensagem de error com metadados', () => {
      logger.error('Erro crítico', { stack: 'stacktrace' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('{"stack":"stacktrace"}');
    });
  });

  describe('debug', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('deve logar mensagem de debug em ambiente development', () => {
      process.env.NODE_ENV = 'development';
      logger.debug('Mensagem de debug');

      expect(consoleLogSpy).toHaveBeenCalled();
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('[DEBUG]');
      expect(loggedMessage).toContain('Mensagem de debug');
    });

    it('não deve logar mensagem de debug em ambiente production', () => {
      process.env.NODE_ENV = 'production';
      logger.debug('Mensagem de debug');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('deve logar mensagem de debug com metadados', () => {
      process.env.NODE_ENV = 'development';
      logger.debug('Debug com meta', { debugInfo: 'test' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('{"debugInfo":"test"}');
    });
  });
});
