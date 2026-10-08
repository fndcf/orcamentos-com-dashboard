import { Request, Response, NextFunction } from 'express';
import { limitacaoService } from '../services/limitacaoService';
import { validar, limitacaoCriarSchema, limitacaoAtualizarSchema } from '../validators';

export const limitacaoController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limitacoes = await limitacaoService.listar();
      res.json(limitacoes);
    } catch (error) {
      next(error);
    }
  },

  async listarAtivas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limitacoes = await limitacaoService.listarAtivas();
      res.json(limitacoes);
    } catch (error) {
      next(error);
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const limitacao = await limitacaoService.buscarPorId(id);
      res.json(limitacao);
    } catch (error) {
      next(error);
    }
  },

  async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limitacao = await limitacaoService.criar(validar(limitacaoCriarSchema, req.body));
      res.status(201).json(limitacao);
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const limitacao = await limitacaoService.atualizar(id, validar(limitacaoAtualizarSchema, req.body));
      res.json(limitacao);
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await limitacaoService.excluir(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async toggleAtivo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const limitacao = await limitacaoService.toggleAtivo(id);
      res.json(limitacao);
    } catch (error) {
      next(error);
    }
  },
};
