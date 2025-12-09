import { Request, Response, NextFunction } from 'express';
import { servicoService } from '../services/servicoService';

export const servicoController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const servicos = await servicoService.listar();
      res.json(servicos);
    } catch (error) {
      next(error);
    }
  },

  async listarAtivos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const servicos = await servicoService.listarAtivos();
      res.json(servicos);
    } catch (error) {
      next(error);
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const servico = await servicoService.buscarPorId(id);
      res.json(servico);
    } catch (error) {
      next(error);
    }
  },

  async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { descricao, ativo } = req.body;
      const servico = await servicoService.criar({ descricao, ativo });
      res.status(201).json(servico);
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { descricao, ativo, ordem } = req.body;
      const servico = await servicoService.atualizar(id, { descricao, ativo, ordem });
      res.json(servico);
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await servicoService.excluir(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async toggleAtivo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const servico = await servicoService.toggleAtivo(id);
      res.json(servico);
    } catch (error) {
      next(error);
    }
  },
};
