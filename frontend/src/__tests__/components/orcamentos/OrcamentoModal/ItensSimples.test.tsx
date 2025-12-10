import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ItensSimples } from '../../../../components/orcamentos/OrcamentoModal/ItensSimples';
import { useItensServicoAtivosPorCategoria } from '../../../../hooks/useItensServico';
import { OrcamentoItem, CategoriaItem } from '../../../../types';

vi.mock('../../../../hooks/useItensServico', () => ({
  useItensServicoAtivosPorCategoria: vi.fn(),
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
  { id: 'cat1', nome: 'Bomba de Incêndio', ativo: true, ordem: 1 },
  { id: 'cat2', nome: 'Sistema de Hidrantes', ativo: true, ordem: 2 },
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

const createMockItem = (overrides?: Partial<OrcamentoItem>): OrcamentoItem => ({
  descricao: '',
  quantidade: 1,
  unidade: '',
  valorUnitario: 0,
  valorTotal: 0,
  categoriaId: '',
  ...overrides,
});

const mockOnItemChange = vi.fn();
const mockOnItemMultiChange = vi.fn();
const mockOnAddItem = vi.fn();
const mockOnRemoveItem = vi.fn();

describe('ItensSimples', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useItensServicoAtivosPorCategoria).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
  });

  describe('Renderização básica', () => {
    it('deve renderizar título da seção', () => {
      render(
        <ItensSimples
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Itens do Orçamento')).toBeInTheDocument();
    });

    it('deve renderizar botão adicionar item', () => {
      render(
        <ItensSimples
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

    it('deve renderizar campos do item', () => {
      render(
        <ItensSimples
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Categoria')).toBeInTheDocument();
      expect(screen.getByText('Descrição')).toBeInTheDocument();
      expect(screen.getByText('Qtd')).toBeInTheDocument();
      expect(screen.getByText('Unidade')).toBeInTheDocument();
      expect(screen.getByText('Valor Unit.')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('deve renderizar múltiplos itens', () => {
      const itens = [
        createMockItem({ descricao: 'Item 1' }),
        createMockItem({ descricao: 'Item 2' }),
        createMockItem({ descricao: 'Item 3' }),
      ];

      render(
        <ItensSimples
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

    it('deve exibir erro de itens quando presente', () => {
      render(
        <ItensSimples
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{ itens: 'Adicione pelo menos um item' }}
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
    it('deve chamar onItemChange ao alterar descrição', () => {
      render(
        <ItensSimples
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
        <ItensSimples
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
      const qtdInput = spinbuttons[0]; // primeiro spinbutton é quantidade
      fireEvent.change(qtdInput, { target: { value: '5' } });

      expect(mockOnItemChange).toHaveBeenCalledWith(0, 'quantidade', 5);
    });

    it('deve chamar onItemChange ao alterar valor unitário', () => {
      render(
        <ItensSimples
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const inputs = screen.getAllByRole('spinbutton');
      const valorInput = inputs[1]; // segundo spinbutton é valor unitário
      fireEvent.change(valorInput, { target: { value: '150.50' } });

      expect(mockOnItemChange).toHaveBeenCalledWith(0, 'valorUnitario', 150.5);
    });

    it('deve chamar onItemChange ao alterar unidade', () => {
      render(
        <ItensSimples
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      const unidadeInput = screen.getByPlaceholderText('Serv.');
      fireEvent.change(unidadeInput, { target: { value: 'UN' } });

      expect(mockOnItemChange).toHaveBeenCalledWith(0, 'unidade', 'UN');
    });

    it('deve chamar onItemChange ao alterar categoria', () => {
      render(
        <ItensSimples
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
      fireEvent.change(selects[0], { target: { value: 'cat1' } });

      expect(mockOnItemChange).toHaveBeenCalledWith(0, 'categoriaId', 'cat1');
    });

    it('deve chamar onAddItem ao clicar no botão adicionar', () => {
      render(
        <ItensSimples
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
        <ItensSimples
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
        <ItensSimples
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
        <ItensSimples
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
        <ItensSimples
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
      vi.mocked(useItensServicoAtivosPorCategoria).mockReturnValue({
        data: mockItensPredefinidos,
        isLoading: false,
      } as any);

      render(
        <ItensSimples
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
      vi.mocked(useItensServicoAtivosPorCategoria).mockReturnValue({
        data: [],
        isLoading: false,
      } as any);

      render(
        <ItensSimples
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
      vi.mocked(useItensServicoAtivosPorCategoria).mockReturnValue({
        data: mockItensPredefinidos,
        isLoading: false,
      } as any);

      render(
        <ItensSimples
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
        valorUnitario: 2000, // 1500 + 500
      });
    });

    it('deve usar fallback onItemChange quando onItemMultiChange não disponível', async () => {
      vi.mocked(useItensServicoAtivosPorCategoria).mockReturnValue({
        data: mockItensPredefinidos,
        isLoading: false,
      } as any);

      render(
        <ItensSimples
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
      expect(mockOnItemChange).toHaveBeenCalledWith(0, 'valorUnitario', 2000);
    });

    it('deve fechar dropdown ao selecionar item', async () => {
      vi.mocked(useItensServicoAtivosPorCategoria).mockReturnValue({
        data: mockItensPredefinidos,
        isLoading: false,
      } as any);

      render(
        <ItensSimples
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
      vi.mocked(useItensServicoAtivosPorCategoria).mockReturnValue({
        data: mockItensPredefinidos,
        isLoading: false,
      } as any);

      render(
        <ItensSimples
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

      // Abre
      fireEvent.click(dropdownButton);
      await waitFor(() => {
        expect(screen.getByText('Bomba centrífuga 15cv')).toBeInTheDocument();
      });

      // Fecha
      fireEvent.click(dropdownButton);
      await waitFor(() => {
        expect(screen.queryByText('Bomba centrífuga 15cv')).not.toBeInTheDocument();
      });
    });

    it('deve fechar dropdown ao clicar fora', async () => {
      vi.mocked(useItensServicoAtivosPorCategoria).mockReturnValue({
        data: mockItensPredefinidos,
        isLoading: false,
      } as any);

      render(
        <ItensSimples
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

      // Simula clique fora do dropdown
      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByText('Bomba centrífuga 15cv')).not.toBeInTheDocument();
      });
    });
  });

  describe('Cálculo de totais', () => {
    it('deve exibir total do orçamento como R$ 0,00 sem itens válidos', () => {
      render(
        <ItensSimples
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Total do Orçamento:')).toBeInTheDocument();
      expect(screen.getByText('R$ 0,00')).toBeInTheDocument();
    });

    it('deve calcular e exibir total correto', () => {
      const itens = [
        createMockItem({ quantidade: 2, valorUnitario: 100, valorTotal: 200 }),
        createMockItem({ quantidade: 3, valorUnitario: 50, valorTotal: 150 }),
      ];

      render(
        <ItensSimples
          itens={itens}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('R$ 350,00')).toBeInTheDocument();
    });

    it('deve exibir total do item calculado', () => {
      const itens = [
        createMockItem({ quantidade: 5, valorUnitario: 100, valorTotal: 500 }),
      ];

      render(
        <ItensSimples
          itens={itens}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      // O total do item é exibido como campo disabled
      const totalInputs = screen.getAllByDisplayValue('R$ 500,00');
      expect(totalInputs.length).toBeGreaterThan(0);
    });
  });

  describe('Exibição de erros', () => {
    it('deve exibir erro de descrição do item', () => {
      render(
        <ItensSimples
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{ item_0_descricao: 'Descrição obrigatória' }}
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
        <ItensSimples
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{ item_0_quantidade: 'Quantidade inválida' }}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Quantidade inválida')).toBeInTheDocument();
    });

    it('deve exibir erro de valor do item', () => {
      render(
        <ItensSimples
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{ item_0_valor: 'Valor inválido' }}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Valor inválido')).toBeInTheDocument();
    });
  });

  describe('Exibição de valores no dropdown', () => {
    it('deve exibir itens pré-definidos com valores no dropdown', async () => {
      vi.mocked(useItensServicoAtivosPorCategoria).mockReturnValue({
        data: mockItensPredefinidos,
        isLoading: false,
      } as any);

      render(
        <ItensSimples
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
        // Verifica que o item aparece no dropdown
        expect(screen.getByText('Bomba centrífuga 15cv')).toBeInTheDocument();
        expect(screen.getByText('Instalação completa')).toBeInTheDocument();
      });
    });

    it('deve selecionar item e calcular valor com material e mão de obra', async () => {
      vi.mocked(useItensServicoAtivosPorCategoria).mockReturnValue({
        data: mockItensPredefinidos,
        isLoading: false,
      } as any);

      render(
        <ItensSimples
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

      // Item com valor 1500 material + 500 mão de obra = 2000
      expect(mockOnItemMultiChange).toHaveBeenCalledWith(0, {
        descricao: 'Bomba centrífuga 15cv',
        unidade: 'UN',
        valorUnitario: 2000,
      });
    });

    it('deve selecionar item e calcular valor somente com mão de obra', async () => {
      vi.mocked(useItensServicoAtivosPorCategoria).mockReturnValue({
        data: mockItensPredefinidos,
        isLoading: false,
      } as any);

      render(
        <ItensSimples
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

      // Item com valor 0 material + 2000 mão de obra = 2000
      expect(mockOnItemMultiChange).toHaveBeenCalledWith(0, {
        descricao: 'Instalação completa',
        unidade: 'Serv.',
        valorUnitario: 2000,
      });
    });
  });

  describe('Opção de categoria', () => {
    it('deve exibir opções de categorias no select', () => {
      render(
        <ItensSimples
          itens={[createMockItem()]}
          categorias={mockCategorias}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Selecione (opcional)')).toBeInTheDocument();
      expect(screen.getByText('Bomba de Incêndio')).toBeInTheDocument();
      expect(screen.getByText('Sistema de Hidrantes')).toBeInTheDocument();
    });

    it('deve funcionar quando categorias é undefined', () => {
      render(
        <ItensSimples
          itens={[createMockItem()]}
          categorias={undefined}
          errors={{}}
          onItemChange={mockOnItemChange}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Selecione (opcional)')).toBeInTheDocument();
    });
  });
});
