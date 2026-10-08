import { Request, Response, NextFunction } from 'express';
import { orcamentoController } from '../../controllers/orcamentoController';
import { orcamentoService } from '../../services/orcamentoService';
import { ValidationError } from '../../utils/errors';

// Mock do service
jest.mock('../../services/orcamentoService', () => ({
  orcamentoService: {
    listar: jest.fn(),
    listarPaginado: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorCliente: jest.fn(),
    buscarPorStatus: jest.fn(),
    buscarPorPeriodo: jest.fn(),
    getHistoricoCliente: jest.fn(),
    getDashboardStats: jest.fn(),
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
    const itemValido = {
      etapa: 'comercial',
      categoriaId: 'cat1',
      categoriaNome: 'Categoria',
      descricao: 'Item 1',
      unidade: 'un',
      quantidade: 1,
      valorUnitarioMaoDeObra: 500,
      valorUnitarioMaterial: 500,
      valorTotalMaoDeObra: 500,
      valorTotalMaterial: 500,
      valorTotal: 1000,
    };

    it('deve criar um novo orçamento', async () => {
      mockReq.body = {
        tipo: 'completo',
        clienteId: 'c1',
        servicoId: 's1',
        itensCompleto: [itemValido],
      };
      (orcamentoService.criar as jest.Mock).mockResolvedValue(mockOrcamento);

      await orcamentoController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.criar).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockOrcamento });
    });

    it('deve descartar campos desconhecidos do orçamento e dos itens', async () => {
      mockReq.body = {
        clienteId: 'c1',
        status: 'aceito',
        valorTotal: 1,
        itensCompleto: [{ ...itemValido, campoExtra: 'x' }],
      };
      (orcamentoService.criar as jest.Mock).mockResolvedValue(mockOrcamento);

      await orcamentoController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.criar).toHaveBeenCalledWith({
        tipo: 'completo',
        clienteId: 'c1',
        itensCompleto: [itemValido],
      });
    });

    it('deve rejeitar item com valor não numérico', async () => {
      mockReq.body = {
        clienteId: 'c1',
        itensCompleto: [{ ...itemValido, valorUnitarioMaterial: 'abc' }],
      };

      await orcamentoController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.criar).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const erro = (mockNext as jest.Mock).mock.calls[0][0];
      expect(erro.message).toBe('Campo "itensCompleto.0.valorUnitarioMaterial" deve ser número');
    });

    it('deve aceitar prazoVistoriaBombeiros e descontoAVista nulos', async () => {
      mockReq.body = { clienteId: 'c1', prazoVistoriaBombeiros: null, descontoAVista: null };
      (orcamentoService.criar as jest.Mock).mockResolvedValue(mockOrcamento);

      await orcamentoController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.criar).toHaveBeenCalledWith({
        tipo: 'completo',
        clienteId: 'c1',
        prazoVistoriaBombeiros: null,
        descontoAVista: null,
      });
    });

    it('deve manter parcelasSelecionadas e abaixoDoMinimo do parcelamento', async () => {
      const parcelamentoDados = {
        entradaPercent: 30,
        valorEntrada: 300,
        valorRestante: 700,
        opcoes: [
          { numeroParcelas: 2, valorParcela: 350, valorTotal: 700, temJuros: false, taxaJuros: 0, abaixoDoMinimo: true },
        ],
        parcelasSelecionadas: [2],
      };
      mockReq.body = { clienteId: 'c1', condicaoPagamento: 'parcelado', parcelamentoDados };
      (orcamentoService.criar as jest.Mock).mockResolvedValue(mockOrcamento);

      await orcamentoController.criar(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.criar).toHaveBeenCalledWith(
        expect.objectContaining({ parcelamentoDados })
      );
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

  describe('listarPaginado', () => {
    it('deve listar orçamentos paginados com parâmetros padrão', async () => {
      mockReq.query = {};
      const result = { items: [mockOrcamento], total: 1 };
      (orcamentoService.listarPaginado as jest.Mock).mockResolvedValue(result);

      await orcamentoController.listarPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.listarPaginado).toHaveBeenCalledWith(1, 10, {
        status: undefined,
        clienteId: undefined,
        busca: undefined,
      });
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: result });
    });

    it('deve listar com parâmetros personalizados', async () => {
      mockReq.query = { page: '2', limit: '20', status: 'aceito', clienteId: 'c1', busca: 'teste' };
      const result = { items: [mockOrcamento], total: 1 };
      (orcamentoService.listarPaginado as jest.Mock).mockResolvedValue(result);

      await orcamentoController.listarPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.listarPaginado).toHaveBeenCalledWith(2, 20, {
        status: 'aceito',
        clienteId: 'c1',
        busca: 'teste',
      });
    });

    it('deve chamar next em caso de erro', async () => {
      mockReq.query = {};
      const error = new Error('Erro ao listar');
      (orcamentoService.listarPaginado as jest.Mock).mockRejectedValue(error);

      await orcamentoController.listarPaginado(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('historicoCliente', () => {
    it('deve retornar histórico do cliente com limite padrão', async () => {
      mockReq.params = { clienteId: 'c1' };
      mockReq.query = {};
      const historico = [mockOrcamento];
      (orcamentoService.getHistoricoCliente as jest.Mock).mockResolvedValue(historico);

      await orcamentoController.historicoCliente(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.getHistoricoCliente).toHaveBeenCalledWith('c1', 5);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: historico });
    });

    it('deve retornar histórico com limite personalizado', async () => {
      mockReq.params = { clienteId: 'c1' };
      mockReq.query = { limit: '10' };
      (orcamentoService.getHistoricoCliente as jest.Mock).mockResolvedValue([]);

      await orcamentoController.historicoCliente(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.getHistoricoCliente).toHaveBeenCalledWith('c1', 10);
    });

    it('deve chamar next em caso de erro', async () => {
      mockReq.params = { clienteId: 'c1' };
      mockReq.query = {};
      const error = new Error('Erro ao buscar histórico');
      (orcamentoService.getHistoricoCliente as jest.Mock).mockRejectedValue(error);

      await orcamentoController.historicoCliente(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('buscarPorPeriodo', () => {
    it('deve buscar orçamentos por período', async () => {
      mockReq.query = { dataInicio: '2024-01-01', dataFim: '2024-12-31' };
      const orcamentos = [mockOrcamento];
      (orcamentoService.buscarPorPeriodo as jest.Mock).mockResolvedValue(orcamentos);

      await orcamentoController.buscarPorPeriodo(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.buscarPorPeriodo).toHaveBeenCalledWith('2024-01-01', '2024-12-31');
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: orcamentos });
    });

    it('deve chamar next em caso de erro', async () => {
      mockReq.query = { dataInicio: '2024-01-01', dataFim: '2024-12-31' };
      const error = new Error('Erro ao buscar por período');
      (orcamentoService.buscarPorPeriodo as jest.Mock).mockRejectedValue(error);

      await orcamentoController.buscarPorPeriodo(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('dashboardStats', () => {
    it('deve retornar estatísticas do dashboard', async () => {
      const stats = {
        total: 10,
        abertos: 5,
        aceitos: 3,
        recusados: 1,
        expirados: 1,
        valorTotal: 50000,
        valorAceitos: 30000,
        totalClientes: 5,
        porMes: [],
      };
      (orcamentoService.getDashboardStats as jest.Mock).mockResolvedValue(stats);

      await orcamentoController.dashboardStats(mockReq as Request, mockRes as Response, mockNext);

      expect(orcamentoService.getDashboardStats).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: stats });
    });

    it('deve chamar next em caso de erro', async () => {
      const error = new Error('Erro ao obter estatísticas');
      (orcamentoService.getDashboardStats as jest.Mock).mockRejectedValue(error);

      await orcamentoController.dashboardStats(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
