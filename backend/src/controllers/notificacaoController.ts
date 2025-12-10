import { Request, Response, NextFunction } from 'express';
import { notificacaoService } from '../services/notificacaoService';
import { logger } from '../utils/logger';

export const notificacaoController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notificacoes = await notificacaoService.listarTodas();
      res.json(notificacoes);
    } catch (error) {
      next(error);
    }
  },

  async listarNaoLidas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.debug('[notificacaoController] Buscando notificações não lidas...');
      const notificacoes = await notificacaoService.listarNaoLidas();
      logger.debug('[notificacaoController] Notificações não lidas encontradas:', { count: notificacoes.length });
      res.json(notificacoes);
    } catch (error) {
      logger.error('[notificacaoController] Erro ao buscar notificações não lidas:', { error });
      next(error);
    }
  },

  async listarProximas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dias = req.query.dias ? parseInt(req.query.dias as string) : 30;
      const notificacoes = await notificacaoService.listarProximas(dias);
      res.json(notificacoes);
    } catch (error) {
      next(error);
    }
  },

  async listarVencidas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notificacoes = await notificacaoService.listarVencidas();
      res.json(notificacoes);
    } catch (error) {
      next(error);
    }
  },

  async listarAtivas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dias = req.query.dias ? parseInt(req.query.dias as string) : 60;
      const notificacoes = await notificacaoService.listarAtivas(dias);
      res.json(notificacoes);
    } catch (error) {
      next(error);
    }
  },

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
};
