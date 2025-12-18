import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from 'react-query';
import { notificacaoService, NotificacaoResumo } from '../services/notificacaoService';
import { Notificacao, PaginatedResponse } from '../types';
import { logger } from '../utils/logger';

export function useNotificacaoResumo() {
  return useQuery<NotificacaoResumo>('notificacaoResumo', notificacaoService.obterResumo, {
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });
}

export function useMarcarNotificacaoComoLida() {
  const queryClient = useQueryClient();

  return useMutation((id: string) => notificacaoService.marcarComoLida(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('notificacaoResumo');
      queryClient.invalidateQueries('notificacoesPaginadas');
      queryClient.invalidateQueries('notificacoesNaoLidasPaginadas');
      queryClient.invalidateQueries('notificacoesVencidasPaginadas');
      queryClient.invalidateQueries('notificacoesAtivasPaginadas');
      queryClient.invalidateQueries('notificacoesProximasPaginadas');
    },
  });
}

export function useMarcarTodasNotificacoesComoLidas() {
  const queryClient = useQueryClient();

  return useMutation(() => notificacaoService.marcarTodasComoLidas(), {
    onSuccess: () => {
      queryClient.invalidateQueries('notificacaoResumo');
      queryClient.invalidateQueries('notificacoesPaginadas');
      queryClient.invalidateQueries('notificacoesNaoLidasPaginadas');
      queryClient.invalidateQueries('notificacoesVencidasPaginadas');
      queryClient.invalidateQueries('notificacoesAtivasPaginadas');
      queryClient.invalidateQueries('notificacoesProximasPaginadas');
    },
  });
}

export function useExcluirNotificacao() {
  const queryClient = useQueryClient();

  return useMutation((id: string) => notificacaoService.excluir(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('notificacaoResumo');
      queryClient.invalidateQueries('notificacoesPaginadas');
      queryClient.invalidateQueries('notificacoesNaoLidasPaginadas');
      queryClient.invalidateQueries('notificacoesVencidasPaginadas');
      queryClient.invalidateQueries('notificacoesAtivasPaginadas');
      queryClient.invalidateQueries('notificacoesProximasPaginadas');
    },
  });
}

export function useGerarNotificacoesOrcamento() {
  const queryClient = useQueryClient();

  return useMutation((orcamentoId: string) => notificacaoService.gerarParaOrcamento(orcamentoId), {
    onSuccess: () => {
      queryClient.invalidateQueries('notificacaoResumo');
      queryClient.invalidateQueries('notificacoesPaginadas');
      queryClient.invalidateQueries('notificacoesNaoLidasPaginadas');
      queryClient.invalidateQueries('notificacoesVencidasPaginadas');
      queryClient.invalidateQueries('notificacoesAtivasPaginadas');
      queryClient.invalidateQueries('notificacoesProximasPaginadas');
    },
  });
}

export function useProcessarTodasNotificacoes() {
  const queryClient = useQueryClient();

  return useMutation(() => notificacaoService.processarTodos(), {
    onSuccess: () => {
      queryClient.invalidateQueries('notificacaoResumo');
      queryClient.invalidateQueries('notificacoesPaginadas');
      queryClient.invalidateQueries('notificacoesNaoLidasPaginadas');
      queryClient.invalidateQueries('notificacoesVencidasPaginadas');
      queryClient.invalidateQueries('notificacoesAtivasPaginadas');
      queryClient.invalidateQueries('notificacoesProximasPaginadas');
    },
  });
}

// ========== HOOKS PAGINADOS ==========

export function useNotificacoesPaginadas(pageSize: number = 10) {
  return useInfiniteQuery<PaginatedResponse<Notificacao>>(
    ['notificacoesPaginadas', pageSize],
    ({ pageParam }) => notificacaoService.listarPaginado(pageSize, pageParam),
    {
      getNextPageParam: (lastPage) => lastPage.cursor,
      onError: (error) => {
        logger.error('Erro ao buscar notificações paginadas', { error });
      },
    }
  );
}

export function useNotificacoesNaoLidasPaginadas(pageSize: number = 10) {
  return useInfiniteQuery<PaginatedResponse<Notificacao>>(
    ['notificacoesNaoLidasPaginadas', pageSize],
    ({ pageParam }) => notificacaoService.listarNaoLidasPaginado(pageSize, pageParam),
    {
      getNextPageParam: (lastPage) => lastPage.cursor,
      refetchInterval: 60000,
      onError: (error) => {
        logger.error('Erro ao buscar notificações não lidas paginadas', { error });
      },
    }
  );
}

export function useNotificacoesVencidasPaginadas(pageSize: number = 10) {
  return useInfiniteQuery<PaginatedResponse<Notificacao>>(
    ['notificacoesVencidasPaginadas', pageSize],
    ({ pageParam }) => notificacaoService.listarVencidasPaginado(pageSize, pageParam),
    {
      getNextPageParam: (lastPage) => lastPage.cursor,
      onError: (error) => {
        logger.error('Erro ao buscar notificações vencidas paginadas', { error });
      },
    }
  );
}

export function useNotificacoesAtivasPaginadas(dias: number = 60, pageSize: number = 10) {
  return useInfiniteQuery<PaginatedResponse<Notificacao>>(
    ['notificacoesAtivasPaginadas', dias, pageSize],
    ({ pageParam }) => notificacaoService.listarAtivasPaginado(dias, pageSize, pageParam),
    {
      getNextPageParam: (lastPage) => lastPage.cursor,
      refetchInterval: 60000,
      onError: (error) => {
        logger.error('Erro ao buscar notificações ativas paginadas', { error });
      },
    }
  );
}

export function useNotificacoesProximasPaginadas(dias: number = 30, pageSize: number = 10) {
  return useInfiniteQuery<PaginatedResponse<Notificacao>>(
    ['notificacoesProximasPaginadas', dias, pageSize],
    ({ pageParam }) => notificacaoService.listarProximasPaginado(dias, pageSize, pageParam),
    {
      getNextPageParam: (lastPage) => lastPage.cursor,
      onError: (error) => {
        logger.error('Erro ao buscar notificações próximas paginadas', { error });
      },
    }
  );
}
