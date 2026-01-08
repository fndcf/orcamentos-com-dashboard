import { useQuery, useMutation, useQueryClient } from 'react-query';
import { orcamentoService } from '../services/orcamentoService';
import { OrcamentoItemCompleto, OrcamentoStatus, OrcamentoTipo, ParcelamentoDados, DescontoAVistaDados } from '../types';

interface CriarOrcamentoDTO {
  tipo: OrcamentoTipo;
  clienteId: string;
  // Campos do orçamento completo
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number;
  prazoVistoriaBombeiros?: number | null;
  condicaoPagamento?: 'a_vista' | 'a_combinar' | 'parcelado';
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados;
  descontoAVista?: DescontoAVistaDados | null;
  mostrarValoresDetalhados?: boolean;
  // Campos comuns
  observacoes?: string;
  diasValidade?: number;
  consultor?: string;
  contato?: string;
  email?: string;
  telefone?: string;
  enderecoServico?: string;
}

interface AtualizarOrcamentoDTO {
  // Campos do orçamento completo
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number;
  prazoVistoriaBombeiros?: number | null;
  condicaoPagamento?: 'a_vista' | 'a_combinar' | 'parcelado';
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados;
  descontoAVista?: DescontoAVistaDados | null;
  mostrarValoresDetalhados?: boolean;
  // Campos comuns
  observacoes?: string;
  dataValidade?: Date;
  consultor?: string;
  contato?: string;
  email?: string;
  telefone?: string;
  enderecoServico?: string;
}

export function useOrcamentos() {
  return useQuery('orcamentos', orcamentoService.listar, {
    staleTime: 5 * 60 * 1000,
  });
}

export function useOrcamento(id: string) {
  return useQuery(['orcamento', id], () => orcamentoService.buscarPorId(id), {
    enabled: !!id,
  });
}

export function useOrcamentosPorCliente(clienteId: string) {
  return useQuery(
    ['orcamentos', 'cliente', clienteId],
    () => orcamentoService.buscarPorCliente(clienteId),
    { enabled: !!clienteId }
  );
}

export function useHistoricoCliente(clienteId: string, limit: number = 5) {
  return useQuery(
    ['orcamentos', 'historico', clienteId, limit],
    () => orcamentoService.getHistoricoCliente(clienteId, limit),
    { enabled: !!clienteId }
  );
}

export function useOrcamentosPorStatus(status: OrcamentoStatus) {
  return useQuery(['orcamentos', 'status', status], () =>
    orcamentoService.buscarPorStatus(status)
  );
}

export function useOrcamentosPorPeriodo(dataInicio: string, dataFim: string) {
  return useQuery(
    ['orcamentos', 'periodo', dataInicio, dataFim],
    () => orcamentoService.buscarPorPeriodo(dataInicio, dataFim),
    {
      enabled: !!dataInicio && !!dataFim,
      staleTime: 5 * 60 * 1000,
    }
  );
}

export function useOrcamentosPaginados(
  page: number = 1,
  limit: number = 10,
  filters?: {
    status?: OrcamentoStatus;
    clienteId?: string;
    busca?: string;
  }
) {
  return useQuery(
    ['orcamentos', 'paginated', page, limit, filters],
    () => orcamentoService.listarPaginado(page, limit, filters),
    {
      keepPreviousData: true, // Mantém dados anteriores enquanto carrega nova página
      staleTime: 30 * 1000, // 30 segundos
    }
  );
}

export function useEstatisticasOrcamentos() {
  return useQuery(['orcamentos', 'estatisticas'], orcamentoService.getEstatisticas);
}

export function useDashboardStats() {
  return useQuery(
    ['orcamentos', 'dashboard-stats'],
    () => orcamentoService.getDashboardStats(),
    {
      staleTime: 2 * 60 * 1000, // 2 minutos
    }
  );
}

export function useCriarOrcamento() {
  const queryClient = useQueryClient();

  return useMutation(
    (data: CriarOrcamentoDTO) => orcamentoService.criar(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orcamentos');
      },
    }
  );
}

export function useAtualizarOrcamento() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: string; data: AtualizarOrcamentoDTO }) =>
      orcamentoService.atualizar(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries('orcamentos');
        queryClient.invalidateQueries(['orcamento', id]);
      },
    }
  );
}

export function useAtualizarStatusOrcamento() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, status }: { id: string; status: OrcamentoStatus }) =>
      orcamentoService.atualizarStatus(id, status),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries('orcamentos');
        queryClient.invalidateQueries(['orcamento', id]);
      },
    }
  );
}

export function useExcluirOrcamento() {
  const queryClient = useQueryClient();

  return useMutation(
    (id: string) => orcamentoService.excluir(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orcamentos');
      },
    }
  );
}

export function useDuplicarOrcamento() {
  const queryClient = useQueryClient();

  return useMutation(
    (id: string) => orcamentoService.duplicar(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orcamentos');
      },
    }
  );
}

export function useVerificarExpirados() {
  const queryClient = useQueryClient();

  return useMutation(
    () => orcamentoService.verificarExpirados(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orcamentos');
      },
    }
  );
}
