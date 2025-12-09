import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../middlewares/errorHandler';
import { AppError, NotFoundError, ValidationError } from '../../utils/errors';

// Mock do logger
jest.mock('../../utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('errorHandler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockReq = {
      path: '/api/test',
    };

    mockRes = {
      status: statusMock,
      json: jsonMock,
    };

    mockNext = jest.fn();
  });

  it('deve tratar AppError com status correto', () => {
    const error = new AppError('Erro de aplicação', 422);

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(422);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: 'Erro de aplicação',
    });
  });

  it('deve tratar NotFoundError com status 404', () => {
    const error = new NotFoundError('Recurso não encontrado');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: 'Recurso não encontrado',
    });
  });

  it('deve tratar ValidationError com status 400', () => {
    const error = new ValidationError('Dados inválidos');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: 'Dados inválidos',
    });
  });

  it('deve tratar erro genérico com status 500', () => {
    const error = new Error('Erro inesperado');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: 'Erro interno do servidor',
    });
  });

  it('deve tratar erro sem mensagem com status 500', () => {
    const error = new Error();

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: 'Erro interno do servidor',
    });
  });
});
