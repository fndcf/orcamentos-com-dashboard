import { Request, Response, NextFunction } from 'express';
import { clienteService } from '../services/clienteService';

export const clienteController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const clientes = await clienteService.listar();
      res.json({ success: true, data: clientes });
    } catch (error) {
      next(error);
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const cliente = await clienteService.buscarPorId(id);
      res.json({ success: true, data: cliente });
    } catch (error) {
      next(error);
    }
  },

  async buscarPorDocumento(req: Request, res: Response, next: NextFunction) {
    try {
      const { documento } = req.params;
      const cliente = await clienteService.buscarPorDocumento(documento);
      res.json({ success: true, data: cliente });
    } catch (error) {
      next(error);
    }
  },

  async pesquisar(req: Request, res: Response, next: NextFunction) {
    try {
      const { termo } = req.query;
      const clientes = await clienteService.pesquisar(termo as string);
      res.json({ success: true, data: clientes });
    } catch (error) {
      next(error);
    }
  },

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const cliente = await clienteService.criar(req.body);
      res.status(201).json({ success: true, data: cliente });
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const cliente = await clienteService.atualizar(id, req.body);
      res.json({ success: true, data: cliente });
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await clienteService.excluir(id);
      res.json({ success: true, message: 'Cliente excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  },
};
