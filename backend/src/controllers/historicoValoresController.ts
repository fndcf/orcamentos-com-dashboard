import { Request, Response, NextFunction } from 'express';
import { historicoValoresService } from '../services/historicoValoresService';

export const historicoValoresController = {
  async buscarHistoricoItens(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dataInicio, dataFim } = req.query;
      const historico = await historicoValoresService.buscarHistoricoItensPorPeriodo(
        dataInicio as string,
        dataFim as string
      );
      res.json(historico);
    } catch (error) {
      next(error);
    }
  },

  async buscarHistoricoConfiguracoes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dataInicio, dataFim } = req.query;
      const historico = await historicoValoresService.buscarHistoricoConfiguracoesPorPeriodo(
        dataInicio as string,
        dataFim as string
      );
      res.json(historico);
    } catch (error) {
      next(error);
    }
  },
};
