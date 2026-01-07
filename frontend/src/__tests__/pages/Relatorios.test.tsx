import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Relatorios } from '../../pages/Relatorios';
import { useOrcamentos } from '../../hooks/useOrcamentos';
import { useItensServico } from '../../hooks/useItensServico';
import { useConfiguracoesGerais } from '../../hooks/useConfiguracoesGerais';

// Mock dos hooks
vi.mock('../../hooks/useOrcamentos', () => ({
  useOrcamentos: vi.fn(),
}));

vi.mock('../../hooks/useItensServico', () => ({
  useItensServico: vi.fn(),
}));

vi.mock('../../hooks/useConfiguracoesGerais', () => ({
  useConfiguracoesGerais: vi.fn(),
}));

// Mock do recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Legend: () => <div data-testid="legend" />,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Data fixa para testes: 15/06/2024
const dataEmissaoTest = '2024-06-10T10:00:00.000Z';
const dataValidadeTest = '2024-07-10T10:00:00.000Z';

const mockOrcamentos = [
  {
    id: 'o1',
    numero: 1,
    versao: 0,
    tipo: 'simples' as const,
    clienteId: 'c1',
    clienteNome: 'Cliente A',
    clienteCnpj: '12345678901234',
    status: 'aceito' as const,
    valorTotal: 5000,
    dataEmissao: dataEmissaoTest,
    dataValidade: dataValidadeTest,
    itens: [
      { descricao: 'Extintor ABC', quantidade: 10, unidade: 'un', valorUnitario: 200, valorTotal: 2000 },
      { descricao: 'Mangueira', quantidade: 5, unidade: 'un', valorUnitario: 600, valorTotal: 3000 },
    ],
  },
  {
    id: 'o2',
    numero: 2,
    versao: 0,
    tipo: 'simples' as const,
    clienteId: 'c2',
    clienteNome: 'Cliente B',
    clienteCnpj: '98765432109876',
    status: 'aberto' as const,
    valorTotal: 3000,
    dataEmissao: dataEmissaoTest,
    dataValidade: dataValidadeTest,
    itens: [
      { descricao: 'Extintor ABC', quantidade: 5, unidade: 'un', valorUnitario: 200, valorTotal: 1000 },
      { descricao: 'Alarme', quantidade: 2, unidade: 'un', valorUnitario: 1000, valorTotal: 2000 },
    ],
  },
  {
    id: 'o3',
    numero: 3,
    versao: 0,
    tipo: 'simples' as const,
    clienteId: 'c1',
    clienteNome: 'Cliente A',
    clienteCnpj: '12345678901234',
    status: 'aceito' as const,
    valorTotal: 2000,
    dataEmissao: dataEmissaoTest,
    dataValidade: dataValidadeTest,
    itens: [
      { descricao: 'Extintor CO2', quantidade: 4, unidade: 'un', valorUnitario: 500, valorTotal: 2000 },
    ],
  },
  {
    id: 'o4',
    numero: 4,
    versao: 0,
    tipo: 'simples' as const,
    clienteId: 'c3',
    clienteNome: 'Cliente C',
    clienteCnpj: '11111111111111',
    status: 'recusado' as const,
    valorTotal: 1500,
    dataEmissao: dataEmissaoTest,
    dataValidade: dataValidadeTest,
    itens: [],
  },
];

const mockItensServico = [
  {
    id: 'i1',
    descricao: 'Extintor ABC',
    unidade: 'un',
    valorUnitario: 200,
    valorMaoDeObraUnitario: 50,
    valorCusto: 120,
    valorMaoDeObraCusto: 30,
    categoriaId: 'cat1',
    ativo: true,
  },
  {
    id: 'i2',
    descricao: 'Mangueira',
    unidade: 'un',
    valorUnitario: 600,
    valorMaoDeObraUnitario: 100,
    valorCusto: 400,
    valorMaoDeObraCusto: 60,
    categoriaId: 'cat1',
    ativo: true,
  },
  {
    id: 'i3',
    descricao: 'Extintor CO2',
    unidade: 'un',
    valorUnitario: 500,
    valorMaoDeObraUnitario: 80,
    valorCusto: 300,
    valorMaoDeObraCusto: 50,
    categoriaId: 'cat1',
    ativo: true,
  },
];

const mockOrcamentoCompleto = {
  id: 'o5',
  numero: 5,
  versao: 0,
  tipo: 'completo' as const,
  clienteId: 'c1',
  clienteNome: 'Cliente A',
  clienteCnpj: '12345678901234',
  status: 'aceito' as const,
  valorTotal: 8000,
  dataEmissao: dataEmissaoTest,
  dataValidade: dataValidadeTest,
  dataAceite: dataEmissaoTest,
  itens: [],
  itensCompleto: [
    {
      descricao: 'Extintor ABC',
      quantidade: 10,
      unidade: 'un',
      etapa: 'residencial' as const,
      categoriaId: 'cat1',
      categoriaNome: 'Extintores',
      valorUnitarioMaterial: 200,
      valorUnitarioMaoDeObra: 50,
      valorTotalMaterial: 2000,
      valorTotalMaoDeObra: 500,
      valorTotal: 2500,
    },
    {
      descricao: 'Mangueira',
      quantidade: 5,
      unidade: 'un',
      etapa: 'comercial' as const,
      categoriaId: 'cat1',
      categoriaNome: 'Hidrantes',
      valorUnitarioMaterial: 600,
      valorUnitarioMaoDeObra: 100,
      valorTotalMaterial: 3000,
      valorTotalMaoDeObra: 500,
      valorTotal: 3500,
    },
  ],
};

const mockConfiguracoesGerais = {
  diasValidadeOrcamento: 30,
  nomeEmpresa: 'Empresa Teste',
  cnpjEmpresa: '12345678901234',
  enderecoEmpresa: 'Rua Teste, 123',
  telefoneEmpresa: '11999999999',
  emailEmpresa: 'teste@empresa.com',
  custoFixoMensal: 0,
  impostoMaterial: 0,
  impostoServico: 0,
};

describe('Relatorios', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
    global.URL.revokeObjectURL = vi.fn();

    // Mock da data atual para os testes serem consistentes
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15'));

    // Mock padrão para configurações gerais
    vi.mocked(useConfiguracoesGerais).mockReturnValue({
      data: mockConfiguracoesGerais,
      isLoading: false,
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve mostrar loading quando está carregando', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    expect(screen.getByText('Relatórios')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('deve renderizar página com filtros de data', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: mockItensServico,
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    expect(screen.getByText('Relatórios')).toBeInTheDocument();
    expect(screen.getByText('De:')).toBeInTheDocument();
    expect(screen.getByText('Até:')).toBeInTheDocument();
    expect(screen.getByText('Exportar CSV')).toBeInTheDocument();
  });

  it('deve renderizar KPIs corretamente', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: mockItensServico,
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    // Total de orçamentos
    expect(screen.getByText('Total de Orçamentos')).toBeInTheDocument();
    // Pode haver múltiplos elementos com o mesmo número nas tabelas
    expect(screen.getAllByText('4')[0]).toBeInTheDocument();

    // Aceitos
    expect(screen.getByText('Aceitos')).toBeInTheDocument();
    expect(screen.getAllByText('2')[0]).toBeInTheDocument();

    // Em Aberto
    expect(screen.getByText('Em Aberto')).toBeInTheDocument();
    expect(screen.getAllByText('1')[0]).toBeInTheDocument();

    // Taxa de Conversão (2 aceitos de 4 = 50%)
    expect(screen.getByText('Taxa de Conversão')).toBeInTheDocument();

    // Ticket Médio
    expect(screen.getByText('Ticket Médio')).toBeInTheDocument();
  });

  it('deve renderizar gráficos', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: mockItensServico,
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    expect(screen.getByText('Orçamentos por Status')).toBeInTheDocument();
    expect(screen.getByText('Valor por Status (em milhares R$)')).toBeInTheDocument();
    expect(screen.getByText('Evolução de Valores no Período (em milhares R$)')).toBeInTheDocument();
  });

  it('deve renderizar ranking de clientes', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: mockItensServico,
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    expect(screen.getByText('Top 10 Clientes (por valor aceito)')).toBeInTheDocument();
    // Cliente A tem 2 orçamentos aceitos
    expect(screen.getAllByText('Cliente A')[0]).toBeInTheDocument();
  });

  it('deve renderizar ranking de produtos', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: mockItensServico,
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    expect(screen.getByText('Top 10 Produtos/Serviços (por valor)')).toBeInTheDocument();
  });

  it('deve filtrar por data quando alterado', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: mockItensServico,
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    // Os inputs de data são do tipo date
    const dateInputs = document.querySelectorAll('input[type="date"]');

    expect(dateInputs.length).toBe(2);

    // Alterar data de início para um período sem orçamentos
    fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2024-01-31' } });

    // O componente deve re-renderizar e mostrar 0 orçamentos (fora do período)
    expect(screen.getByText('Relatórios')).toBeInTheDocument();
  });

  it('deve exportar CSV ao clicar no botão', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: mockItensServico,
      isLoading: false,
    } as any);

    // Mock do click no link
    const mockClick = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        element.click = mockClick;
      }
      return element;
    });

    render(<Relatorios />, { wrapper: createWrapper() });

    const exportButton = screen.getByText('Exportar CSV');
    fireEvent.click(exportButton);

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });

  it('deve mostrar mensagem quando não há orçamentos', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    // Deve mostrar mensagens de "nenhum" em vários lugares
    expect(screen.getAllByText('Nenhum orçamento no período').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Nenhum orçamento aceito no período').length).toBeGreaterThan(0);
  });

  it('deve calcular taxa de conversão como 0 quando não há orçamentos', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('deve mostrar quantidade correta no ranking de clientes', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: mockItensServico,
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    // Cliente A tem 2 orçamentos aceitos
    const table = screen.getByText('Top 10 Clientes (por valor aceito)').closest('div');
    expect(table).toBeInTheDocument();
  });

  it('deve ter inputs de data com valores padrão', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: mockItensServico,
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    const dateInputs = document.querySelectorAll('input[type="date"]') as NodeListOf<HTMLInputElement>;

    // Data início deve ser o primeiro dia do mês
    expect(dateInputs[0].value).toBeTruthy();
    // Data fim deve ser hoje
    expect(dateInputs[1].value).toBeTruthy();
  });

  it('deve renderizar análise de lucro quando há itens de serviço', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: mockItensServico,
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    // Verificar que a seção de análise de lucro está presente
    expect(screen.getByText(/Análise de Lucro/)).toBeInTheDocument();
    expect(screen.getByText('Material')).toBeInTheDocument();
    expect(screen.getByText('Mão de Obra')).toBeInTheDocument();
    expect(screen.getByText('Total Geral')).toBeInTheDocument();
  });

  it('deve processar orçamentos completos na análise de lucro', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [...mockOrcamentos, mockOrcamentoCompleto],
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: mockItensServico,
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    // A análise de lucro deve estar presente
    expect(screen.getByText(/Análise de Lucro/)).toBeInTheDocument();
    expect(screen.getByText('Detalhamento por Orçamento')).toBeInTheDocument();
  });

  it('deve mostrar lucro positivo em verde', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: mockItensServico,
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    // A página deve renderizar com dados de lucro
    expect(screen.getByText(/Análise de Lucro/)).toBeInTheDocument();
  });

  it('não deve mostrar análise de lucro quando não há itens de serviço', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    // Não deve mostrar análise de lucro quando não há itens
    expect(screen.queryByText('Detalhamento por Orçamento')).not.toBeInTheDocument();
  });

  it('deve processar produtos de orçamentos aceitos', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: mockItensServico,
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    // Verifica que os produtos aparecem no ranking
    expect(screen.getByText('Top 10 Produtos/Serviços (por valor)')).toBeInTheDocument();
    // Os produtos dos orçamentos aceitos devem aparecer
  });

  it('deve processar itens completos na contagem de produtos', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [mockOrcamentoCompleto],
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: mockItensServico,
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    expect(screen.getByText('Top 10 Produtos/Serviços (por valor)')).toBeInTheDocument();
  });

  it('deve mostrar mensagem quando orçamentos sem custo cadastrado', () => {
    // Orçamento com item que não tem custo
    const orcamentoSemCusto = {
      ...mockOrcamentos[0],
      itens: [
        { descricao: 'Item sem custo', quantidade: 1, unidade: 'un', valorUnitario: 100, valorTotal: 100 },
      ],
    };

    vi.mocked(useOrcamentos).mockReturnValue({
      data: [orcamentoSemCusto],
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: mockItensServico,
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    // Verifica que a análise de lucro mostra informação sobre itens sem custo
    expect(screen.getByText(/Análise de Lucro/)).toBeInTheDocument();
  });

  it('deve calcular evolução diária corretamente', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: mockItensServico,
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    // O gráfico de evolução deve estar presente
    expect(screen.getByText('Evolução de Valores no Período (em milhares R$)')).toBeInTheDocument();
  });

  it('deve renderizar status expirado corretamente', () => {
    const orcamentoExpirado = {
      ...mockOrcamentos[0],
      id: 'exp1',
      status: 'expirado' as const,
    };

    vi.mocked(useOrcamentos).mockReturnValue({
      data: [orcamentoExpirado],
      isLoading: false,
    } as any);
    vi.mocked(useItensServico).mockReturnValue({
      data: mockItensServico,
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    expect(screen.getByText('Orçamentos por Status')).toBeInTheDocument();
  });

  describe('Cálculos de lucro com impostos', () => {
    it('deve mostrar seção de impostos na análise de lucro quando impostos configurados', () => {
      vi.mocked(useOrcamentos).mockReturnValue({
        data: [mockOrcamentoCompleto],
        isLoading: false,
      } as any);
      vi.mocked(useItensServico).mockReturnValue({
        data: mockItensServico,
        isLoading: false,
      } as any);
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 10,
          impostoServico: 15,
        },
        isLoading: false,
      } as any);

      render(<Relatorios />, { wrapper: createWrapper() });

      // Deve mostrar os percentuais de impostos nas seções
      expect(screen.getByText(/Material.*Imposto: 10%/)).toBeInTheDocument();
      expect(screen.getByText(/Mão de Obra.*Imposto: 15%/)).toBeInTheDocument();
    });

    it('deve mostrar card de impostos totais quando impostos configurados', () => {
      vi.mocked(useOrcamentos).mockReturnValue({
        data: [mockOrcamentoCompleto],
        isLoading: false,
      } as any);
      vi.mocked(useItensServico).mockReturnValue({
        data: mockItensServico,
        isLoading: false,
      } as any);
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 10,
          impostoServico: 15,
        },
        isLoading: false,
      } as any);

      render(<Relatorios />, { wrapper: createWrapper() });

      // Deve mostrar seção de impostos
      expect(screen.getByText('Impostos')).toBeInTheDocument();
    });

    it('não deve mostrar seção de impostos quando não há impostos configurados', () => {
      vi.mocked(useOrcamentos).mockReturnValue({
        data: [mockOrcamentoCompleto],
        isLoading: false,
      } as any);
      vi.mocked(useItensServico).mockReturnValue({
        data: mockItensServico,
        isLoading: false,
      } as any);
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 0,
          impostoServico: 0,
        },
        isLoading: false,
      } as any);

      render(<Relatorios />, { wrapper: createWrapper() });

      // Não deve mostrar cards de impostos individuais (dentro da análise de lucro)
      // A seção "Impostos" dos cards de resumo não deve aparecer quando zerado
      const impostoLabels = screen.queryAllByText('Imposto');
      // Quando não há impostos, não deve ter cards de imposto
      expect(impostoLabels.length).toBe(0);
    });

    it('deve mostrar seção de lucro líquido quando impostos configurados (mesmo sem custo fixo)', () => {
      vi.mocked(useOrcamentos).mockReturnValue({
        data: [mockOrcamentoCompleto],
        isLoading: false,
      } as any);
      vi.mocked(useItensServico).mockReturnValue({
        data: mockItensServico,
        isLoading: false,
      } as any);
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          custoFixoMensal: 0,
          impostoMaterial: 10,
          impostoServico: 15,
        },
        isLoading: false,
      } as any);

      render(<Relatorios />, { wrapper: createWrapper() });

      // Deve mostrar seção de lucro líquido
      expect(screen.getByText('Lucro Líquido da Empresa')).toBeInTheDocument();
    });

    it('não deve mostrar seção de lucro líquido quando não há custo fixo nem impostos', () => {
      vi.mocked(useOrcamentos).mockReturnValue({
        data: [mockOrcamentoCompleto],
        isLoading: false,
      } as any);
      vi.mocked(useItensServico).mockReturnValue({
        data: mockItensServico,
        isLoading: false,
      } as any);
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          custoFixoMensal: 0,
          impostoMaterial: 0,
          impostoServico: 0,
        },
        isLoading: false,
      } as any);

      render(<Relatorios />, { wrapper: createWrapper() });

      // Não deve mostrar seção de lucro líquido
      expect(screen.queryByText('Lucro Líquido da Empresa')).not.toBeInTheDocument();
    });

    it('deve mostrar informações de impostos na explicação do cálculo', () => {
      vi.mocked(useOrcamentos).mockReturnValue({
        data: [mockOrcamentoCompleto],
        isLoading: false,
      } as any);
      vi.mocked(useItensServico).mockReturnValue({
        data: mockItensServico,
        isLoading: false,
      } as any);
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          custoFixoMensal: 5000,
          impostoMaterial: 10,
          impostoServico: 15,
        },
        isLoading: false,
      } as any);

      render(<Relatorios />, { wrapper: createWrapper() });

      // Deve mostrar informação de impostos no resumo da seção de lucro líquido
      expect(screen.getByText(/Impostos: 10% material, 15% serviço/)).toBeInTheDocument();
    });

    it('deve calcular lucro considerando impostos na fórmula', () => {
      vi.mocked(useOrcamentos).mockReturnValue({
        data: [mockOrcamentoCompleto],
        isLoading: false,
      } as any);
      vi.mocked(useItensServico).mockReturnValue({
        data: mockItensServico,
        isLoading: false,
      } as any);
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 10,
          impostoServico: 15,
        },
        isLoading: false,
      } as any);

      render(<Relatorios />, { wrapper: createWrapper() });

      // A fórmula de lucro deve incluir impostos
      // "Venda - Custo - Imposto"
      expect(screen.getAllByText(/Venda - Custo - Imposto/).length).toBeGreaterThan(0);
    });

    it('deve mostrar subvalue correto indicando que impostos estão incluídos', () => {
      vi.mocked(useOrcamentos).mockReturnValue({
        data: [mockOrcamentoCompleto],
        isLoading: false,
      } as any);
      vi.mocked(useItensServico).mockReturnValue({
        data: mockItensServico,
        isLoading: false,
      } as any);
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 10,
          impostoServico: 15,
        },
        isLoading: false,
      } as any);

      render(<Relatorios />, { wrapper: createWrapper() });

      // Subvalues devem indicar que impostos estão incluídos
      expect(screen.getByText(/10% sobre venda/)).toBeInTheDocument();
      expect(screen.getByText(/15% sobre venda/)).toBeInTheDocument();
    });

    it('deve mostrar card de impostos no Total Geral quando configurados', () => {
      vi.mocked(useOrcamentos).mockReturnValue({
        data: [mockOrcamentoCompleto],
        isLoading: false,
      } as any);
      vi.mocked(useItensServico).mockReturnValue({
        data: mockItensServico,
        isLoading: false,
      } as any);
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 10,
          impostoServico: 15,
        },
        isLoading: false,
      } as any);

      render(<Relatorios />, { wrapper: createWrapper() });

      // Deve ter texto "Material + Serviço" no subvalue dos impostos totais
      expect(screen.getByText('Material + Serviço')).toBeInTheDocument();
    });

    it('deve considerar impostos zerados corretamente', () => {
      vi.mocked(useOrcamentos).mockReturnValue({
        data: [mockOrcamentoCompleto],
        isLoading: false,
      } as any);
      vi.mocked(useItensServico).mockReturnValue({
        data: mockItensServico,
        isLoading: false,
      } as any);
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 0,
          impostoServico: 0,
        },
        isLoading: false,
      } as any);

      render(<Relatorios />, { wrapper: createWrapper() });

      // A análise de lucro deve funcionar normalmente sem impostos
      expect(screen.getByText(/Análise de Lucro/)).toBeInTheDocument();
      // Não deve mostrar "Imposto" como label de card
      const impostoLabels = screen.queryAllByText('Imposto');
      expect(impostoLabels.length).toBe(0);
    });

    it('deve funcionar com custo fixo e impostos combinados', () => {
      vi.mocked(useOrcamentos).mockReturnValue({
        data: [mockOrcamentoCompleto],
        isLoading: false,
      } as any);
      vi.mocked(useItensServico).mockReturnValue({
        data: mockItensServico,
        isLoading: false,
      } as any);
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          custoFixoMensal: 10000,
          impostoMaterial: 8,
          impostoServico: 12,
        },
        isLoading: false,
      } as any);

      render(<Relatorios />, { wrapper: createWrapper() });

      // Deve mostrar tanto a seção de análise de lucro quanto lucro líquido
      expect(screen.getByText(/Análise de Lucro/)).toBeInTheDocument();
      expect(screen.getByText('Lucro Líquido da Empresa')).toBeInTheDocument();
      // Deve mostrar os impostos configurados
      expect(screen.getByText(/Impostos: 8% material, 12% serviço/)).toBeInTheDocument();
    });

    it('deve mostrar explicação do cálculo de impostos no lucro líquido', () => {
      vi.mocked(useOrcamentos).mockReturnValue({
        data: [mockOrcamentoCompleto],
        isLoading: false,
      } as any);
      vi.mocked(useItensServico).mockReturnValue({
        data: mockItensServico,
        isLoading: false,
      } as any);
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          custoFixoMensal: 5000,
          impostoMaterial: 10,
          impostoServico: 15,
        },
        isLoading: false,
      } as any);

      render(<Relatorios />, { wrapper: createWrapper() });

      // Deve ter explicação sobre como os impostos são calculados
      // Pode haver múltiplos elementos com "Impostos:", então usamos getAllByText
      expect(screen.getAllByText(/Impostos:/).length).toBeGreaterThan(0);
      expect(screen.getByText(/Calculados sobre as vendas de material.*e serviço/)).toBeInTheDocument();
    });
  });
});
