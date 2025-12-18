import { useQuery, useMutation, useQueryClient } from 'react-query';
import { orcamentoService } from '../services/orcamentoService';
import { OrcamentoItem, OrcamentoItemCompleto, OrcamentoStatus, OrcamentoTipo } from '../types';

interface CriarOrcamentoDTO {
  tipo: OrcamentoTipo;
  clienteId: string;
  // Campos para orçamento simples
  itens?: OrcamentoItem[];
  // Campos para orçamento completo
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number;
  prazoVistoriaBombeiros?: number;
  condicaoPagamento?: 'a_vista' | 'a_combinar' | 'parcelado';
  parcelamentoTexto?: string;
  mostrarValoresDetalhados?: boolean;
  // Campos comuns
  observacoes?: string;
  diasValidade?: number;
  consultor?: string;
  contato?: string;
}

interface AtualizarOrcamentoDTO {
  // Campos para orçamento simples
  itens?: OrcamentoItem[];
  // Campos para orçamento completo
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number;
  prazoVistoriaBombeiros?: number;
  condicaoPagamento?: 'a_vista' | 'a_combinar' | 'parcelado';
  parcelamentoTexto?: string;
  mostrarValoresDetalhados?: boolean;
  // Campos comuns
  observacoes?: string;
  dataValidade?: Date;
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

export function useOrcamentosPorStatus(status: OrcamentoStatus) {
  return useQuery(['orcamentos', 'status', status], () =>
    orcamentoService.buscarPorStatus(status)
  );
}

export function useEstatisticasOrcamentos() {
  return useQuery(['orcamentos', 'estatisticas'], orcamentoService.getEstatisticas);
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
