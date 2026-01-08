import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from 'react-query';
import { itemServicoService } from '../services/itemServicoService';
import { ItemServico } from '../types';

interface ItensServicoPaginadoResponse {
  itens: ItemServico[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

export function useItensServico() {
  return useQuery<ItemServico[]>('itens-servico', itemServicoService.listar);
}

export function useItensServicoPorCategoria(categoriaId: string | undefined) {
  return useQuery<ItemServico[]>(
    ['itens-servico', 'categoria', categoriaId],
    () => itemServicoService.listarPorCategoria(categoriaId!),
    {
      enabled: !!categoriaId,
    }
  );
}

export function useItensServicoAtivosPorCategoria(categoriaId: string | undefined) {
  return useQuery<ItemServico[]>(
    ['itens-servico', 'categoria', categoriaId, 'ativos'],
    () => itemServicoService.listarAtivosPorCategoria(categoriaId!),
    {
      enabled: !!categoriaId,
      staleTime: 5 * 60 * 1000, // 5 minutos - itens de serviço não mudam frequentemente
    }
  );
}

export function useInfiniteItensServicoAtivos(
  categoriaId: string | undefined,
  search?: string,
  limit: number = 10
) {
  return useInfiniteQuery<ItensServicoPaginadoResponse>(
    ['itens-servico', 'categoria', categoriaId, 'ativos', 'paginado', search],
    ({ pageParam }) =>
      itemServicoService.listarAtivosPorCategoriaPaginado(categoriaId!, limit, pageParam, search),
    {
      enabled: !!categoriaId,
      staleTime: 5 * 60 * 1000,
      getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    }
  );
}

export function useInfiniteItensServicoPorCategoria(
  categoriaId: string | undefined,
  search?: string,
  limit: number = 10
) {
  return useInfiniteQuery<ItensServicoPaginadoResponse>(
    ['itens-servico', 'categoria', categoriaId, 'paginado', search],
    ({ pageParam }) =>
      itemServicoService.listarPorCategoriaPaginado(categoriaId!, limit, pageParam, search),
    {
      enabled: !!categoriaId,
      staleTime: 5 * 60 * 1000,
      getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    }
  );
}

export function useCriarItemServico() {
  const queryClient = useQueryClient();

  return useMutation(
    (data: { categoriaId: string; descricao: string; unidade: string; ativo?: boolean }) =>
      itemServicoService.criar(data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('itens-servico');
        queryClient.invalidateQueries(['itens-servico', 'categoria', variables.categoriaId]);
      },
    }
  );
}

export function useAtualizarItemServico() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: string; data: { descricao?: string; unidade?: string; ativo?: boolean; ordem?: number } }) =>
      itemServicoService.atualizar(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('itens-servico');
      },
    }
  );
}

export function useToggleItemServico() {
  const queryClient = useQueryClient();

  return useMutation((id: string) => itemServicoService.toggleAtivo(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('itens-servico');
    },
  });
}

export function useExcluirItemServico() {
  const queryClient = useQueryClient();

  return useMutation((id: string) => itemServicoService.excluir(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('itens-servico');
    },
  });
}
