import { Request, Response, NextFunction } from 'express';
import { orcamentoController } from '../../controllers/orcamentoController';
import { orcamentoService } from '../../services/orcamentoService';

// Mock do service
jest.mock('../../services/orcamentoService', () => ({
  orcamentoService: {
    listar: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorCliente: jest.fn(),
    buscarPorStatus: jest.fn(),
    criar: jest.fn(),
    atualizar: jest.fn(),
    atualizarStatus: jest.fn(),
    excluir: jest.fn(),
    duplicar: jest.fn(),
    getEstatisticas: jest.fn(),
    verificarExpirados: jest.fn(),
  },
}));

describe('orcamentoController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  const mockOrcamento = {
    id: 'o1',
    numero: 1,
    clienteId: 'c1',
    clienteNome: 'Cliente Teste',
    status: 'aberto',
    valorTotal: 1000,
    itens: [{ descricao: 'Item 1', quantidade: 1, valorUnitario: 1000, valorTotal: 1000 }],
  };

  beforeEach(() => {
    mockReq = {
      params: {},
      body: {},
    };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('listar', () => {
    it('deve listar todos os orçamentos', async () => {
      const orcamentos = [mockOrcamento];
      (orcamentoService.listar as jest.Mock).mockResolvedValue(orcamentos);

      await orcamentoController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.listar).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: orcamentos });
    });

    it('deve chamar next em caso de erro', async () => {
      const error = new Error('Erro ao listar');
      (orcamentoService.listar as jest.Mock).mockRejectedValue(error);

      await orcamentoController.listar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar orçamento por ID', async () => {
      mockReq.params = { id: 'o1' };
      (orcamentoService.buscarPorId as jest.Mock).mockResolvedValue(mockOrcamento);

      await orcamentoController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.buscarPorId).toHaveBeenCalledWith('o1');
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockOrcamento });
    });

    it('deve chamar next em caso de erro', async () => {
      mockReq.params = { id: 'o1' };
      const error = new Error('Orçamento não encontrado');
      (orcamentoService.buscarPorId as jest.Mock).mockRejectedValue(error);

      await orcamentoController.buscarPorId(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('buscarPorCliente', () => {
    it('deve buscar orçamentos por cliente', async () => {
      mockReq.params = { clienteId: 'c1' };
      const orcamentos = [mockOrcamento];
      (orcamentoService.buscarPorCliente as jest.Mock).mockResolvedValue(orcamentos);

      await orcamentoController.buscarPorCliente(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.buscarPorCliente).toHaveBeenCalledWith('c1');
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: orcamentos });
    });

    it('deve chamar next em caso de erro', async () => {
      mockReq.params = { clienteId: 'c1' };
      const error = new Error('Erro ao buscar');
      (orcamentoService.buscarPorCliente as jest.Mock).mockRejectedValue(error);

      await orcamentoController.buscarPorCliente(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('buscarPorStatus', () => {
    it('deve buscar orçamentos por status', async () => {
      mockReq.params = { status: 'aberto' };
      const orcamentos = [mockOrcamento];
      (orcamentoService.buscarPorStatus as jest.Mock).mockResolvedValue(orcamentos);

      await orcamentoController.buscarPorStatus(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.buscarPorStatus).toHaveBeenCalledWith('aberto');
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: orcamentos });
    });

    it('deve chamar next em caso de erro', async () => {
      mockReq.params = { status: 'aberto' };
      const error = new Error('Erro ao buscar');
      (orcamentoService.buscarPorStatus as jest.Mock).mockRejectedValue(error);

      await orcamentoController.buscarPorStatus(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('criar', () => {
    it('deve criar um novo orçamento', async () => {
      mockReq.body = {
        clienteId: 'c1',
        itens: [{ descricao: 'Item 1', quantidade: 1, valorUnitario: 1000 }],
      };
      (orcamentoService.criar as jest.Mock).mockResolvedValue(mockOrcamento);

      await orcamentoController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.criar).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockOrcamento });
    });

    it('deve chamar next em caso de erro', async () => {
      mockReq.body = { clienteId: 'c1' };
      const error = new Error('Erro ao criar');
      (orcamentoService.criar as jest.Mock).mockRejectedValue(error);

      await orcamentoController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar um orçamento', async () => {
      mockReq.params = { id: 'o1' };
      mockReq.body = { observacoes: 'Nova observação' };
      const orcamentoAtualizado = { ...mockOrcamento, observacoes: 'Nova observação' };
      (orcamentoService.atualizar as jest.Mock).mockResolvedValue(orcamentoAtualizado);

      await orcamentoController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.atualizar).toHaveBeenCalledWith('o1', mockReq.body);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: orcamentoAtualizado });
    });

    it('deve chamar next em caso de erro', async () => {
      mockReq.params = { id: 'o1' };
      mockReq.body = { observacoes: 'Nova observação' };
      const error = new Error('Erro ao atualizar');
      (orcamentoService.atualizar as jest.Mock).mockRejectedValue(error);

      await orcamentoController.atualizar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('atualizarStatus', () => {
    it('deve atualizar o status de um orçamento', async () => {
      mockReq.params = { id: 'o1' };
      mockReq.body = { status: 'aceito' };
      const orcamentoAtualizado = { ...mockOrcamento, status: 'aceito' };
      (orcamentoService.atualizarStatus as jest.Mock).mockResolvedValue(orcamentoAtualizado);

      await orcamentoController.atualizarStatus(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.atualizarStatus).toHaveBeenCalledWith('o1', 'aceito');
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: orcamentoAtualizado });
    });

    it('deve chamar next em caso de erro', async () => {
      mockReq.params = { id: 'o1' };
      mockReq.body = { status: 'aceito' };
      const error = new Error('Transição inválida');
      (orcamentoService.atualizarStatus as jest.Mock).mockRejectedValue(error);

      await orcamentoController.atualizarStatus(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('excluir', () => {
    it('deve excluir um orçamento', async () => {
      mockReq.params = { id: 'o1' };
      (orcamentoService.excluir as jest.Mock).mockResolvedValue(undefined);

      await orcamentoController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.excluir).toHaveBeenCalledWith('o1');
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: 'Orçamento excluído com sucesso' });
    });

    it('deve chamar next em caso de erro', async () => {
      mockReq.params = { id: 'o1' };
      const error = new Error('Não é possível excluir');
      (orcamentoService.excluir as jest.Mock).mockRejectedValue(error);

      await orcamentoController.excluir(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('duplicar', () => {
    it('deve duplicar um orçamento', async () => {
      mockReq.params = { id: 'o1' };
      const novoOrcamento = { ...mockOrcamento, id: 'o2', numero: 2 };
      (orcamentoService.duplicar as jest.Mock).mockResolvedValue(novoOrcamento);

      await orcamentoController.duplicar(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.duplicar).toHaveBeenCalledWith('o1');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: novoOrcamento });
    });

    it('deve chamar next em caso de erro', async () => {
      mockReq.params = { id: 'o1' };
      const error = new Error('Erro ao duplicar');
      (orcamentoService.duplicar as jest.Mock).mockRejectedValue(error);

      await orcamentoController.duplicar(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('estatisticas', () => {
    it('deve retornar estatísticas', async () => {
      const stats = { total: 10, aceitos: 5, valorTotal: 50000 };
      (orcamentoService.getEstatisticas as jest.Mock).mockResolvedValue(stats);

      await orcamentoController.estatisticas(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.getEstatisticas).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: stats });
    });

    it('deve chamar next em caso de erro', async () => {
      const error = new Error('Erro ao obter estatísticas');
      (orcamentoService.getEstatisticas as jest.Mock).mockRejectedValue(error);

      await orcamentoController.estatisticas(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('verificarExpirados', () => {
    it('deve verificar e marcar orçamentos expirados', async () => {
      (orcamentoService.verificarExpirados as jest.Mock).mockResolvedValue(3);

      await orcamentoController.verificarExpirados(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.verificarExpirados).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: { expirados: 3 } });
    });

    it('deve chamar next em caso de erro', async () => {
      const error = new Error('Erro ao verificar');
      (orcamentoService.verificarExpirados as jest.Mock).mockRejectedValue(error);

      await orcamentoController.verificarExpirados(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
