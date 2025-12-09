import { Request, Response, NextFunction } from 'express';
import { palavraChaveController } from '../../controllers/palavraChaveController';
import { palavraChaveService } from '../../services/palavraChaveService';

// Mock do palavraChaveService
jest.mock('../../services/palavraChaveService');

describe('palavraChaveController', () => {
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

  const mockPalavraChave = {
    id: '1',
    palavra: 'extintor',
    prazoDias: 345,
    ativo: true,
    createdAt: new Date(),
  };

  describe('listar', () => {
    it('deve retornar lista de palavras-chave com sucesso', async () => {
      const palavras = [mockPalavraChave, { ...mockPalavraChave, id: '2', palavra: 'mangueira' }];
      (palavraChaveService.listar as jest.Mock).mockResolvedValue(palavras);

      await palavraChaveController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(palavras);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (palavraChaveService.listar as jest.Mock).mockRejectedValue(error);

      await palavraChaveController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listarAtivas', () => {
    it('deve retornar lista de palavras-chave ativas com sucesso', async () => {
      const palavrasAtivas = [mockPalavraChave];
      (palavraChaveService.listarAtivas as jest.Mock).mockResolvedValue(palavrasAtivas);

      await palavraChaveController.listarAtivas(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(palavrasAtivas);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (palavraChaveService.listarAtivas as jest.Mock).mockRejectedValue(error);

      await palavraChaveController.listarAtivas(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar palavra-chave por ID com sucesso', async () => {
      mockReq.params = { id: '1' };
      (palavraChaveService.buscarPorId as jest.Mock).mockResolvedValue(mockPalavraChave);

      await palavraChaveController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(palavraChaveService.buscarPorId).toHaveBeenCalledWith('1');
      expect(jsonMock).toHaveBeenCalledWith(mockPalavraChave);
    });

    it('deve chamar next com erro quando não encontrar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Palavra-chave não encontrada');
      (palavraChaveService.buscarPorId as jest.Mock).mockRejectedValue(error);

      await palavraChaveController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('criar', () => {
    it('deve criar palavra-chave com sucesso', async () => {
      const novaPalavra = { palavra: 'extintor', prazoDias: 345 };
      mockReq.body = novaPalavra;
      (palavraChaveService.criar as jest.Mock).mockResolvedValue(mockPalavraChave);

      await palavraChaveController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(palavraChaveService.criar).toHaveBeenCalledWith(novaPalavra);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockPalavraChave);
    });

    it('deve criar palavra-chave com ativo=false', async () => {
      const novaPalavra = { palavra: 'extintor', prazoDias: 345, ativo: false };
      mockReq.body = novaPalavra;
      (palavraChaveService.criar as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        ativo: false,
      });

      await palavraChaveController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(palavraChaveService.criar).toHaveBeenCalledWith(novaPalavra);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.body = { palavra: 'a', prazoDias: 345 };
      const error = new Error('Dados inválidos');
      (palavraChaveService.criar as jest.Mock).mockRejectedValue(error);

      await palavraChaveController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar palavra-chave com sucesso', async () => {
      const dadosAtualizacao = { palavra: 'extintor atualizado', prazoDias: 400 };
      mockReq.params = { id: '1' };
      mockReq.body = dadosAtualizacao;
      (palavraChaveService.atualizar as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        ...dadosAtualizacao,
      });

      await palavraChaveController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(palavraChaveService.atualizar).toHaveBeenCalledWith('1', dadosAtualizacao);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining(dadosAtualizacao));
    });

    it('deve atualizar apenas ativo', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { ativo: false };
      (palavraChaveService.atualizar as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        ativo: false,
      });

      await palavraChaveController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(palavraChaveService.atualizar).toHaveBeenCalledWith('1', { ativo: false });
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      mockReq.body = { palavra: 'teste' };
      const error = new Error('Palavra-chave não encontrada');
      (palavraChaveService.atualizar as jest.Mock).mockRejectedValue(error);

      await palavraChaveController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('excluir', () => {
    it('deve excluir palavra-chave com sucesso', async () => {
      mockReq.params = { id: '1' };
      (palavraChaveService.excluir as jest.Mock).mockResolvedValue(undefined);

      await palavraChaveController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(palavraChaveService.excluir).toHaveBeenCalledWith('1');
      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Palavra-chave não encontrada');
      (palavraChaveService.excluir as jest.Mock).mockRejectedValue(error);

      await palavraChaveController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar status de ativo para inativo', async () => {
      mockReq.params = { id: '1' };
      (palavraChaveService.toggleAtivo as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        ativo: false,
      });

      await palavraChaveController.toggleAtivo(mockReq as Request, mockRes as Response, mockNext);

      expect(palavraChaveService.toggleAtivo).toHaveBeenCalledWith('1');
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ ativo: false }));
    });

    it('deve alternar status de inativo para ativo', async () => {
      mockReq.params = { id: '1' };
      (palavraChaveService.toggleAtivo as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        ativo: true,
      });

      await palavraChaveController.toggleAtivo(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ ativo: true }));
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Palavra-chave não encontrada');
      (palavraChaveService.toggleAtivo as jest.Mock).mockRejectedValue(error);

      await palavraChaveController.toggleAtivo(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
