import { useQuery, useMutation, useQueryClient } from 'react-query';
import { categoriaItemService } from '../services/categoriaItemService';
import { CategoriaItem } from '../types';

export function useCategoriasItem() {
  return useQuery<CategoriaItem[]>('categorias-item', categoriaItemService.listar);
}

export function useCategoriasItemAtivas() {
  return useQuery<CategoriaItem[]>('categorias-item-ativas', categoriaItemService.listarAtivas);
}

export function useCriarCategoriaItem() {
  const queryClient = useQueryClient();

  return useMutation(
    (data: { nome: string; ativo?: boolean }) => categoriaItemService.criar(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categorias-item');
        queryClient.invalidateQueries('categorias-item-ativas');
      },
    }
  );
}

export function useAtualizarCategoriaItem() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: string; data: { nome?: string; ativo?: boolean; ordem?: number } }) =>
      categoriaItemService.atualizar(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categorias-item');
        queryClient.invalidateQueries('categorias-item-ativas');
      },
    }
  );
}

export function useToggleCategoriaItem() {
  const queryClient = useQueryClient();

  return useMutation((id: string) => categoriaItemService.toggleAtivo(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('categorias-item');
      queryClient.invalidateQueries('categorias-item-ativas');
    },
  });
}

export function useExcluirCategoriaItem() {
  const queryClient = useQueryClient();

  return useMutation((id: string) => categoriaItemService.excluir(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('categorias-item');
      queryClient.invalidateQueries('categorias-item-ativas');
    },
  });
}
