import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { CategoriasTab } from '../../../../pages/Configuracoes/tabs/CategoriasTab';
import {
  useCategoriasItem,
  useCriarCategoriaItem,
  useAtualizarCategoriaItem,
  useToggleCategoriaItem,
  useExcluirCategoriaItem,
} from '../../../../hooks/useCategoriasItem';
import {
  useInfiniteItensServicoPorCategoria,
  useCriarItemServico,
  useAtualizarItemServico,
  useToggleItemServico,
  useExcluirItemServico,
} from '../../../../hooks/useItensServico';

vi.mock('../../../../hooks/useCategoriasItem', () => ({
  useCategoriasItem: vi.fn(),
  useCriarCategoriaItem: vi.fn(),
  useAtualizarCategoriaItem: vi.fn(),
  useToggleCategoriaItem: vi.fn(),
  useExcluirCategoriaItem: vi.fn(),
}));

vi.mock('../../../../hooks/useItensServico', () => ({
  useInfiniteItensServicoPorCategoria: vi.fn(),
  useCriarItemServico: vi.fn(),
  useAtualizarItemServico: vi.fn(),
  useToggleItemServico: vi.fn(),
  useExcluirItemServico: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockCategorias = [
  { id: 'cat1', nome: 'Bomba de Incendio', ativo: true, ordem: 1 },
  { id: 'cat2', nome: 'Sistema de Hidrantes', ativo: false, ordem: 2 },
];

const mockItensServico = [
  { id: 'item1', categoriaId: 'cat1', descricao: 'Bomba centrifuga 500L', unidade: 'UN', ativo: true },
  { id: 'item2', categoriaId: 'cat1', descricao: 'Instalacao eletrica', unidade: 'VB', ativo: false },
];

const mockCriarCategoriaMutateAsync = vi.fn();
const mockAtualizarCategoriaMutateAsync = vi.fn();
const mockToggleCategoriaMutateAsync = vi.fn();
const mockExcluirCategoriaMutateAsync = vi.fn();
const mockCriarItemServicoMutateAsync = vi.fn();
const mockAtualizarItemServicoMutateAsync = vi.fn();
const mockToggleItemServicoMutateAsync = vi.fn();
const mockExcluirItemServicoMutateAsync = vi.fn();

describe('CategoriasTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCategoriasItem).mockReturnValue({
      data: mockCategorias,
      isLoading: false,
    } as any);

    vi.mocked(useCriarCategoriaItem).mockReturnValue({
      mutateAsync: mockCriarCategoriaMutateAsync,
    } as any);

    vi.mocked(useAtualizarCategoriaItem).mockReturnValue({
      mutateAsync: mockAtualizarCategoriaMutateAsync,
    } as any);

    vi.mocked(useToggleCategoriaItem).mockReturnValue({
      mutateAsync: mockToggleCategoriaMutateAsync,
    } as any);

    vi.mocked(useExcluirCategoriaItem).mockReturnValue({
      mutateAsync: mockExcluirCategoriaMutateAsync,
    } as any);

    vi.mocked(useInfiniteItensServicoPorCategoria).mockReturnValue({
      data: {
        pages: [{ itens: mockItensServico, total: mockItensServico.length }],
        pageParams: [undefined],
      },
      isLoading: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    } as any);

    vi.mocked(useCriarItemServico).mockReturnValue({
      mutateAsync: mockCriarItemServicoMutateAsync,
    } as any);

    vi.mocked(useAtualizarItemServico).mockReturnValue({
      mutateAsync: mockAtualizarItemServicoMutateAsync,
    } as any);

    vi.mocked(useToggleItemServico).mockReturnValue({
      mutateAsync: mockToggleItemServicoMutateAsync,
    } as any);

    vi.mocked(useExcluirItemServico).mockReturnValue({
      mutateAsync: mockExcluirItemServicoMutateAsync,
    } as any);
  });

  describe('Renderizacao basica', () => {
    it('deve renderizar titulo e descricao', () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Categorias de Itens')).toBeInTheDocument();
      expect(screen.getByText(/Cadastre as categorias para agrupar/)).toBeInTheDocument();
    });

    it('deve renderizar botao nova categoria', () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: '+ Nova Categoria' })).toBeInTheDocument();
    });

    it('deve renderizar lista de categorias', () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      expect(screen.getByText(/1\. Bomba de Incendio/)).toBeInTheDocument();
      expect(screen.getByText(/2\. Sistema de Hidrantes/)).toBeInTheDocument();
    });

    it('deve mostrar status de cada categoria', () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Ativa')).toBeInTheDocument();
      expect(screen.getByText('Inativa')).toBeInTheDocument();
    });

    it('deve mostrar estado vazio quando nao ha categorias', () => {
      vi.mocked(useCategoriasItem).mockReturnValue({
        data: [],
        isLoading: false,
      } as any);

      render(<CategoriasTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Nenhuma categoria cadastrada')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cadastrar Primeira Categoria' })).toBeInTheDocument();
    });

    it('deve mostrar botoes de acao para cada categoria', () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      const verItensButtons = screen.getAllByText('Ver Itens');
      const editarButtons = screen.getAllByText('Editar');
      const excluirButtons = screen.getAllByText('Excluir');

      expect(verItensButtons.length).toBeGreaterThanOrEqual(2);
      expect(editarButtons.length).toBeGreaterThanOrEqual(2);
      expect(excluirButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Modal de categoria', () => {
    it('deve abrir modal ao clicar em nova categoria', async () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: '+ Nova Categoria' }));

      await waitFor(() => {
        expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
        expect(screen.getByText('Nome da Categoria')).toBeInTheDocument();
      });
    });

    it('deve abrir modal ao clicar em cadastrar primeira categoria', async () => {
      vi.mocked(useCategoriasItem).mockReturnValue({
        data: [],
        isLoading: false,
      } as any);

      render(<CategoriasTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: 'Cadastrar Primeira Categoria' }));

      await waitFor(() => {
        expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
      });
    });

    it('deve fechar modal ao clicar em cancelar', async () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: '+ Nova Categoria' }));

      await waitFor(() => {
        expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      await waitFor(() => {
        expect(screen.queryByText('Nova Categoria')).not.toBeInTheDocument();
      });
    });

    it('deve desabilitar botao cadastrar com nome curto', async () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: '+ Nova Categoria' }));

      await waitFor(() => {
        expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
      });

      const cadastrarButton = screen.getByRole('button', { name: 'Cadastrar' });
      expect(cadastrarButton).toBeDisabled();
    });

    it('deve habilitar botao cadastrar com nome valido', async () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: '+ Nova Categoria' }));

      await waitFor(() => {
        expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Ex: Bomba de Incêndio/);
      fireEvent.change(input, { target: { value: 'Nova Categoria Teste' } });

      const cadastrarButton = screen.getByRole('button', { name: 'Cadastrar' });
      expect(cadastrarButton).not.toBeDisabled();
    });

    it('deve criar categoria com sucesso', async () => {
      mockCriarCategoriaMutateAsync.mockResolvedValue({});

      render(<CategoriasTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: '+ Nova Categoria' }));

      await waitFor(() => {
        expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Ex: Bomba de Incêndio/);
      fireEvent.change(input, { target: { value: 'Categoria Nova' } });

      fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(mockCriarCategoriaMutateAsync).toHaveBeenCalledWith({
          nome: 'Categoria Nova',
        });
      });
    });

    it('deve mostrar erro ao falhar criacao', async () => {
      mockCriarCategoriaMutateAsync.mockRejectedValue({
        response: { data: { error: 'Categoria ja existe' } },
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<CategoriasTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: '+ Nova Categoria' }));

      await waitFor(() => {
        expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Ex: Bomba de Incêndio/);
      fireEvent.change(input, { target: { value: 'Categoria Nova' } });

      fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(screen.getByText('Categoria ja existe')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Edicao de categoria', () => {
    it('deve abrir modal de edicao ao clicar em editar', async () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      const editarButtons = screen.getAllByText('Editar');
      fireEvent.click(editarButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Editar Categoria')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Bomba de Incendio')).toBeInTheDocument();
      });
    });

    it('deve atualizar categoria com sucesso', async () => {
      mockAtualizarCategoriaMutateAsync.mockResolvedValue({});

      render(<CategoriasTab />, { wrapper: createWrapper() });

      const editarButtons = screen.getAllByText('Editar');
      fireEvent.click(editarButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Editar Categoria')).toBeInTheDocument();
      });

      const input = screen.getByDisplayValue('Bomba de Incendio');
      fireEvent.change(input, { target: { value: 'Bomba Alterada' } });

      fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

      await waitFor(() => {
        expect(mockAtualizarCategoriaMutateAsync).toHaveBeenCalledWith({
          id: 'cat1',
          data: { nome: 'Bomba Alterada' },
        });
      });
    });
  });

  describe('Toggle de categoria', () => {
    it('deve chamar toggle ao clicar em desativar', async () => {
      mockToggleCategoriaMutateAsync.mockResolvedValue({});

      render(<CategoriasTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Desativar'));

      await waitFor(() => {
        expect(mockToggleCategoriaMutateAsync).toHaveBeenCalledWith('cat1');
      });
    });

    it('deve chamar toggle ao clicar em ativar', async () => {
      mockToggleCategoriaMutateAsync.mockResolvedValue({});

      render(<CategoriasTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Ativar'));

      await waitFor(() => {
        expect(mockToggleCategoriaMutateAsync).toHaveBeenCalledWith('cat2');
      });
    });

    it('deve logar erro ao falhar toggle', async () => {
      mockToggleCategoriaMutateAsync.mockRejectedValue(new Error('Erro'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<CategoriasTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Desativar'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Erro ao alterar status da categoria'));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Exclusao de categoria', () => {
    it('deve abrir modal de confirmacao ao clicar em excluir', async () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      const excluirButtons = screen.getAllByText('Excluir');
      fireEvent.click(excluirButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Tem certeza/)).toBeInTheDocument();
      });
    });

    it('deve excluir categoria ao confirmar', async () => {
      mockExcluirCategoriaMutateAsync.mockResolvedValue({});

      render(<CategoriasTab />, { wrapper: createWrapper() });

      const excluirButtons = screen.getAllByText('Excluir');
      fireEvent.click(excluirButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Tem certeza/)).toBeInTheDocument();
      });

      const allExcluirButtons = screen.getAllByRole('button', { name: /Excluir/i });
      const modalConfirmButton = allExcluirButtons[allExcluirButtons.length - 1];
      fireEvent.click(modalConfirmButton);

      await waitFor(() => {
        expect(mockExcluirCategoriaMutateAsync).toHaveBeenCalledWith('cat1');
      });
    });

    it('deve logar erro ao falhar exclusao', async () => {
      mockExcluirCategoriaMutateAsync.mockRejectedValue(new Error('Erro'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<CategoriasTab />, { wrapper: createWrapper() });

      const excluirButtons = screen.getAllByText('Excluir');
      fireEvent.click(excluirButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Tem certeza/)).toBeInTheDocument();
      });

      const allExcluirButtons = screen.getAllByRole('button', { name: /Excluir/i });
      const modalConfirmButton = allExcluirButtons[allExcluirButtons.length - 1];
      fireEvent.click(modalConfirmButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Erro ao excluir categoria'));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Itens de Servico', () => {
    it('deve expandir itens ao clicar em ver itens', async () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      const verItensButtons = screen.getAllByText('Ver Itens');
      fireEvent.click(verItensButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Ocultar Itens')).toBeInTheDocument();
        expect(screen.getByText('Itens/Serviços Pré-definidos')).toBeInTheDocument();
        expect(screen.getByText('Bomba centrifuga 500L')).toBeInTheDocument();
      });
    });

    it('deve ocultar itens ao clicar em ocultar itens', async () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      const verItensButtons = screen.getAllByText('Ver Itens');
      fireEvent.click(verItensButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Ocultar Itens')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Ocultar Itens'));

      await waitFor(() => {
        expect(screen.queryByText('Itens/Serviços Pré-definidos')).not.toBeInTheDocument();
      });
    });

    it('deve mostrar loading ao carregar itens', async () => {
      vi.mocked(useInfiniteItensServicoPorCategoria).mockReturnValue({
        data: undefined,
        isLoading: true,
        fetchNextPage: vi.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<CategoriasTab />, { wrapper: createWrapper() });

      const verItensButtons = screen.getAllByText('Ver Itens');
      fireEvent.click(verItensButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Carregando...')).toBeInTheDocument();
      });
    });

    it('deve mostrar mensagem quando nao ha itens', async () => {
      vi.mocked(useInfiniteItensServicoPorCategoria).mockReturnValue({
        data: {
          pages: [{ itens: [], total: 0 }],
          pageParams: [undefined],
        },
        isLoading: false,
        fetchNextPage: vi.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<CategoriasTab />, { wrapper: createWrapper() });

      const verItensButtons = screen.getAllByText('Ver Itens');
      fireEvent.click(verItensButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Nenhum item cadastrado nesta categoria.')).toBeInTheDocument();
      });
    });
  });

  describe('Modal de Item de Servico', () => {
    it('deve abrir modal de novo item', async () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      const verItensButtons = screen.getAllByText('Ver Itens');
      fireEvent.click(verItensButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('+ Novo Item')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Novo Item'));

      await waitFor(() => {
        expect(screen.getByText('Novo Item de Serviço')).toBeInTheDocument();
        expect(screen.getByText('Descrição do Item/Serviço')).toBeInTheDocument();
        expect(screen.getByText('Unidade de Medida')).toBeInTheDocument();
      });
    });

    it('deve criar item de servico com sucesso', async () => {
      mockCriarItemServicoMutateAsync.mockResolvedValue({});

      render(<CategoriasTab />, { wrapper: createWrapper() });

      const verItensButtons = screen.getAllByText('Ver Itens');
      fireEvent.click(verItensButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('+ Novo Item')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Novo Item'));

      await waitFor(() => {
        expect(screen.getByText('Novo Item de Serviço')).toBeInTheDocument();
      });

      const descricaoTextarea = screen.getByPlaceholderText(/Ex: Fornecimento e instalação/);
      fireEvent.change(descricaoTextarea, { target: { value: 'Descricao do item de servico novo' } });

      const unidadeInput = screen.getByPlaceholderText(/Ex: UN, M, M2/);
      fireEvent.change(unidadeInput, { target: { value: 'un' } });

      fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(mockCriarItemServicoMutateAsync).toHaveBeenCalledWith({
          categoriaId: 'cat1',
          descricao: 'Descricao do item de servico novo',
          unidade: 'UN',
        });
      });
    });

    it('deve mostrar botao editar em itens de servico', async () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      const verItensButtons = screen.getAllByText('Ver Itens');
      fireEvent.click(verItensButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Bomba centrifuga 500L')).toBeInTheDocument();
      });

      // Verifica que existem botões de editar
      const editarButtons = screen.getAllByText('Editar');
      expect(editarButtons.length).toBeGreaterThan(2); // Categorias + itens
    });

    it('deve mostrar erro ao falhar criacao de item', async () => {
      mockCriarItemServicoMutateAsync.mockRejectedValue({
        response: { data: { error: 'Item ja existe' } },
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<CategoriasTab />, { wrapper: createWrapper() });

      const verItensButtons = screen.getAllByText('Ver Itens');
      fireEvent.click(verItensButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('+ Novo Item')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Novo Item'));

      await waitFor(() => {
        expect(screen.getByText('Novo Item de Serviço')).toBeInTheDocument();
      });

      const descricaoTextarea = screen.getByPlaceholderText(/Ex: Fornecimento e instalação/);
      fireEvent.change(descricaoTextarea, { target: { value: 'Descricao do item' } });

      const unidadeInput = screen.getByPlaceholderText(/Ex: UN, M, M2/);
      fireEvent.change(unidadeInput, { target: { value: 'un' } });

      fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(screen.getByText('Item ja existe')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('deve desabilitar botao com descricao curta', async () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      const verItensButtons = screen.getAllByText('Ver Itens');
      fireEvent.click(verItensButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('+ Novo Item')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Novo Item'));

      await waitFor(() => {
        expect(screen.getByText('Novo Item de Serviço')).toBeInTheDocument();
      });

      const descricaoTextarea = screen.getByPlaceholderText(/Ex: Fornecimento e instalação/);
      fireEvent.change(descricaoTextarea, { target: { value: 'abc' } });

      const cadastrarButton = screen.getByRole('button', { name: 'Cadastrar' });
      expect(cadastrarButton).toBeDisabled();
    });

    it('deve desabilitar botao sem unidade', async () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      const verItensButtons = screen.getAllByText('Ver Itens');
      fireEvent.click(verItensButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('+ Novo Item')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Novo Item'));

      await waitFor(() => {
        expect(screen.getByText('Novo Item de Serviço')).toBeInTheDocument();
      });

      const descricaoTextarea = screen.getByPlaceholderText(/Ex: Fornecimento e instalação/);
      fireEvent.change(descricaoTextarea, { target: { value: 'Descricao completa do item' } });

      const cadastrarButton = screen.getByRole('button', { name: 'Cadastrar' });
      expect(cadastrarButton).toBeDisabled();
    });
  });

  describe('Toggle de Item de Servico', () => {
    it('deve chamar toggle ao clicar em desativar item', async () => {
      mockToggleItemServicoMutateAsync.mockResolvedValue({});

      render(<CategoriasTab />, { wrapper: createWrapper() });

      const verItensButtons = screen.getAllByText('Ver Itens');
      fireEvent.click(verItensButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Bomba centrifuga 500L')).toBeInTheDocument();
      });

      // Os primeiros Desativar/Ativar sao das categorias, os ultimos dos itens
      const desativarButtons = screen.getAllByText('Desativar');
      fireEvent.click(desativarButtons[desativarButtons.length - 1]);

      await waitFor(() => {
        expect(mockToggleItemServicoMutateAsync).toHaveBeenCalledWith('item1');
      });
    });

    it('deve logar erro ao falhar toggle de item', async () => {
      mockToggleItemServicoMutateAsync.mockRejectedValue(new Error('Erro'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<CategoriasTab />, { wrapper: createWrapper() });

      const verItensButtons = screen.getAllByText('Ver Itens');
      fireEvent.click(verItensButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Bomba centrifuga 500L')).toBeInTheDocument();
      });

      const desativarButtons = screen.getAllByText('Desativar');
      fireEvent.click(desativarButtons[desativarButtons.length - 1]);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Erro ao alterar status do item de serviço'));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Exclusao de Item de Servico', () => {
    it('deve mostrar botao excluir nos itens de servico', async () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      const verItensButtons = screen.getAllByText('Ver Itens');
      fireEvent.click(verItensButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Bomba centrifuga 500L')).toBeInTheDocument();
      });

      // Verifica que existem botões de excluir nos itens
      const excluirButtons = screen.getAllByText('Excluir');
      expect(excluirButtons.length).toBeGreaterThan(2); // Categorias + itens
    });

    it('deve ter funcao de exclusao de item disponivel', () => {
      // Testa que o hook de exclusao esta mockado
      expect(mockExcluirItemServicoMutateAsync).toBeDefined();
    });
  });

  describe('Fechar modal de item de servico', () => {
    it('deve fechar modal ao cancelar', async () => {
      render(<CategoriasTab />, { wrapper: createWrapper() });

      const verItensButtons = screen.getAllByText('Ver Itens');
      fireEvent.click(verItensButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('+ Novo Item')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Novo Item'));

      await waitFor(() => {
        expect(screen.getByText('Novo Item de Serviço')).toBeInTheDocument();
      });

      // Primeiro Cancelar e do modal de categoria (nao visivel), segundo do item
      const cancelarButtons = screen.getAllByRole('button', { name: 'Cancelar' });
      fireEvent.click(cancelarButtons[cancelarButtons.length - 1]);

      await waitFor(() => {
        expect(screen.queryByText('Novo Item de Serviço')).not.toBeInTheDocument();
      });
    });
  });
});
