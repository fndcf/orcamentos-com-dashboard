import { Request, Response, NextFunction } from 'express';
import { notificacaoController } from '../../controllers/notificacaoController';
import { notificacaoService } from '../../services/notificacaoService';

// Mock do notificacaoService
jest.mock('../../services/notificacaoService');

describe('notificacaoController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    sendMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock, send: sendMock });

    mockReq = {
      params: {},
      query: {},
      body: {},
    };

    mockRes = {
      json: jsonMock,
      status: statusMock,
      send: sendMock,
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('listar', () => {
    it('deve retornar lista de notificações com sucesso', async () => {
      const notificacoes = [
        { id: '1', orcamentoId: 'orc1', tipo: 'vencimento', lida: false },
        { id: '2', orcamentoId: 'orc2', tipo: 'vencimento', lida: true },
      ];
      (notificacaoService.listarTodas as jest.Mock).mockResolvedValue(notificacoes);

      await notificacaoController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(notificacoes);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (notificacaoService.listarTodas as jest.Mock).mockRejectedValue(error);

      await notificacaoController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listarNaoLidas', () => {
    it('deve retornar lista de notificações não lidas com sucesso', async () => {
      const notificacoes = [{ id: '1', orcamentoId: 'orc1', tipo: 'vencimento', lida: false }];
      (notificacaoService.listarNaoLidas as jest.Mock).mockResolvedValue(notificacoes);

      await notificacaoController.listarNaoLidas(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(notificacoes);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (notificacaoService.listarNaoLidas as jest.Mock).mockRejectedValue(error);

      await notificacaoController.listarNaoLidas(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listarProximas', () => {
    it('deve retornar lista de notificações próximas com dias padrão', async () => {
      const notificacoes = [{ id: '1', orcamentoId: 'orc1', tipo: 'vencimento', lida: false }];
      (notificacaoService.listarProximas as jest.Mock).mockResolvedValue(notificacoes);

      await notificacaoController.listarProximas(mockReq as Request, mockRes as Response, mockNext);

      expect(notificacaoService.listarProximas).toHaveBeenCalledWith(30);
      expect(jsonMock).toHaveBeenCalledWith(notificacoes);
    });

    it('deve retornar lista de notificações próximas com dias especificado', async () => {
      mockReq.query = { dias: '15' };
      const notificacoes = [{ id: '1', orcamentoId: 'orc1', tipo: 'vencimento', lida: false }];
      (notificacaoService.listarProximas as jest.Mock).mockResolvedValue(notificacoes);

      await notificacaoController.listarProximas(mockReq as Request, mockRes as Response, mockNext);

      expect(notificacaoService.listarProximas).toHaveBeenCalledWith(15);
      expect(jsonMock).toHaveBeenCalledWith(notificacoes);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (notificacaoService.listarProximas as jest.Mock).mockRejectedValue(error);

      await notificacaoController.listarProximas(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listarVencidas', () => {
    it('deve retornar lista de notificações vencidas com sucesso', async () => {
      const notificacoes = [{ id: '1', orcamentoId: 'orc1', tipo: 'vencimento', lida: false }];
      (notificacaoService.listarVencidas as jest.Mock).mockResolvedValue(notificacoes);

      await notificacaoController.listarVencidas(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(notificacoes);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (notificacaoService.listarVencidas as jest.Mock).mockRejectedValue(error);

      await notificacaoController.listarVencidas(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar notificação por ID com sucesso', async () => {
      const notificacao = { id: '1', orcamentoId: 'orc1', tipo: 'vencimento', lida: false };
      mockReq.params = { id: '1' };
      (notificacaoService.buscarPorId as jest.Mock).mockResolvedValue(notificacao);

      await notificacaoController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(notificacao);
    });

    it('deve chamar next com erro quando não encontrar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Notificação não encontrada');
      (notificacaoService.buscarPorId as jest.Mock).mockRejectedValue(error);

      await notificacaoController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('marcarComoLida', () => {
    it('deve marcar notificação como lida com sucesso', async () => {
      const notificacao = { id: '1', orcamentoId: 'orc1', tipo: 'vencimento', lida: true };
      mockReq.params = { id: '1' };
      (notificacaoService.marcarComoLida as jest.Mock).mockResolvedValue(notificacao);

      await notificacaoController.marcarComoLida(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(notificacao);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Notificação não encontrada');
      (notificacaoService.marcarComoLida as jest.Mock).mockRejectedValue(error);

      await notificacaoController.marcarComoLida(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('marcarTodasComoLidas', () => {
    it('deve marcar todas notificações como lidas com sucesso', async () => {
      (notificacaoService.marcarTodasComoLidas as jest.Mock).mockResolvedValue(5);

      await notificacaoController.marcarTodasComoLidas(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({ marcadas: 5 });
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (notificacaoService.marcarTodasComoLidas as jest.Mock).mockRejectedValue(error);

      await notificacaoController.marcarTodasComoLidas(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('excluir', () => {
    it('deve excluir notificação com sucesso', async () => {
      mockReq.params = { id: '1' };
      (notificacaoService.excluir as jest.Mock).mockResolvedValue(undefined);

      await notificacaoController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Notificação não encontrada');
      (notificacaoService.excluir as jest.Mock).mockRejectedValue(error);

      await notificacaoController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('gerarParaOrcamento', () => {
    it('deve gerar notificações para orçamento com sucesso', async () => {
      const notificacoes = [{ id: '1', orcamentoId: 'orc1', tipo: 'vencimento', lida: false }];
      mockReq.params = { orcamentoId: 'orc1' };
      (notificacaoService.gerarNotificacoesParaOrcamento as jest.Mock).mockResolvedValue(notificacoes);

      await notificacaoController.gerarParaOrcamento(mockReq as Request, mockRes as Response, mockNext);

      expect(notificacaoService.gerarNotificacoesParaOrcamento).toHaveBeenCalledWith('orc1');
      expect(jsonMock).toHaveBeenCalledWith(notificacoes);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { orcamentoId: 'inexistente' };
      const error = new Error('Orçamento não encontrado');
      (notificacaoService.gerarNotificacoesParaOrcamento as jest.Mock).mockRejectedValue(error);

      await notificacaoController.gerarParaOrcamento(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('processarTodos', () => {
    it('deve processar todos orçamentos aceitos com sucesso', async () => {
      const resultado = { processados: 10, notificacoesCriadas: 20 };
      (notificacaoService.processarTodosOrcamentosAceitos as jest.Mock).mockResolvedValue(resultado);

      await notificacaoController.processarTodos(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(resultado);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no processamento');
      (notificacaoService.processarTodosOrcamentosAceitos as jest.Mock).mockRejectedValue(error);

      await notificacaoController.processarTodos(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('obterResumo', () => {
    it('deve obter resumo com sucesso', async () => {
      const resumo = { total: 10, naoLidas: 5, vencidas: 2 };
      (notificacaoService.obterResumo as jest.Mock).mockResolvedValue(resumo);

      await notificacaoController.obterResumo(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(resumo);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (notificacaoService.obterResumo as jest.Mock).mockRejectedValue(error);

      await notificacaoController.obterResumo(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('contarNaoLidas', () => {
    it('deve contar notificações não lidas com sucesso', async () => {
      (notificacaoService.contarNaoLidas as jest.Mock).mockResolvedValue(5);

      await notificacaoController.contarNaoLidas(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({ quantidade: 5 });
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (notificacaoService.contarNaoLidas as jest.Mock).mockRejectedValue(error);

      await notificacaoController.contarNaoLidas(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
