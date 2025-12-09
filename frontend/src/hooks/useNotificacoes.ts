import { useQuery, useMutation, useQueryClient } from 'react-query';
import { notificacaoService, NotificacaoResumo } from '../services/notificacaoService';
import { Notificacao } from '../types';

export function useNotificacoes() {
  return useQuery<Notificacao[]>('notificacoes', notificacaoService.listar);
}

export function useNotificacoesNaoLidas() {
  return useQuery<Notificacao[]>('notificacoesNaoLidas', notificacaoService.listarNaoLidas);
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
      queryClient.invalidateQueries('notificacaoResumo');
    },
  });
}
