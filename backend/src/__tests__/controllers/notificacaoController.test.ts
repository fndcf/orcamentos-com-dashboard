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

  describe('listarPaginado', () => {
    const mockPaginatedResponse = {
      items: [{ id: '1', orcamentoId: 'orc1', tipo: 'vencimento', lida: false }],
      total: 50,
      hasMore: true,
      cursor: 'cGFnaW5hZG9DdXJzb3I=',
    };

    it('deve retornar notificações paginadas com valores padrão', async () => {
      (notificacaoService.listarTodasPaginado as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      await notificacaoController.listarPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(notificacaoService.listarTodasPaginado).toHaveBeenCalledWith(10, undefined);
      expect(jsonMock).toHaveBeenCalledWith(mockPaginatedResponse);
    });

    it('deve retornar notificações paginadas com parâmetros', async () => {
      mockReq.query = { pageSize: '20', cursor: 'myCursor' };
      (notificacaoService.listarTodasPaginado as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      await notificacaoController.listarPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(notificacaoService.listarTodasPaginado).toHaveBeenCalledWith(20, 'myCursor');
      expect(jsonMock).toHaveBeenCalledWith(mockPaginatedResponse);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (notificacaoService.listarTodasPaginado as jest.Mock).mockRejectedValue(error);

      await notificacaoController.listarPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listarNaoLidasPaginado', () => {
    const mockPaginatedResponse = {
      items: [{ id: '1', orcamentoId: 'orc1', tipo: 'vencimento', lida: false }],
      total: 30,
      hasMore: true,
      cursor: 'bmFvTGlkYXNDdXJzb3I=',
    };

    it('deve retornar notificações não lidas paginadas com valores padrão', async () => {
      (notificacaoService.listarNaoLidasPaginado as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      await notificacaoController.listarNaoLidasPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(notificacaoService.listarNaoLidasPaginado).toHaveBeenCalledWith(10, undefined);
      expect(jsonMock).toHaveBeenCalledWith(mockPaginatedResponse);
    });

    it('deve retornar notificações não lidas paginadas com parâmetros', async () => {
      mockReq.query = { pageSize: '15', cursor: 'myCursor' };
      (notificacaoService.listarNaoLidasPaginado as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      await notificacaoController.listarNaoLidasPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(notificacaoService.listarNaoLidasPaginado).toHaveBeenCalledWith(15, 'myCursor');
      expect(jsonMock).toHaveBeenCalledWith(mockPaginatedResponse);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (notificacaoService.listarNaoLidasPaginado as jest.Mock).mockRejectedValue(error);

      await notificacaoController.listarNaoLidasPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listarVencidasPaginado', () => {
    const mockPaginatedResponse = {
      items: [{ id: '1', orcamentoId: 'orc1', tipo: 'vencimento', lida: false }],
      total: 15,
      hasMore: false,
      cursor: undefined,
    };

    it('deve retornar notificações vencidas paginadas com valores padrão', async () => {
      (notificacaoService.listarVencidasPaginado as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      await notificacaoController.listarVencidasPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(notificacaoService.listarVencidasPaginado).toHaveBeenCalledWith(10, undefined);
      expect(jsonMock).toHaveBeenCalledWith(mockPaginatedResponse);
    });

    it('deve retornar notificações vencidas paginadas com parâmetros', async () => {
      mockReq.query = { pageSize: '25', cursor: 'myCursor' };
      (notificacaoService.listarVencidasPaginado as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      await notificacaoController.listarVencidasPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(notificacaoService.listarVencidasPaginado).toHaveBeenCalledWith(25, 'myCursor');
      expect(jsonMock).toHaveBeenCalledWith(mockPaginatedResponse);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (notificacaoService.listarVencidasPaginado as jest.Mock).mockRejectedValue(error);

      await notificacaoController.listarVencidasPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listarAtivasPaginado', () => {
    const mockPaginatedResponse = {
      items: [{ id: '1', orcamentoId: 'orc1', tipo: 'vencimento', lida: false }],
      total: 40,
      hasMore: true,
      cursor: 'YXRpdmFzQ3Vyc29y',
    };

    it('deve retornar notificações ativas paginadas com valores padrão', async () => {
      (notificacaoService.listarAtivasPaginado as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      await notificacaoController.listarAtivasPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(notificacaoService.listarAtivasPaginado).toHaveBeenCalledWith(60, 10, undefined);
      expect(jsonMock).toHaveBeenCalledWith(mockPaginatedResponse);
    });

    it('deve retornar notificações ativas paginadas com parâmetros', async () => {
      mockReq.query = { dias: '45', pageSize: '30', cursor: 'myCursor' };
      (notificacaoService.listarAtivasPaginado as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      await notificacaoController.listarAtivasPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(notificacaoService.listarAtivasPaginado).toHaveBeenCalledWith(45, 30, 'myCursor');
      expect(jsonMock).toHaveBeenCalledWith(mockPaginatedResponse);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (notificacaoService.listarAtivasPaginado as jest.Mock).mockRejectedValue(error);

      await notificacaoController.listarAtivasPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listarProximasPaginado', () => {
    const mockPaginatedResponse = {
      items: [{ id: '1', orcamentoId: 'orc1', tipo: 'vencimento', lida: false }],
      total: 22,
      hasMore: true,
      cursor: 'cHJveGltYXNDdXJzb3I=',
    };

    it('deve retornar notificações próximas paginadas com valores padrão', async () => {
      (notificacaoService.listarProximasPaginado as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      await notificacaoController.listarProximasPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(notificacaoService.listarProximasPaginado).toHaveBeenCalledWith(30, 10, undefined);
      expect(jsonMock).toHaveBeenCalledWith(mockPaginatedResponse);
    });

    it('deve retornar notificações próximas paginadas com parâmetros', async () => {
      mockReq.query = { dias: '15', pageSize: '20', cursor: 'myCursor' };
      (notificacaoService.listarProximasPaginado as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      await notificacaoController.listarProximasPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(notificacaoService.listarProximasPaginado).toHaveBeenCalledWith(15, 20, 'myCursor');
      expect(jsonMock).toHaveBeenCalledWith(mockPaginatedResponse);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (notificacaoService.listarProximasPaginado as jest.Mock).mockRejectedValue(error);

      await notificacaoController.listarProximasPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
