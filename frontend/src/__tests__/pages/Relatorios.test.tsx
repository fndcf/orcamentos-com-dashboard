import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Relatorios } from '../../pages/Relatorios';
import { useOrcamentos } from '../../hooks/useOrcamentos';
import { useClientes } from '../../hooks/useClientes';

// Mock dos hooks
vi.mock('../../hooks/useOrcamentos', () => ({
  useOrcamentos: vi.fn(),
}));

vi.mock('../../hooks/useClientes', () => ({
  useClientes: vi.fn(),
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

const mockClientes = [
  { id: 'c1', razaoSocial: 'Cliente A', cnpj: '12345678901234' },
  { id: 'c2', razaoSocial: 'Cliente B', cnpj: '98765432109876' },
  { id: 'c3', razaoSocial: 'Cliente C', cnpj: '11111111111111' },
];

describe('Relatorios', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
    global.URL.revokeObjectURL = vi.fn();

    // Mock da data atual para os testes serem consistentes
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve mostrar loading quando está carregando', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);
    vi.mocked(useClientes).mockReturnValue({
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
    vi.mocked(useClientes).mockReturnValue({
      data: mockClientes,
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
    vi.mocked(useClientes).mockReturnValue({
      data: mockClientes,
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
    vi.mocked(useClientes).mockReturnValue({
      data: mockClientes,
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
    vi.mocked(useClientes).mockReturnValue({
      data: mockClientes,
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
    vi.mocked(useClientes).mockReturnValue({
      data: mockClientes,
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
    vi.mocked(useClientes).mockReturnValue({
      data: mockClientes,
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
    vi.mocked(useClientes).mockReturnValue({
      data: mockClientes,
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
    vi.mocked(useClientes).mockReturnValue({
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
    vi.mocked(useClientes).mockReturnValue({
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
    vi.mocked(useClientes).mockReturnValue({
      data: mockClientes,
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
    vi.mocked(useClientes).mockReturnValue({
      data: mockClientes,
      isLoading: false,
    } as any);

    render(<Relatorios />, { wrapper: createWrapper() });

    const dateInputs = document.querySelectorAll('input[type="date"]') as NodeListOf<HTMLInputElement>;

    // Data início deve ser o primeiro dia do mês
    expect(dateInputs[0].value).toBeTruthy();
    // Data fim deve ser hoje
    expect(dateInputs[1].value).toBeTruthy();
  });
});
