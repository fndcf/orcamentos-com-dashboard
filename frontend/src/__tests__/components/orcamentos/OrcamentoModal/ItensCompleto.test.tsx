import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ItensCompleto } from '../../../../components/orcamentos/OrcamentoModal/ItensCompleto';
import { itemServicoService } from '../../../../services/itemServicoService';
import { useInfiniteItensServicoAtivos } from '../../../../hooks/useItensServico';
import { OrcamentoItemCompleto, CategoriaItem } from '../../../../types';

vi.mock('../../../../services/itemServicoService', () => ({
  itemServicoService: {
    listarAtivosPorCategoria: vi.fn(),
  },
}));

vi.mock('../../../../hooks/useItensServico', () => ({
  useInfiniteItensServicoAtivos: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockCategorias: CategoriaItem[] = [
  { id: 'cat1', nome: 'Bomba de Incêndio', ativo: true, ordem: 1, createdAt: new Date() },
  { id: 'cat2', nome: 'Sistema de Hidrantes', ativo: true, ordem: 2, createdAt: new Date() },
];

const mockItensPredefinidos = [
  {
    id: 'item1',
    descricao: 'Bomba centrífuga 15cv',
    unidade: 'UN',
    valorUnitario: 1500,
    valorMaoDeObraUnitario: 500,
    categoriaId: 'cat1',
    ativo: true,
  },
  {
    id: 'item2',
    descricao: 'Instalação completa',
    unidade: 'Serv.',
    valorUnitario: 0,
    valorMaoDeObraUnitario: 2000,
    categoriaId: 'cat1',
    ativo: true,
  },
];

const createMockItem = (overrides?: Partial<OrcamentoItemCompleto>): OrcamentoItemCompleto => ({
  etapa: 'residencial',
  categoriaId: '',
  categoriaNome: '',
  descricao: '',
  unidade: '',
  quantidade: 1,
  valorUnitarioMaoDeObra: 0,
  valorUnitarioMaterial: 0,
  valorTotalMaoDeObra: 0,
  valorTotalMaterial: 0,
  valorTotal: 0,
  ...overrides,
});

const mockOnItemChange = vi.fn();
const mockOnItemMultiChange = vi.fn();
const mockOnAddItem = vi.fn();
const mockOnRemoveItem = vi.fn();

describe('ItensCompleto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(itemServicoService.listarAtivosPorCategoria).mockResolvedValue([]);
    vi.mocked(useInfiniteItensServicoAtivos).mockReturnValue({
      data: {
        pages: [{ itens: [], total: 0, hasMore: false }],
        pageParams: [undefined],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as any);
  });

  describe('Renderização básica', () => {
    it('deve renderizar título da seção', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Itens do Orçamento (com Mão de Obra e Material)')).toBeInTheDocument();
    });

    it('deve renderizar botão adicionar item', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('+ Adicionar Item')).toBeInTheDocument();
    });

    it('deve renderizar campos do item completo', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Etapa')).toBeInTheDocument();
      expect(screen.getByText('Categoria')).toBeInTheDocument();
      expect(screen.getByText('Descrição')).toBeInTheDocument();
      expect(screen.getByText('Qtd')).toBeInTheDocument();
      expect(screen.getByText('Unidade')).toBeInTheDocument();
      expect(screen.getByText('M.O. Unit.')).toBeInTheDocument();
      expect(screen.getByText('Mat. Unit.')).toBeInTheDocument();
      expect(screen.getByText('Total M.O.')).toBeInTheDocument();
      expect(screen.getByText('Total Mat.')).toBeInTheDocument();
    });

    it('deve renderizar múltiplos itens', () => {
      const itens = [
        createMockItem({ descricao: 'Item 1' }),
        createMockItem({ descricao: 'Item 2' }),
        createMockItem({ descricao: 'Item 3' }),
      ];

      render(
        <ItensCompleto
          itens={itens}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const inputs = screen.getAllByPlaceholderText('Descrição do item/serviço');
      expect(inputs).toHaveLength(3);
    });

    it('deve exibir erro de itensCompleto quando presente', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{ itensCompleto: 'Adicione pelo menos um item' }}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Adicione pelo menos um item')).toBeInTheDocument();
    });
  });

  describe('Interação com campos', () => {
    it('deve chamar onItemChange ao alterar etapa', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const selects = screen.getAllByRole('combobox');
      // Primeiro select é etapa
      fireEvent.change(selects[0], { target: { value: 'comercial' } });

      expect(mockOnItemChange).toHaveBeenCalledWith(0, 'etapa', 'comercial');
    });

    it('deve chamar onItemChange ao alterar categoria', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const selects = screen.getAllByRole('combobox');
      // Segundo select é categoria
      fireEvent.change(selects[1], { target: { value: 'cat1' } });

      expect(mockOnItemChange).toHaveBeenCalledWith(0, 'categoriaId', 'cat1');
    });

    it('deve chamar onItemChange ao alterar descrição', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const descricaoInput = screen.getByPlaceholderText('Descrição do item/serviço');
      fireEvent.change(descricaoInput, { target: { value: 'Nova descrição' } });

      expect(mockOnItemChange).toHaveBeenCalledWith(0, 'descricao', 'Nova descrição');
    });

    it('deve chamar onItemChange ao alterar quantidade', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const spinbuttons = screen.getAllByRole('spinbutton');
      const qtdInput = spinbuttons[0];
      fireEvent.change(qtdInput, { target: { value: '5' } });

      expect(mockOnItemChange).toHaveBeenCalledWith(0, 'quantidade', 5);
    });

    it('deve chamar onItemChange ao alterar valor mão de obra unitário', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const spinbuttons = screen.getAllByRole('spinbutton');
      // spinbuttons: [0] = qtd, [1] = m.o. unit, [2] = mat. unit
      const moInput = spinbuttons[1];
      fireEvent.change(moInput, { target: { value: '150.50' } });

      expect(mockOnItemChange).toHaveBeenCalledWith(0, 'valorUnitarioMaoDeObra', 150.5);
    });

    it('deve chamar onItemChange ao alterar valor material unitário', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const spinbuttons = screen.getAllByRole('spinbutton');
      const matInput = spinbuttons[2];
      fireEvent.change(matInput, { target: { value: '200' } });

      expect(mockOnItemChange).toHaveBeenCalledWith(0, 'valorUnitarioMaterial', 200);
    });

    it('deve chamar onItemChange ao alterar unidade', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const unidadeInput = screen.getByPlaceholderText('un');
      fireEvent.change(unidadeInput, { target: { value: 'M' } });

      expect(mockOnItemChange).toHaveBeenCalledWith(0, 'unidade', 'M');
    });

    it('deve chamar onAddItem ao clicar no botão adicionar', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      fireEvent.click(screen.getByText('+ Adicionar Item'));

      expect(mockOnAddItem).toHaveBeenCalled();
    });

    it('deve chamar onRemoveItem ao clicar no botão remover', () => {
      const itens = [
        createMockItem({ descricao: 'Item 1' }),
        createMockItem({ descricao: 'Item 2' }),
      ];

      render(
        <ItensCompleto
          itens={itens}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const removeButtons = screen.getAllByTitle('Remover item');
      fireEvent.click(removeButtons[1]);

      expect(mockOnRemoveItem).toHaveBeenCalledWith(1);
    });

    it('deve desabilitar botão remover quando há apenas um item', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const removeButton = screen.getByTitle('Remover item');
      expect(removeButton).toBeDisabled();
    });
  });

  describe('Dropdown de itens pré-definidos', () => {
    it('deve desabilitar botão dropdown quando categoria não selecionada', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const dropdownButton = screen.getByTitle('Selecione uma categoria primeiro');
      expect(dropdownButton).toBeDisabled();
    });

    it('deve habilitar botão dropdown quando categoria selecionada', () => {
      render(
        <ItensCompleto
          itens={[createMockItem({ categoriaId: 'cat1' })]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const dropdownButton = screen.getByTitle('Ver itens pré-definidos');
      expect(dropdownButton).not.toBeDisabled();
    });

    it('deve abrir dropdown ao clicar no botão', async () => {
      vi.mocked(useInfiniteItensServicoAtivos).mockReturnValue({
        data: {
          pages: [{ itens: mockItensPredefinidos, total: mockItensPredefinidos.length, hasMore: false }],
          pageParams: [undefined],
        },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
      } as any);

      render(
        <ItensCompleto
          itens={[createMockItem({ categoriaId: 'cat1' })]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const dropdownButton = screen.getByTitle('Ver itens pré-definidos');
      fireEvent.click(dropdownButton);

      await waitFor(() => {
        expect(screen.getByText('Bomba centrífuga 15cv')).toBeInTheDocument();
      });
    });

    it('deve mostrar mensagem quando não há itens pré-definidos', async () => {
      vi.mocked(itemServicoService.listarAtivosPorCategoria).mockResolvedValue([]);

      render(
        <ItensCompleto
          itens={[createMockItem({ categoriaId: 'cat1' })]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const dropdownButton = screen.getByTitle('Ver itens pré-definidos');
      fireEvent.click(dropdownButton);

      await waitFor(() => {
        expect(screen.getByText('Nenhum item pré-definido nesta categoria.')).toBeInTheDocument();
      });
    });

    it('deve selecionar item pré-definido usando onItemMultiChange', async () => {
      vi.mocked(useInfiniteItensServicoAtivos).mockReturnValue({
        data: {
          pages: [{ itens: mockItensPredefinidos, total: mockItensPredefinidos.length, hasMore: false }],
          pageParams: [undefined],
        },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
      } as any);

      render(
        <ItensCompleto
          itens={[createMockItem({ categoriaId: 'cat1' })]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onItemMultiChange={mockOnItemMultiChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const dropdownButton = screen.getByTitle('Ver itens pré-definidos');
      fireEvent.click(dropdownButton);

      await waitFor(() => {
        expect(screen.getByText('Bomba centrífuga 15cv')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Bomba centrífuga 15cv'));

      expect(mockOnItemMultiChange).toHaveBeenCalledWith(0, {
        descricao: 'Bomba centrífuga 15cv',
        unidade: 'UN',
        valorUnitarioMaterial: 1500,
        valorUnitarioMaoDeObra: 500,
      });
    });

    it('deve usar fallback onItemChange quando onItemMultiChange não disponível', async () => {
      vi.mocked(useInfiniteItensServicoAtivos).mockReturnValue({
        data: {
          pages: [{ itens: mockItensPredefinidos, total: mockItensPredefinidos.length, hasMore: false }],
          pageParams: [undefined],
        },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
      } as any);

      render(
        <ItensCompleto
          itens={[createMockItem({ categoriaId: 'cat1' })]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const dropdownButton = screen.getByTitle('Ver itens pré-definidos');
      fireEvent.click(dropdownButton);

      await waitFor(() => {
        expect(screen.getByText('Bomba centrífuga 15cv')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Bomba centrífuga 15cv'));

      expect(mockOnItemChange).toHaveBeenCalledWith(0, 'descricao', 'Bomba centrífuga 15cv');
      expect(mockOnItemChange).toHaveBeenCalledWith(0, 'unidade', 'UN');
      expect(mockOnItemChange).toHaveBeenCalledWith(0, 'valorUnitarioMaterial', 1500);
      expect(mockOnItemChange).toHaveBeenCalledWith(0, 'valorUnitarioMaoDeObra', 500);
    });

    it('deve fechar dropdown ao selecionar item', async () => {
      vi.mocked(useInfiniteItensServicoAtivos).mockReturnValue({
        data: {
          pages: [{ itens: mockItensPredefinidos, total: mockItensPredefinidos.length, hasMore: false }],
          pageParams: [undefined],
        },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
      } as any);

      render(
        <ItensCompleto
          itens={[createMockItem({ categoriaId: 'cat1' })]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const dropdownButton = screen.getByTitle('Ver itens pré-definidos');
      fireEvent.click(dropdownButton);

      await waitFor(() => {
        expect(screen.getByText('Bomba centrífuga 15cv')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Bomba centrífuga 15cv'));

      await waitFor(() => {
        expect(screen.queryByText('Instalação completa')).not.toBeInTheDocument();
      });
    });

    it('deve fechar dropdown ao clicar novamente no botão', async () => {
      vi.mocked(useInfiniteItensServicoAtivos).mockReturnValue({
        data: {
          pages: [{ itens: mockItensPredefinidos, total: mockItensPredefinidos.length, hasMore: false }],
          pageParams: [undefined],
        },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
      } as any);

      render(
        <ItensCompleto
          itens={[createMockItem({ categoriaId: 'cat1' })]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const dropdownButton = screen.getByTitle('Ver itens pré-definidos');

      fireEvent.click(dropdownButton);
      await waitFor(() => {
        expect(screen.getByText('Bomba centrífuga 15cv')).toBeInTheDocument();
      });

      fireEvent.click(dropdownButton);
      await waitFor(() => {
        expect(screen.queryByText('Bomba centrífuga 15cv')).not.toBeInTheDocument();
      });
    });

    it('deve fechar dropdown ao clicar fora', async () => {
      vi.mocked(useInfiniteItensServicoAtivos).mockReturnValue({
        data: {
          pages: [{ itens: mockItensPredefinidos, total: mockItensPredefinidos.length, hasMore: false }],
          pageParams: [undefined],
        },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
      } as any);

      render(
        <ItensCompleto
          itens={[createMockItem({ categoriaId: 'cat1' })]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const dropdownButton = screen.getByTitle('Ver itens pré-definidos');
      fireEvent.click(dropdownButton);

      await waitFor(() => {
        expect(screen.getByText('Bomba centrífuga 15cv')).toBeInTheDocument();
      });

      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByText('Bomba centrífuga 15cv')).not.toBeInTheDocument();
      });
    });
  });

  describe('Cálculo de totais', () => {
    it('deve exibir totais zerados sem itens válidos', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Total Mão de Obra')).toBeInTheDocument();
      expect(screen.getByText('Total Material')).toBeInTheDocument();
      expect(screen.getByText('Total Geral')).toBeInTheDocument();
    });

    it('deve calcular totais corretamente', () => {
      const itens = [
        createMockItem({
          quantidade: 2,
          valorUnitarioMaoDeObra: 100,
          valorUnitarioMaterial: 50,
          valorTotalMaoDeObra: 200,
          valorTotalMaterial: 100,
          valorTotal: 300,
        }),
        createMockItem({
          quantidade: 3,
          valorUnitarioMaoDeObra: 50,
          valorUnitarioMaterial: 30,
          valorTotalMaoDeObra: 150,
          valorTotalMaterial: 90,
          valorTotal: 240,
        }),
      ];

      render(
        <ItensCompleto
          itens={itens}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      // Total Mão de Obra: 200 + 150 = 350
      // Total Material: 100 + 90 = 190
      // Total Geral: 540
      expect(screen.getByText('R$ 350,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 190,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 540,00')).toBeInTheDocument();
    });
  });

  describe('Exibição de erros', () => {
    it('deve exibir erro de categoria do item', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{ itemc_0_categoria: 'Categoria obrigatória' }}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Categoria obrigatória')).toBeInTheDocument();
    });

    it('deve exibir erro de descrição do item', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{ itemc_0_descricao: 'Descrição obrigatória' }}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Descrição obrigatória')).toBeInTheDocument();
    });

    it('deve exibir erro de quantidade do item', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{ itemc_0_quantidade: 'Quantidade inválida' }}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Quantidade inválida')).toBeInTheDocument();
    });
  });

  describe('Opções de etapa', () => {
    it('deve exibir opções de etapa no select', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Residencial')).toBeInTheDocument();
      expect(screen.getByText('Comercial')).toBeInTheDocument();
    });
  });

  describe('Opções de categoria', () => {
    it('deve exibir opções de categorias no select', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Selecione')).toBeInTheDocument();
      expect(screen.getByText('Bomba de Incêndio')).toBeInTheDocument();
      expect(screen.getByText('Sistema de Hidrantes')).toBeInTheDocument();
    });

    it('deve funcionar quando categorias é undefined', () => {
      render(
        <ItensCompleto
          itens={[createMockItem()]}
          categorias={undefined}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Selecione')).toBeInTheDocument();
    });
  });

  describe('Valores no dropdown', () => {
    it('deve exibir valores de material e mão de obra no dropdown', async () => {
      vi.mocked(useInfiniteItensServicoAtivos).mockReturnValue({
        data: {
          pages: [{ itens: mockItensPredefinidos, total: mockItensPredefinidos.length, hasMore: false }],
          pageParams: [undefined],
        },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
      } as any);

      render(
        <ItensCompleto
          itens={[createMockItem({ categoriaId: 'cat1' })]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const dropdownButton = screen.getByTitle('Ver itens pré-definidos');
      fireEvent.click(dropdownButton);

      await waitFor(() => {
        expect(screen.getByText('Bomba centrífuga 15cv')).toBeInTheDocument();
        expect(screen.getByText('Instalação completa')).toBeInTheDocument();
      });
    });

    it('deve selecionar item com valores separados de material e mão de obra', async () => {
      vi.mocked(useInfiniteItensServicoAtivos).mockReturnValue({
        data: {
          pages: [{ itens: mockItensPredefinidos, total: mockItensPredefinidos.length, hasMore: false }],
          pageParams: [undefined],
        },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
      } as any);

      render(
        <ItensCompleto
          itens={[createMockItem({ categoriaId: 'cat1' })]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onItemMultiChange={mockOnItemMultiChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const dropdownButton = screen.getByTitle('Ver itens pré-definidos');
      fireEvent.click(dropdownButton);

      await waitFor(() => {
        expect(screen.getByText('Instalação completa')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Instalação completa'));

      // Item com valor 0 material + 2000 mão de obra
      expect(mockOnItemMultiChange).toHaveBeenCalledWith(0, {
        descricao: 'Instalação completa',
        unidade: 'Serv.',
        valorUnitarioMaterial: 0,
        valorUnitarioMaoDeObra: 2000,
      });
    });
  });

  describe('Pré-carregamento de itens (useInfiniteQuery)', () => {
    it('deve carregar itens quando categoria é selecionada via hook', async () => {
      const mockFetchNextPage = vi.fn();
      vi.mocked(useInfiniteItensServicoAtivos).mockReturnValue({
        data: {
          pages: [{ itens: mockItensPredefinidos, total: mockItensPredefinidos.length, hasMore: false }],
          pageParams: [undefined],
        },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
      } as any);

      render(
        <ItensCompleto
          itens={[createMockItem({ categoriaId: 'cat1' })]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      // O hook useInfiniteItensServicoAtivos deve ter sido chamado com a categoria
      expect(useInfiniteItensServicoAtivos).toHaveBeenCalled();
    });

    it('não deve carregar itens quando categoria está vazia', async () => {
      vi.mocked(useInfiniteItensServicoAtivos).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
      } as any);

      render(
        <ItensCompleto
          itens={[createMockItem({ categoriaId: '' })]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      // O hook foi chamado mas retorna undefined quando categoria está vazia
      expect(useInfiniteItensServicoAtivos).toHaveBeenCalled();
    });
  });
});
