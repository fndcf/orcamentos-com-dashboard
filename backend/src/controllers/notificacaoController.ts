import { Request, Response, NextFunction } from 'express';
import { notificacaoService } from '../services/notificacaoService';

export const notificacaoController = {
  async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const notificacao = await notificacaoService.buscarPorId(id);
      res.json(notificacao);
    } catch (error) {
      next(error);
    }
  },

  async marcarComoLida(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const notificacao = await notificacaoService.marcarComoLida(id);
      res.json(notificacao);
    } catch (error) {
      next(error);
    }
  },

  async marcarTodasComoLidas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quantidade = await notificacaoService.marcarTodasComoLidas();
      res.json({ marcadas: quantidade });
    } catch (error) {
      next(error);
    }
  },

  async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await notificacaoService.excluir(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async gerarParaOrcamento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orcamentoId } = req.params;
      const notificacoes = await notificacaoService.gerarNotificacoesParaOrcamento(orcamentoId);
      res.json(notificacoes);
    } catch (error) {
      next(error);
    }
  },

  async processarTodos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await notificacaoService.processarTodosOrcamentosAceitos();
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  },

  async obterResumo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resumo = await notificacaoService.obterResumo();
      res.json(resumo);
    } catch (error) {
      next(error);
    }
  },

  async contarNaoLidas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quantidade = await notificacaoService.contarNaoLidas();
      res.json({ quantidade });
    } catch (error) {
      next(error);
    }
  },

  // ========== HANDLERS PAGINADOS ==========

  async listarPaginado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
      const cursor = req.query.cursor as string | undefined;
      const resultado = await notificacaoService.listarTodasPaginado(pageSize, cursor);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  },

  async listarNaoLidasPaginado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
      const cursor = req.query.cursor as string | undefined;
      const resultado = await notificacaoService.listarNaoLidasPaginado(pageSize, cursor);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  },

  async listarVencidasPaginado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
      const cursor = req.query.cursor as string | undefined;
      const resultado = await notificacaoService.listarVencidasPaginado(pageSize, cursor);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  },

  async listarAtivasPaginado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dias = req.query.dias ? parseInt(req.query.dias as string) : 60;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
      const cursor = req.query.cursor as string | undefined;
      const resultado = await notificacaoService.listarAtivasPaginado(dias, pageSize, cursor);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  },

  async listarProximasPaginado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dias = req.query.dias ? parseInt(req.query.dias as string) : 30;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
      const cursor = req.query.cursor as string | undefined;
      const resultado = await notificacaoService.listarProximasPaginado(dias, pageSize, cursor);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  },
};
