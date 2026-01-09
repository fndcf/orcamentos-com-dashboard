import { describe, it, expect, vi, beforeEach } from 'vitest';
import { historicoValoresService } from '../../services/historicoValoresService';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('historicoValoresService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('buscarHistoricoItens', () => {
    it('deve buscar histórico de itens por período', async () => {
      const mockHistorico = [
        {
          id: '1',
          itemId: 'item-1',
          itemDescricao: 'Extintor ABC 6kg',
          valorAnterior: 100,
          valorNovo: 120,
          dataAlteracao: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          itemId: 'item-2',
          itemDescricao: 'Mangueira 15m',
          valorAnterior: 200,
          valorNovo: 250,
          dataAlteracao: '2024-01-16T14:30:00Z',
        },
      ];
      vi.mocked(api.get).mockResolvedValue({ data: mockHistorico });

      const result = await historicoValoresService.buscarHistoricoItens('2024-01-01', '2024-01-31');

      expect(api.get).toHaveBeenCalledWith('/historico-valores/itens', {
        params: { dataInicio: '2024-01-01', dataFim: '2024-01-31' },
      });
      expect(result).toEqual(mockHistorico);
    });

    it('deve retornar array vazio quando não há histórico', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: [] });

      const result = await historicoValoresService.buscarHistoricoItens('2024-01-01', '2024-01-31');

      expect(result).toEqual([]);
    });
  });

  describe('buscarHistoricoConfiguracoes', () => {
    it('deve buscar histórico de configurações por período', async () => {
      const mockHistorico = [
        {
          id: '1',
          campo: 'impostoMaterial',
          valorAnterior: '10',
          valorNovo: '12',
          dataAlteracao: '2024-01-10T08:00:00Z',
        },
        {
          id: '2',
          campo: 'impostoServico',
          valorAnterior: '15',
          valorNovo: '18',
          dataAlteracao: '2024-01-12T09:00:00Z',
        },
      ];
      vi.mocked(api.get).mockResolvedValue({ data: mockHistorico });

      const result = await historicoValoresService.buscarHistoricoConfiguracoes('2024-01-01', '2024-01-31');

      expect(api.get).toHaveBeenCalledWith('/historico-valores/configuracoes', {
        params: { dataInicio: '2024-01-01', dataFim: '2024-01-31' },
      });
      expect(result).toEqual(mockHistorico);
    });

    it('deve retornar array vazio quando não há histórico de configurações', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: [] });

      const result = await historicoValoresService.buscarHistoricoConfiguracoes('2024-01-01', '2024-01-31');

      expect(result).toEqual([]);
    });
  });
});
