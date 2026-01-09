import { Request, Response, NextFunction } from 'express';
import { itemServicoController } from '../../controllers/itemServicoController';
import { itemServicoService } from '../../services/itemServicoService';

// Mock do itemServicoService
jest.mock('../../services/itemServicoService');

describe('itemServicoController', () => {
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
    it('deve retornar lista de itens com sucesso', async () => {
      const itens = [
        { id: '1', categoriaId: 'cat1', descricao: 'Item 1', unidade: 'UN', ativo: true, ordem: 1 },
        { id: '2', categoriaId: 'cat1', descricao: 'Item 2', unidade: 'UN', ativo: true, ordem: 2 },
      ];
      (itemServicoService.listar as jest.Mock).mockResolvedValue(itens);

      await itemServicoController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(itens);
    });

    it('deve chamar next com erro quando falhar', async () => {
      const error = new Error('Erro no banco');
      (itemServicoService.listar as jest.Mock).mockRejectedValue(error);

      await itemServicoController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listarPorCategoria', () => {
    it('deve retornar lista de itens por categoria com sucesso', async () => {
      const itens = [{ id: '1', categoriaId: 'cat1', descricao: 'Item 1', unidade: 'UN', ativo: true, ordem: 1 }];
      mockReq.params = { categoriaId: 'cat1' };
      (itemServicoService.listarPorCategoria as jest.Mock).mockResolvedValue(itens);

      await itemServicoController.listarPorCategoria(mockReq as Request, mockRes as Response, mockNext);

      expect(itemServicoService.listarPorCategoria).toHaveBeenCalledWith('cat1');
      expect(jsonMock).toHaveBeenCalledWith(itens);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { categoriaId: 'cat1' };
      const error = new Error('Categoria não encontrada');
      (itemServicoService.listarPorCategoria as jest.Mock).mockRejectedValue(error);

      await itemServicoController.listarPorCategoria(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listarAtivosPorCategoria', () => {
    it('deve retornar lista de itens ativos por categoria com sucesso', async () => {
      const itens = [{ id: '1', categoriaId: 'cat1', descricao: 'Item 1', unidade: 'UN', ativo: true, ordem: 1 }];
      mockReq.params = { categoriaId: 'cat1' };
      (itemServicoService.listarAtivosPorCategoria as jest.Mock).mockResolvedValue(itens);

      await itemServicoController.listarAtivosPorCategoria(mockReq as Request, mockRes as Response, mockNext);

      expect(itemServicoService.listarAtivosPorCategoria).toHaveBeenCalledWith('cat1');
      expect(jsonMock).toHaveBeenCalledWith(itens);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { categoriaId: 'cat1' };
      const error = new Error('Erro no banco');
      (itemServicoService.listarAtivosPorCategoria as jest.Mock).mockRejectedValue(error);

      await itemServicoController.listarAtivosPorCategoria(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listarAtivosPorCategoriaPaginado', () => {
    it('deve retornar lista paginada de itens ativos com parâmetros padrão', async () => {
      const result = {
        itens: [{ id: '1', categoriaId: 'cat1', descricao: 'Item 1', unidade: 'UN', ativo: true, ordem: 1 }],
        total: 1,
        nextCursor: null,
      };
      mockReq.params = { categoriaId: 'cat1' };
      mockReq.query = {};
      (itemServicoService.listarAtivosPorCategoriaPaginado as jest.Mock).mockResolvedValue(result);

      await itemServicoController.listarAtivosPorCategoriaPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(itemServicoService.listarAtivosPorCategoriaPaginado).toHaveBeenCalledWith('cat1', 10, undefined, undefined);
      expect(jsonMock).toHaveBeenCalledWith(result);
    });

    it('deve retornar lista paginada com parâmetros personalizados', async () => {
      const result = {
        itens: [{ id: '2', categoriaId: 'cat1', descricao: 'Item 2', unidade: 'UN', ativo: true, ordem: 2 }],
        total: 5,
        nextCursor: 'cursor123',
      };
      mockReq.params = { categoriaId: 'cat1' };
      mockReq.query = { limit: '5', cursor: 'cursor-abc', search: 'teste' };
      (itemServicoService.listarAtivosPorCategoriaPaginado as jest.Mock).mockResolvedValue(result);

      await itemServicoController.listarAtivosPorCategoriaPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(itemServicoService.listarAtivosPorCategoriaPaginado).toHaveBeenCalledWith('cat1', 5, 'cursor-abc', 'teste');
      expect(jsonMock).toHaveBeenCalledWith(result);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { categoriaId: 'cat1' };
      mockReq.query = {};
      const error = new Error('Erro no banco');
      (itemServicoService.listarAtivosPorCategoriaPaginado as jest.Mock).mockRejectedValue(error);

      await itemServicoController.listarAtivosPorCategoriaPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listarPorCategoriaPaginado', () => {
    it('deve retornar lista paginada de itens com parâmetros padrão', async () => {
      const result = {
        itens: [
          { id: '1', categoriaId: 'cat1', descricao: 'Item 1', unidade: 'UN', ativo: true, ordem: 1 },
          { id: '2', categoriaId: 'cat1', descricao: 'Item 2', unidade: 'UN', ativo: false, ordem: 2 },
        ],
        total: 2,
        nextCursor: null,
      };
      mockReq.params = { categoriaId: 'cat1' };
      mockReq.query = {};
      (itemServicoService.listarPorCategoriaPaginado as jest.Mock).mockResolvedValue(result);

      await itemServicoController.listarPorCategoriaPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(itemServicoService.listarPorCategoriaPaginado).toHaveBeenCalledWith('cat1', 10, undefined, undefined);
      expect(jsonMock).toHaveBeenCalledWith(result);
    });

    it('deve retornar lista paginada com parâmetros personalizados', async () => {
      const result = {
        itens: [{ id: '3', categoriaId: 'cat1', descricao: 'Item 3', unidade: 'M2', ativo: true, ordem: 3 }],
        total: 10,
        nextCursor: 'next-cursor',
      };
      mockReq.params = { categoriaId: 'cat1' };
      mockReq.query = { limit: '20', cursor: 'prev-cursor', search: 'busca' };
      (itemServicoService.listarPorCategoriaPaginado as jest.Mock).mockResolvedValue(result);

      await itemServicoController.listarPorCategoriaPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(itemServicoService.listarPorCategoriaPaginado).toHaveBeenCalledWith('cat1', 20, 'prev-cursor', 'busca');
      expect(jsonMock).toHaveBeenCalledWith(result);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { categoriaId: 'cat1' };
      mockReq.query = {};
      const error = new Error('Erro no banco');
      (itemServicoService.listarPorCategoriaPaginado as jest.Mock).mockRejectedValue(error);

      await itemServicoController.listarPorCategoriaPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar item por ID com sucesso', async () => {
      const item = { id: '1', categoriaId: 'cat1', descricao: 'Item 1', unidade: 'UN', ativo: true, ordem: 1 };
      mockReq.params = { id: '1' };
      (itemServicoService.buscarPorId as jest.Mock).mockResolvedValue(item);

      await itemServicoController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(item);
    });

    it('deve chamar next com erro quando não encontrar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Item não encontrado');
      (itemServicoService.buscarPorId as jest.Mock).mockRejectedValue(error);

      await itemServicoController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('criar', () => {
    it('deve criar item com sucesso', async () => {
      const novoItem = { categoriaId: 'cat1', descricao: 'Novo Item', unidade: 'UN', ativo: true };
      const itemCriado = { id: '1', ...novoItem, ordem: 1 };
      mockReq.body = novoItem;
      (itemServicoService.criar as jest.Mock).mockResolvedValue(itemCriado);

      await itemServicoController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(itemCriado);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.body = { categoriaId: 'cat1', descricao: 'AB', unidade: 'UN' };
      const error = new Error('Descrição muito curta');
      (itemServicoService.criar as jest.Mock).mockRejectedValue(error);

      await itemServicoController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar item com sucesso', async () => {
      const dadosAtualizacao = { descricao: 'Item Atualizado' };
      const itemAtualizado = {
        id: '1',
        categoriaId: 'cat1',
        descricao: 'Item Atualizado',
        unidade: 'UN',
        ativo: true,
        ordem: 1,
      };
      mockReq.params = { id: '1' };
      mockReq.body = dadosAtualizacao;
      (itemServicoService.atualizar as jest.Mock).mockResolvedValue(itemAtualizado);

      await itemServicoController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(itemAtualizado);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      mockReq.body = { descricao: 'Item Atualizado' };
      const error = new Error('Item não encontrado');
      (itemServicoService.atualizar as jest.Mock).mockRejectedValue(error);

      await itemServicoController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('excluir', () => {
    it('deve excluir item com sucesso', async () => {
      mockReq.params = { id: '1' };
      (itemServicoService.excluir as jest.Mock).mockResolvedValue(undefined);

      await itemServicoController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Item não encontrado');
      (itemServicoService.excluir as jest.Mock).mockRejectedValue(error);

      await itemServicoController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar status ativo com sucesso', async () => {
      const itemAlternado = {
        id: '1',
        categoriaId: 'cat1',
        descricao: 'Item 1',
        unidade: 'UN',
        ativo: false,
        ordem: 1,
      };
      mockReq.params = { id: '1' };
      (itemServicoService.toggleAtivo as jest.Mock).mockResolvedValue(itemAlternado);

      await itemServicoController.toggleAtivo(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(itemAlternado);
    });

    it('deve chamar next com erro quando falhar', async () => {
      mockReq.params = { id: 'inexistente' };
      const error = new Error('Item não encontrado');
      (itemServicoService.toggleAtivo as jest.Mock).mockRejectedValue(error);

      await itemServicoController.toggleAtivo(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
