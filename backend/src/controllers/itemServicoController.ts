import { Request, Response, NextFunction } from 'express';
import { itemServicoService } from '../services/itemServicoService';

export const itemServicoController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const itens = await itemServicoService.listar();
      res.json(itens);
    } catch (error) {
      next(error);
    }
  },

  async listarPorCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoriaId } = req.params;
      const itens = await itemServicoService.listarPorCategoria(categoriaId);
      res.json(itens);
    } catch (error) {
      next(error);
    }
  },

  async listarAtivosPorCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoriaId } = req.params;
      const itens = await itemServicoService.listarAtivosPorCategoria(categoriaId);
      res.json(itens);
    } catch (error) {
      next(error);
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = await itemServicoService.buscarPorId(id);
      res.json(item);
    } catch (error) {
      next(error);
    }
  },

  async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoriaId, descricao, unidade, ativo } = req.body;
      const item = await itemServicoService.criar({ categoriaId, descricao, unidade, ativo });
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { descricao, unidade, ativo, ordem } = req.body;
      const item = await itemServicoService.atualizar(id, { descricao, unidade, ativo, ordem });
      res.json(item);
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await itemServicoService.excluir(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async toggleAtivo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = await itemServicoService.toggleAtivo(id);
      res.json(item);
    } catch (error) {
      next(error);
    }
  },
};
