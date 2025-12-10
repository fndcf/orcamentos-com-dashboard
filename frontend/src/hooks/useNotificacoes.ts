import { useQuery, useMutation, useQueryClient } from 'react-query';
import { notificacaoService, NotificacaoResumo } from '../services/notificacaoService';
import { Notificacao } from '../types';
import { logger } from '../utils/logger';

export function useNotificacoes() {
  return useQuery<Notificacao[]>('notificacoes', notificacaoService.listar);
}

export function useNotificacoesNaoLidas() {
  return useQuery<Notificacao[]>('notificacoesNaoLidas', notificacaoService.listarNaoLidas, {
    refetchInterval: 60000, // Atualiza a cada 1 minuto (sincronizado com o resumo)
    retry: 3, // Tenta 3 vezes em caso de erro
    onError: (error) => {
      logger.error('Erro ao buscar notificações não lidas', { error });
    },
  });
}

export function useNotificacoesProximas(dias: number = 30) {
  return useQuery<Notificacao[]>(
    ['notificacoesProximas', dias],
    () => notificacaoService.listarProximas(dias)
  );
}

export function useNotificacoesVencidas() {
  return useQuery<Notificacao[]>('notificacoesVencidas', notificacaoService.listarVencidas);
}

export function useNotificacoesAtivas(dias: number = 60) {
  return useQuery<Notificacao[]>(
    ['notificacoesAtivas', dias],
    () => notificacaoService.listarAtivas(dias),
    {
      refetchInterval: 60000, // Atualiza a cada 1 minuto
      retry: 3,
      onError: (error) => {
        logger.error('Erro ao buscar notificações ativas', { error });
      },
    }
  );
}

export function useNotificacaoResumo() {
  return useQuery<NotificacaoResumo>('notificacaoResumo', notificacaoService.obterResumo, {
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });
}

export function useMarcarNotificacaoComoLida() {
  const queryClient = useQueryClient();

  return useMutation((id: string) => notificacaoService.marcarComoLida(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('notificacoes');
      queryClient.invalidateQueries('notificacoesNaoLidas');
      queryClient.invalidateQueries('notificacoesProximas');
      queryClient.invalidateQueries('notificacoesVencidas');
      queryClient.invalidateQueries('notificacoesAtivas');
      queryClient.invalidateQueries('notificacaoResumo');
    },
  });
}

export function useMarcarTodasNotificacoesComoLidas() {
  const queryClient = useQueryClient();

  return useMutation(() => notificacaoService.marcarTodasComoLidas(), {
    onSuccess: () => {
      queryClient.invalidateQueries('notificacoes');
      queryClient.invalidateQueries('notificacoesNaoLidas');
      queryClient.invalidateQueries('notificacoesProximas');
      queryClient.invalidateQueries('notificacoesVencidas');
      queryClient.invalidateQueries('notificacoesAtivas');
      queryClient.invalidateQueries('notificacaoResumo');
    },
  });
}

export function useExcluirNotificacao() {
  const queryClient = useQueryClient();

  return useMutation((id: string) => notificacaoService.excluir(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('notificacoes');
      queryClient.invalidateQueries('notificacoesNaoLidas');
      queryClient.invalidateQueries('notificacoesProximas');
      queryClient.invalidateQueries('notificacoesVencidas');
      queryClient.invalidateQueries('notificacoesAtivas');
      queryClient.invalidateQueries('notificacaoResumo');
    },
  });
}

export function useGerarNotificacoesOrcamento() {
  const queryClient = useQueryClient();

  return useMutation((orcamentoId: string) => notificacaoService.gerarParaOrcamento(orcamentoId), {
    onSuccess: () => {
      queryClient.invalidateQueries('notificacoes');
      queryClient.invalidateQueries('notificacoesNaoLidas');
      queryClient.invalidateQueries('notificacoesProximas');
      queryClient.invalidateQueries('notificacoesVencidas');
      queryClient.invalidateQueries('notificacoesAtivas');
      queryClient.invalidateQueries('notificacaoResumo');
    },
  });
}

export function useProcessarTodasNotificacoes() {
  const queryClient = useQueryClient();

  return useMutation(() => notificacaoService.processarTodos(), {
    onSuccess: () => {
      queryClient.invalidateQueries('notificacoes');
      queryClient.invalidateQueries('notificacoesNaoLidas');
      queryClient.invalidateQueries('notificacoesProximas');
      queryClient.invalidateQueries('notificacoesVencidas');
      queryClient.invalidateQueries('notificacoesAtivas');
      queryClient.invalidateQueries('notificacaoResumo');
    },
  });
}
