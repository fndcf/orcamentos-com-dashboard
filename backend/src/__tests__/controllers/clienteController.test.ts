import { Request, Response, NextFunction } from 'express';
import { clienteController } from '../../controllers/clienteController';
import { clienteService } from '../../services/clienteService';

// Mock do clienteService
jest.mock('../../services/clienteService');

describe('clienteController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockReq = {
      params: {},
      query: {},
      body: {},
    };

    mockRes = {
      json: jsonMock,
      status: statusMock,
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('listar', () => {
    it('deve retornar lista de clientes com sucesso', async () => {
      const clientes = [
        { id: '1', razaoSocial: 'Cliente 1', cnpj: '12345678901234' },
        { id: '2', razaoSocial: 'Cliente 2', cnpj: '98765432109876' },
      ];
      (clienteService.listar as jest.Mock).mockResolvedValue(clientes);

      await clienteController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: clientes,
      });
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (clienteService.listar as jest.Mock).mockRejectedValue(error);

      await clienteController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listarPaginado', () => {
    it('deve retornar lista paginada de clientes com parâmetros padrão', async () => {
      const result = {
        items: [
          { id: '1', razaoSocial: 'Cliente 1', cnpj: '12345678901234' },
          { id: '2', razaoSocial: 'Cliente 2', cnpj: '98765432109876' },
        ],
        total: 2,
        page: 1,
        totalPages: 1,
      };
      mockReq.query = {};
      (clienteService.listarPaginado as jest.Mock).mockResolvedValue(result);

      await clienteController.listarPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(clienteService.listarPaginado).toHaveBeenCalledWith(1, 10, { busca: undefined });
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
    });

    it('deve retornar lista paginada com parâmetros personalizados', async () => {
      const result = {
        items: [{ id: '1', razaoSocial: 'Cliente Teste', cnpj: '12345678901234' }],
        total: 1,
        page: 2,
        totalPages: 5,
      };
      mockReq.query = { page: '2', limit: '5', busca: 'teste' };
      (clienteService.listarPaginado as jest.Mock).mockResolvedValue(result);

      await clienteController.listarPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(clienteService.listarPaginado).toHaveBeenCalledWith(2, 5, { busca: 'teste' });
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.query = {};
      const error = new Error('Erro no banco');
      (clienteService.listarPaginado as jest.Mock).mockRejectedValue(error);

      await clienteController.listarPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar cliente por ID com sucesso', async () => {
      const cliente = { id: '1', razaoSocial: 'Cliente 1', cnpj: '12345678901234' };
      mockReq.params = { id: '1' };
      (clienteService.buscarPorId as jest.Mock).mockResolvedValue(cliente);

      await clienteController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: cliente,
      });
    });

    it('deve chamar next com erro quando não encontrar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Cliente não encontrado');
      (clienteService.buscarPorId as jest.Mock).mockRejectedValue(error);

      await clienteController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('buscarPorDocumento', () => {
    it('deve retornar cliente por documento com sucesso', async () => {
      const cliente = { id: '1', razaoSocial: 'Cliente 1', cnpj: '12345678901234' };
      mockReq.params = { documento: '12345678901234' };
      (clienteService.buscarPorDocumento as jest.Mock).mockResolvedValue(cliente);

      await clienteController.buscarPorDocumento(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: cliente,
      });
    });

    it('deve retornar null quando não encontrar', async () => {
      mockReq.params = { documento: '00000000000000' };
      (clienteService.buscarPorDocumento as jest.Mock).mockResolvedValue(null);

      await clienteController.buscarPorDocumento(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: null,
      });
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { documento: '12345678901234' };
      const error = new Error('Erro no banco');
      (clienteService.buscarPorDocumento as jest.Mock).mockRejectedValue(error);

      await clienteController.buscarPorDocumento(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('pesquisar', () => {
    it('deve retornar clientes pesquisados com sucesso', async () => {
      const clientes = [{ id: '1', razaoSocial: 'Cliente Teste', cnpj: '12345678901234' }];
      mockReq.query = { termo: 'teste' };
      (clienteService.pesquisar as jest.Mock).mockResolvedValue(clientes);

      await clienteController.pesquisar(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: clientes,
      });
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.query = { termo: 'teste' };
      const error = new Error('Erro na pesquisa');
      (clienteService.pesquisar as jest.Mock).mockRejectedValue(error);

      await clienteController.pesquisar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('criar', () => {
    it('deve criar cliente com sucesso', async () => {
      const novoCliente = { razaoSocial: 'Novo Cliente', cnpj: '12345678901234' };
      const clienteCriado = { id: '1', ...novoCliente };
      mockReq.body = novoCliente;
      (clienteService.criar as jest.Mock).mockResolvedValue(clienteCriado);

      await clienteController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: clienteCriado,
      });
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.body = { razaoSocial: 'AB', cnpj: '123' };
      const error = new Error('Dados inválidos');
      (clienteService.criar as jest.Mock).mockRejectedValue(error);

      await clienteController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar cliente com sucesso', async () => {
      const dadosAtualizacao = { razaoSocial: 'Cliente Atualizado' };
      const clienteAtualizado = { id: '1', razaoSocial: 'Cliente Atualizado', cnpj: '12345678901234' };
      mockReq.params = { id: '1' };
      mockReq.body = dadosAtualizacao;
      (clienteService.atualizar as jest.Mock).mockResolvedValue(clienteAtualizado);

      await clienteController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: clienteAtualizado,
      });
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      mockReq.body = { razaoSocial: 'Cliente Atualizado' };
      const error = new Error('Cliente não encontrado');
      (clienteService.atualizar as jest.Mock).mockRejectedValue(error);

      await clienteController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('excluir', () => {
    it('deve excluir cliente com sucesso', async () => {
      mockReq.params = { id: '1' };
      (clienteService.excluir as jest.Mock).mockResolvedValue(undefined);

      await clienteController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Cliente excluído com sucesso',
      });
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Cliente não encontrado');
      (clienteService.excluir as jest.Mock).mockRejectedValue(error);

      await clienteController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
