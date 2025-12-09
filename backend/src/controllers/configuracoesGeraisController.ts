import { Request, Response, NextFunction } from 'express';
import { configuracoesGeraisService } from '../services/configuracoesGeraisService';

export const configuracoesGeraisController = {
  async buscar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const configuracoes = await configuracoesGeraisService.buscar();
      res.json(configuracoes);
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const configuracoes = await configuracoesGeraisService.atualizar(req.body);
      res.json(configuracoes);
    } catch (error) {
      next(error);
    }
  },
};
