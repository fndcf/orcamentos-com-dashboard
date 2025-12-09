import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path
    });

    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  logger.error(`Unexpected error: ${err.message}`, {
    stack: err.stack,
    path: req.path
  });

  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
  });
};
