import { Request, Response, NextFunction } from 'express';
import { servicoController } from '../../controllers/servicoController';
import { servicoService } from '../../services/servicoService';

// Mock do servicoService
jest.mock('../../services/servicoService');

describe('servicoController', () => {
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
    it('deve retornar lista de serviços com sucesso', async () => {
      const servicos = [
        { id: '1', descricao: 'Serviço 1', ativo: true, ordem: 1 },
        { id: '2', descricao: 'Serviço 2', ativo: true, ordem: 2 },
      ];
      (servicoService.listar as jest.Mock).mockResolvedValue(servicos);

      await servicoController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(servicos);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (servicoService.listar as jest.Mock).mockRejectedValue(error);

      await servicoController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listarAtivos', () => {
    it('deve retornar lista de serviços ativos com sucesso', async () => {
      const servicos = [{ id: '1', descricao: 'Serviço 1', ativo: true, ordem: 1 }];
      (servicoService.listarAtivos as jest.Mock).mockResolvedValue(servicos);

      await servicoController.listarAtivos(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(servicos);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (servicoService.listarAtivos as jest.Mock).mockRejectedValue(error);

      await servicoController.listarAtivos(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar serviço por ID com sucesso', async () => {
      const servico = { id: '1', descricao: 'Serviço 1', ativo: true, ordem: 1 };
      mockReq.params = { id: '1' };
      (servicoService.buscarPorId as jest.Mock).mockResolvedValue(servico);

      await servicoController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(servico);
    });

    it('deve chamar next com erro quando não encontrar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Serviço não encontrado');
      (servicoService.buscarPorId as jest.Mock).mockRejectedValue(error);

      await servicoController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('criar', () => {
    it('deve criar serviço com sucesso', async () => {
      const novoServico = { descricao: 'Novo Serviço de Teste', ativo: true };
      const servicoCriado = { id: '1', ...novoServico, ordem: 1 };
      mockReq.body = novoServico;
      (servicoService.criar as jest.Mock).mockResolvedValue(servicoCriado);

      await servicoController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(servicoCriado);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.body = { descricao: 'curto' };
      const error = new Error('Descrição muito curta');
      (servicoService.criar as jest.Mock).mockRejectedValue(error);

      await servicoController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar serviço com sucesso', async () => {
      const dadosAtualizacao = { descricao: 'Serviço Atualizado com Descrição' };
      const servicoAtualizado = { id: '1', descricao: 'Serviço Atualizado com Descrição', ativo: true, ordem: 1 };
      mockReq.params = { id: '1' };
      mockReq.body = dadosAtualizacao;
      (servicoService.atualizar as jest.Mock).mockResolvedValue(servicoAtualizado);

      await servicoController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(servicoAtualizado);
    });

    it('deve atualizar apenas ativo com sucesso', async () => {
      const dadosAtualizacao = { ativo: false };
      const servicoAtualizado = { id: '1', descricao: 'Serviço 1', ativo: false, ordem: 1 };
      mockReq.params = { id: '1' };
      mockReq.body = dadosAtualizacao;
      (servicoService.atualizar as jest.Mock).mockResolvedValue(servicoAtualizado);

      await servicoController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(servicoService.atualizar).toHaveBeenCalledWith('1', { descricao: undefined, ativo: false, ordem: undefined });
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      mockReq.body = { descricao: 'Serviço Atualizado' };
      const error = new Error('Serviço não encontrado');
      (servicoService.atualizar as jest.Mock).mockRejectedValue(error);

      await servicoController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('excluir', () => {
    it('deve excluir serviço com sucesso', async () => {
      mockReq.params = { id: '1' };
      (servicoService.excluir as jest.Mock).mockResolvedValue(undefined);

      await servicoController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Serviço não encontrado');
      (servicoService.excluir as jest.Mock).mockRejectedValue(error);

      await servicoController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar status ativo com sucesso', async () => {
      const servicoAlternado = { id: '1', descricao: 'Serviço 1', ativo: false, ordem: 1 };
      mockReq.params = { id: '1' };
      (servicoService.toggleAtivo as jest.Mock).mockResolvedValue(servicoAlternado);

      await servicoController.toggleAtivo(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(servicoAlternado);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Serviço não encontrado');
      (servicoService.toggleAtivo as jest.Mock).mockRejectedValue(error);

      await servicoController.toggleAtivo(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
