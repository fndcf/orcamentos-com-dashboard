import { Request, Response, NextFunction } from 'express';
import { itemServicoService } from '../services/itemServicoService';
import { validar, itemServicoCriarSchema, itemServicoAtualizarSchema } from '../validators';
import { tamanhoPagina } from '../utils/paginacao';

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

  async listarAtivosPorCategoriaPaginado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoriaId } = req.params;
      const { cursor, search } = req.query;
      const result = await itemServicoService.listarAtivosPorCategoriaPaginado(
        categoriaId,
        tamanhoPagina(req.query.limit, 10),
        cursor as string | undefined,
        search as string | undefined
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async listarPorCategoriaPaginado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoriaId } = req.params;
      const { cursor, search } = req.query;
      const result = await itemServicoService.listarPorCategoriaPaginado(
        categoriaId,
        tamanhoPagina(req.query.limit, 10),
        cursor as string | undefined,
        search as string | undefined
      );
      res.json(result);
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
      const item = await itemServicoService.criar(validar(itemServicoCriarSchema, req.body));
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = await itemServicoService.atualizar(id, validar(itemServicoAtualizarSchema, req.body));
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
