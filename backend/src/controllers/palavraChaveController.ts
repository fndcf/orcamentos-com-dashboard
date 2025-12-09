import { Request, Response, NextFunction } from 'express';
import { palavraChaveService } from '../services/palavraChaveService';

export const palavraChaveController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const palavrasChave = await palavraChaveService.listar();
      res.json(palavrasChave);
    } catch (error) {
      next(error);
    }
  },

  async listarAtivas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const palavrasChave = await palavraChaveService.listarAtivas();
      res.json(palavrasChave);
    } catch (error) {
      next(error);
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const palavraChave = await palavraChaveService.buscarPorId(id);
      res.json(palavraChave);
    } catch (error) {
      next(error);
    }
  },

  async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { palavra, prazoDias, ativo } = req.body;
      const palavraChave = await palavraChaveService.criar({ palavra, prazoDias, ativo });
      res.status(201).json(palavraChave);
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { palavra, prazoDias, ativo } = req.body;
      const palavraChave = await palavraChaveService.atualizar(id, { palavra, prazoDias, ativo });
      res.json(palavraChave);
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await palavraChaveService.excluir(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async toggleAtivo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const palavraChave = await palavraChaveService.toggleAtivo(id);
      res.json(palavraChave);
    } catch (error) {
      next(error);
    }
  },
};
