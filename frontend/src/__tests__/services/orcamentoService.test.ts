import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orcamentoService } from '../../services/orcamentoService';
import api from '../../services/api';

// Mock do api
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('orcamentoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listar', () => {
    it('deve listar todos os orçamentos', async () => {
      const mockOrcamentos = [
        { id: '1', numero: 1, clienteId: 'c1' },
        { id: '2', numero: 2, clienteId: 'c2' },
      ];
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: mockOrcamentos },
      });

      const result = await orcamentoService.listar();

      expect(api.get).toHaveBeenCalledWith('/orcamentos');
      expect(result).toEqual(mockOrcamentos);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar orçamento por ID', async () => {
      const mockOrcamento = { id: '1', numero: 1 };
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: mockOrcamento },
      });

      const result = await orcamentoService.buscarPorId('1');

      expect(api.get).toHaveBeenCalledWith('/orcamentos/1');
      expect(result).toEqual(mockOrcamento);
    });
  });

  describe('buscarPorCliente', () => {
    it('deve buscar orçamentos por cliente', async () => {
      const mockOrcamentos = [{ id: '1', clienteId: 'c1' }];
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: mockOrcamentos },
      });

      const result = await orcamentoService.buscarPorCliente('c1');

      expect(api.get).toHaveBeenCalledWith('/orcamentos/cliente/c1');
      expect(result).toEqual(mockOrcamentos);
    });
  });

  describe('getHistoricoCliente', () => {
    it('deve buscar histórico do cliente com limite', async () => {
      const mockHistorico = {
        orcamentos: [
          { id: '1', numero: 5, clienteId: 'c1', status: 'aceito', valorTotal: 1000 },
          { id: '2', numero: 4, clienteId: 'c1', status: 'aberto', valorTotal: 500 },
        ],
        resumo: {
          total: 10,
          aceitos: 5,
          valorTotalAceitos: 15000,
        },
      };
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: mockHistorico },
      });

      const result = await orcamentoService.getHistoricoCliente('c1', 5);

      expect(api.get).toHaveBeenCalledWith('/orcamentos/cliente/c1/historico', {
        params: { limit: 5 },
      });
      expect(result).toEqual(mockHistorico);
    });

    it('deve usar limite padrão quando não especificado', async () => {
      const mockHistorico = {
        orcamentos: [],
        resumo: { total: 0, aceitos: 0, valorTotalAceitos: 0 },
      };
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: mockHistorico },
      });

      await orcamentoService.getHistoricoCliente('c1');

      expect(api.get).toHaveBeenCalledWith('/orcamentos/cliente/c1/historico', {
        params: { limit: 5 },
      });
    });

    it('deve retornar resumo agregado de todos os orçamentos', async () => {
      const mockHistorico = {
        orcamentos: [{ id: '1', numero: 100 }],
        resumo: {
          total: 200,
          aceitos: 150,
          valorTotalAceitos: 500000,
        },
      };
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: mockHistorico },
      });

      const result = await orcamentoService.getHistoricoCliente('c1', 1);

      expect(result.orcamentos).toHaveLength(1);
      expect(result.resumo.total).toBe(200);
      expect(result.resumo.aceitos).toBe(150);
      expect(result.resumo.valorTotalAceitos).toBe(500000);
    });
  });

  describe('buscarPorStatus', () => {
    it('deve buscar orçamentos por status', async () => {
      const mockOrcamentos = [{ id: '1', status: 'aberto' }];
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: mockOrcamentos },
      });

      const result = await orcamentoService.buscarPorStatus('aberto');

      expect(api.get).toHaveBeenCalledWith('/orcamentos/status/aberto');
      expect(result).toEqual(mockOrcamentos);
    });
  });

  describe('listarPaginado', () => {
    it('deve listar orçamentos com paginação e parâmetros padrão', async () => {
      const mockResponse = {
        items: [{ id: '1', numero: 1, clienteId: 'c1' }],
        total: 1,
        page: 1,
        totalPages: 1,
        hasMore: false,
      };
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: mockResponse },
      });

      const result = await orcamentoService.listarPaginado();

      expect(api.get).toHaveBeenCalledWith('/orcamentos/paginated', {
        params: { page: 1, limit: 10 },
      });
      expect(result).toEqual(mockResponse);
    });

    it('deve listar orçamentos com paginação e filtros', async () => {
      const mockResponse = {
        items: [{ id: '1', numero: 1, clienteId: 'c1', status: 'aceito' }],
        total: 50,
        page: 2,
        totalPages: 5,
        hasMore: true,
      };
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: mockResponse },
      });

      const result = await orcamentoService.listarPaginado(2, 20, { status: 'aceito', busca: 'teste' });

      expect(api.get).toHaveBeenCalledWith('/orcamentos/paginated', {
        params: { page: 2, limit: 20, status: 'aceito', busca: 'teste' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('buscarPorPeriodo', () => {
    it('deve buscar orçamentos por período', async () => {
      const mockOrcamentos = [
        { id: '1', numero: 1, dataEmissao: '2024-01-15' },
        { id: '2', numero: 2, dataEmissao: '2024-01-20' },
      ];
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: mockOrcamentos },
      });

      const result = await orcamentoService.buscarPorPeriodo('2024-01-01', '2024-01-31');

      expect(api.get).toHaveBeenCalledWith('/orcamentos/periodo', {
        params: { dataInicio: '2024-01-01', dataFim: '2024-01-31' },
      });
      expect(result).toEqual(mockOrcamentos);
    });
  });

  describe('getDashboardStats', () => {
    it('deve retornar estatísticas do dashboard', async () => {
      const mockStats = {
        totalOrcamentos: 150,
        orcamentosAbertos: 30,
        orcamentosAceitos: 80,
        orcamentosRecusados: 25,
        orcamentosExpirados: 15,
        valorTotalAceitos: 500000,
        ticketMedio: 6250,
        taxaConversao: 53.33,
        orcamentosHoje: 5,
        valorHoje: 15000,
      };
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: mockStats },
      });

      const result = await orcamentoService.getDashboardStats();

      expect(api.get).toHaveBeenCalledWith('/orcamentos/dashboard-stats');
      expect(result).toEqual(mockStats);
    });
  });

  describe('criar', () => {
    it('deve criar um novo orçamento', async () => {
      const novoOrcamento = {
        clienteId: 'c1',
        itens: [{ descricao: 'Item 1', quantidade: 1, valorUnitario: 100 }],
      };
      const orcamentoCriado = { id: '1', numero: 1, ...novoOrcamento };
      vi.mocked(api.post).mockResolvedValue({
        data: { success: true, data: orcamentoCriado },
      });

      const result = await orcamentoService.criar(novoOrcamento as any);

      expect(api.post).toHaveBeenCalledWith('/orcamentos', novoOrcamento);
      expect(result).toEqual(orcamentoCriado);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar um orçamento existente', async () => {
      const dadosAtualizados = { observacoes: 'Nova observação' };
      const orcamentoAtualizado = { id: '1', ...dadosAtualizados };
      vi.mocked(api.put).mockResolvedValue({
        data: { success: true, data: orcamentoAtualizado },
      });

      const result = await orcamentoService.atualizar('1', dadosAtualizados);

      expect(api.put).toHaveBeenCalledWith('/orcamentos/1', dadosAtualizados);
      expect(result).toEqual(orcamentoAtualizado);
    });
  });

  describe('atualizarStatus', () => {
    it('deve atualizar status do orçamento', async () => {
      const orcamentoAtualizado = { id: '1', status: 'aceito' };
      vi.mocked(api.patch).mockResolvedValue({
        data: { success: true, data: orcamentoAtualizado },
      });

      const result = await orcamentoService.atualizarStatus('1', 'aceito');

      expect(api.patch).toHaveBeenCalledWith('/orcamentos/1/status', { status: 'aceito' });
      expect(result).toEqual(orcamentoAtualizado);
    });
  });

  describe('excluir', () => {
    it('deve excluir um orçamento', async () => {
      vi.mocked(api.delete).mockResolvedValue({});

      await orcamentoService.excluir('1');

      expect(api.delete).toHaveBeenCalledWith('/orcamentos/1');
    });
  });

  describe('duplicar', () => {
    it('deve duplicar um orçamento', async () => {
      const orcamentoDuplicado = { id: '2', numero: 2 };
      vi.mocked(api.post).mockResolvedValue({
        data: { success: true, data: orcamentoDuplicado },
      });

      const result = await orcamentoService.duplicar('1');

      expect(api.post).toHaveBeenCalledWith('/orcamentos/1/duplicar');
      expect(result).toEqual(orcamentoDuplicado);
    });
  });

  describe('getEstatisticas', () => {
    it('deve retornar estatísticas dos orçamentos', async () => {
      const mockEstatisticas = {
        total: 100,
        abertos: 30,
        aceitos: 50,
        recusados: 15,
        expirados: 5,
        valorTotalAceitos: 150000,
      };
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: mockEstatisticas },
      });

      const result = await orcamentoService.getEstatisticas();

      expect(api.get).toHaveBeenCalledWith('/orcamentos/estatisticas');
      expect(result).toEqual(mockEstatisticas);
    });
  });

  describe('verificarExpirados', () => {
    it('deve verificar e retornar quantidade de expirados', async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: { success: true, data: { expirados: 5 } },
      });

      const result = await orcamentoService.verificarExpirados();

      expect(api.post).toHaveBeenCalledWith('/orcamentos/verificar-expirados');
      expect(result).toBe(5);
    });
  });
});
