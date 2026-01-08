import { Request, Response, NextFunction } from 'express';
import { orcamentoService } from '../services/orcamentoService';
import { OrcamentoStatus } from '../models';

export const orcamentoController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const orcamentos = await orcamentoService.listar();
      res.json({ success: true, data: orcamentos });
    } catch (error) {
      next(error);
    }
  },

  async listarPaginado(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as OrcamentoStatus | undefined;
      const clienteId = req.query.clienteId as string | undefined;
      const busca = req.query.busca as string | undefined;

      const result = await orcamentoService.listarPaginado(page, limit, {
        status,
        clienteId,
        busca,
      });

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const orcamento = await orcamentoService.buscarPorId(id);
      res.json({ success: true, data: orcamento });
    } catch (error) {
      next(error);
    }
  },

  async buscarPorCliente(req: Request, res: Response, next: NextFunction) {
    try {
      const { clienteId } = req.params;
      const orcamentos = await orcamentoService.buscarPorCliente(clienteId);
      res.json({ success: true, data: orcamentos });
    } catch (error) {
      next(error);
    }
  },

  async historicoCliente(req: Request, res: Response, next: NextFunction) {
    try {
      const { clienteId } = req.params;
      const limit = parseInt(req.query.limit as string) || 5;
      const historico = await orcamentoService.getHistoricoCliente(clienteId, limit);
      res.json({ success: true, data: historico });
    } catch (error) {
      next(error);
    }
  },

  async buscarPorStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.params;
      const orcamentos = await orcamentoService.buscarPorStatus(status as OrcamentoStatus);
      res.json({ success: true, data: orcamentos });
    } catch (error) {
      next(error);
    }
  },

  async buscarPorPeriodo(req: Request, res: Response, next: NextFunction) {
    try {
      const { dataInicio, dataFim } = req.query;
      const orcamentos = await orcamentoService.buscarPorPeriodo(
        dataInicio as string,
        dataFim as string
      );
      res.json({ success: true, data: orcamentos });
    } catch (error) {
      next(error);
    }
  },

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const orcamento = await orcamentoService.criar(req.body);
      res.status(201).json({ success: true, data: orcamento });
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const orcamento = await orcamentoService.atualizar(id, req.body);
      res.json({ success: true, data: orcamento });
    } catch (error) {
      next(error);
    }
  },

  async atualizarStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const orcamento = await orcamentoService.atualizarStatus(id, status);
      res.json({ success: true, data: orcamento });
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await orcamentoService.excluir(id);
      res.json({ success: true, message: 'Orçamento excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  },

  async duplicar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const orcamento = await orcamentoService.duplicar(id);
      res.status(201).json({ success: true, data: orcamento });
    } catch (error) {
      next(error);
    }
  },

  async estatisticas(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await orcamentoService.getEstatisticas();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

  async verificarExpirados(req: Request, res: Response, next: NextFunction) {
    try {
      const expirados = await orcamentoService.verificarExpirados();
      res.json({ success: true, data: { expirados } });
    } catch (error) {
      next(error);
    }
  },

  async dashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await orcamentoService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },
};
