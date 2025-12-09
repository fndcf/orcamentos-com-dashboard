import { Request, Response, NextFunction } from 'express';
import { categoriaItemService } from '../services/categoriaItemService';

export const categoriaItemController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categorias = await categoriaItemService.listar();
      res.json(categorias);
    } catch (error) {
      next(error);
    }
  },

  async listarAtivas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categorias = await categoriaItemService.listarAtivas();
      res.json(categorias);
    } catch (error) {
      next(error);
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const categoria = await categoriaItemService.buscarPorId(id);
      res.json(categoria);
    } catch (error) {
      next(error);
    }
  },

  async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nome, ativo } = req.body;
      const categoria = await categoriaItemService.criar({ nome, ativo });
      res.status(201).json(categoria);
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { nome, ativo, ordem } = req.body;
      const categoria = await categoriaItemService.atualizar(id, { nome, ativo, ordem });
      res.json(categoria);
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await categoriaItemService.excluir(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async toggleAtivo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const categoria = await categoriaItemService.toggleAtivo(id);
      res.json(categoria);
    } catch (error) {
      next(error);
    }
  },
};
