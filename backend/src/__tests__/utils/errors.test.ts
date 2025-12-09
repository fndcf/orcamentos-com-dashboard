import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
} from '../../utils/errors';

describe('Errors', () => {
  describe('AppError', () => {
    it('deve criar erro com valores padrão', () => {
      const error = new AppError('Erro teste');

      expect(error.message).toBe('Erro teste');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('deve criar erro com statusCode customizado', () => {
      const error = new AppError('Erro customizado', 422);

      expect(error.message).toBe('Erro customizado');
      expect(error.statusCode).toBe(422);
      expect(error.isOperational).toBe(true);
    });

    it('deve criar erro não operacional', () => {
      const error = new AppError('Erro crítico', 500, false);

      expect(error.isOperational).toBe(false);
    });
  });

  describe('NotFoundError', () => {
    it('deve criar erro com mensagem padrão', () => {
      const error = new NotFoundError();

      expect(error.message).toBe('Recurso não encontrado');
      expect(error.statusCode).toBe(404);
      expect(error).toBeInstanceOf(AppError);
    });

    it('deve criar erro com mensagem customizada', () => {
      const error = new NotFoundError('Cliente não encontrado');

      expect(error.message).toBe('Cliente não encontrado');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('ValidationError', () => {
    it('deve criar erro com mensagem padrão', () => {
      const error = new ValidationError();

      expect(error.message).toBe('Dados inválidos');
      expect(error.statusCode).toBe(400);
      expect(error).toBeInstanceOf(AppError);
    });

    it('deve criar erro com mensagem customizada', () => {
      const error = new ValidationError('CNPJ inválido');

      expect(error.message).toBe('CNPJ inválido');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('UnauthorizedError', () => {
    it('deve criar erro com mensagem padrão', () => {
      const error = new UnauthorizedError();

      expect(error.message).toBe('Não autorizado');
      expect(error.statusCode).toBe(401);
      expect(error).toBeInstanceOf(AppError);
    });

    it('deve criar erro com mensagem customizada', () => {
      const error = new UnauthorizedError('Token expirado');

      expect(error.message).toBe('Token expirado');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ForbiddenError', () => {
    it('deve criar erro com mensagem padrão', () => {
      const error = new ForbiddenError();

      expect(error.message).toBe('Acesso negado');
      expect(error.statusCode).toBe(403);
      expect(error).toBeInstanceOf(AppError);
    });

    it('deve criar erro com mensagem customizada', () => {
      const error = new ForbiddenError('Sem permissão para acessar');

      expect(error.message).toBe('Sem permissão para acessar');
      expect(error.statusCode).toBe(403);
    });
  });
});
