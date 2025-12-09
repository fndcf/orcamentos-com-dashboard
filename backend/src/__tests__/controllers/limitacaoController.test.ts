import { Request, Response, NextFunction } from 'express';
import { limitacaoController } from '../../controllers/limitacaoController';
import { limitacaoService } from '../../services/limitacaoService';

// Mock do limitacaoService
jest.mock('../../services/limitacaoService');

describe('limitacaoController', () => {
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
    it('deve retornar lista de limitações com sucesso', async () => {
      const limitacoes = [
        { id: '1', texto: 'Limitação 1 com texto suficiente', ativo: true, ordem: 1 },
        { id: '2', texto: 'Limitação 2 com texto suficiente', ativo: true, ordem: 2 },
      ];
      (limitacaoService.listar as jest.Mock).mockResolvedValue(limitacoes);

      await limitacaoController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(limitacoes);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (limitacaoService.listar as jest.Mock).mockRejectedValue(error);

      await limitacaoController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listarAtivas', () => {
    it('deve retornar lista de limitações ativas com sucesso', async () => {
      const limitacoes = [{ id: '1', texto: 'Limitação 1 com texto suficiente', ativo: true, ordem: 1 }];
      (limitacaoService.listarAtivas as jest.Mock).mockResolvedValue(limitacoes);

      await limitacaoController.listarAtivas(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(limitacoes);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (limitacaoService.listarAtivas as jest.Mock).mockRejectedValue(error);

      await limitacaoController.listarAtivas(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar limitação por ID com sucesso', async () => {
      const limitacao = { id: '1', texto: 'Limitação 1 com texto suficiente', ativo: true, ordem: 1 };
      mockReq.params = { id: '1' };
      (limitacaoService.buscarPorId as jest.Mock).mockResolvedValue(limitacao);

      await limitacaoController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(limitacao);
    });

    it('deve chamar next com erro quando não encontrar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Limitação não encontrada');
      (limitacaoService.buscarPorId as jest.Mock).mockRejectedValue(error);

      await limitacaoController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('criar', () => {
    it('deve criar limitação com sucesso', async () => {
      const novaLimitacao = { texto: 'Nova Limitação com pelo menos 20 caracteres para validação', ativo: true };
      const limitacaoCriada = { id: '1', ...novaLimitacao, ordem: 1 };
      mockReq.body = novaLimitacao;
      (limitacaoService.criar as jest.Mock).mockResolvedValue(limitacaoCriada);

      await limitacaoController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(limitacaoCriada);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.body = { texto: 'curto' };
      const error = new Error('Texto muito curto');
      (limitacaoService.criar as jest.Mock).mockRejectedValue(error);

      await limitacaoController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar limitação com sucesso', async () => {
      const dadosAtualizacao = { texto: 'Limitação Atualizada com texto suficiente para validação' };
      const limitacaoAtualizada = {
        id: '1',
        texto: 'Limitação Atualizada com texto suficiente para validação',
        ativo: true,
        ordem: 1,
      };
      mockReq.params = { id: '1' };
      mockReq.body = dadosAtualizacao;
      (limitacaoService.atualizar as jest.Mock).mockResolvedValue(limitacaoAtualizada);

      await limitacaoController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(limitacaoAtualizada);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      mockReq.body = { texto: 'Limitação Atualizada' };
      const error = new Error('Limitação não encontrada');
      (limitacaoService.atualizar as jest.Mock).mockRejectedValue(error);

      await limitacaoController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('excluir', () => {
    it('deve excluir limitação com sucesso', async () => {
      mockReq.params = { id: '1' };
      (limitacaoService.excluir as jest.Mock).mockResolvedValue(undefined);

      await limitacaoController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Limitação não encontrada');
      (limitacaoService.excluir as jest.Mock).mockRejectedValue(error);

      await limitacaoController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar status ativo com sucesso', async () => {
      const limitacaoAlternada = { id: '1', texto: 'Limitação 1 com texto suficiente', ativo: false, ordem: 1 };
      mockReq.params = { id: '1' };
      (limitacaoService.toggleAtivo as jest.Mock).mockResolvedValue(limitacaoAlternada);

      await limitacaoController.toggleAtivo(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(limitacaoAlternada);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Limitação não encontrada');
      (limitacaoService.toggleAtivo as jest.Mock).mockRejectedValue(error);

      await limitacaoController.toggleAtivo(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
