import { Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../../middlewares/authMiddleware';
import { UnauthorizedError } from '../../utils/errors';

// Mock do Firebase Auth
jest.mock('../../config/firebase', () => ({
  auth: {
    verifyIdToken: jest.fn(),
  },
}));

import { auth } from '../../config/firebase';

describe('authMiddleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('deve chamar next com erro quando não há header de autorização', async () => {
    mockReq.headers = {};

    await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    const error = (mockNext as jest.Mock).mock.calls[0][0];
    expect(error.message).toBe('Token inválido ou expirado');
  });

  it('deve chamar next com erro quando header não começa com Bearer', async () => {
    mockReq.headers = { authorization: 'Basic token123' };

    await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('deve chamar next com erro quando token é inválido', async () => {
    mockReq.headers = { authorization: 'Bearer invalid-token' };
    (auth.verifyIdToken as jest.Mock).mockRejectedValue(new Error('Token inválido'));

    await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    const error = (mockNext as jest.Mock).mock.calls[0][0];
    expect(error.message).toBe('Token inválido ou expirado');
  });

  it('deve definir user no request quando token é válido', async () => {
    mockReq.headers = { authorization: 'Bearer valid-token' };
    (auth.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: 'user-123',
      email: 'test@example.com',
    });

    await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockReq.user).toEqual({
      uid: 'user-123',
      email: 'test@example.com',
    });
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('deve definir email vazio quando token não tem email', async () => {
    mockReq.headers = { authorization: 'Bearer valid-token' };
    (auth.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: 'user-123',
      email: undefined,
    });

    await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockReq.user).toEqual({
      uid: 'user-123',
      email: '',
    });
    expect(mockNext).toHaveBeenCalledWith();
  });
});
