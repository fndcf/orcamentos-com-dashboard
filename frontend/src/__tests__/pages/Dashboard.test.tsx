import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Dashboard } from '../../pages/Dashboard';
import { useOrcamentos, useDashboardStats } from '../../hooks/useOrcamentos';
import { useClientes } from '../../hooks/useClientes';
import { formatOrcamentoNumero } from '../../utils/constants';

// Mock dos hooks
vi.mock('../../hooks/useOrcamentos', () => ({
  useOrcamentos: vi.fn(),
  useDashboardStats: vi.fn(),
}));

vi.mock('../../hooks/useClientes', () => ({
  useClientes: vi.fn(),
}));

// Mock do OrcamentoViewModal
vi.mock('../../components/orcamentos/OrcamentoViewModal', () => ({
  OrcamentoViewModal: ({ isOpen, onClose, orcamento }: any) =>
    isOpen ? (
      <div data-testid="orcamento-view-modal">
        <span>Modal Orcamento #{orcamento?.numero}</span>
        <button onClick={onClose}>Fechar</button>
      </div>
    ) : null,
}));

// Mock do Recharts
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

const mockOrcamentos = [
  {
    id: '1',
    numero: 1,
    versao: 0,
    tipo: 'simples' as const,
    clienteId: 'c1',
    clienteNome: 'Cliente 1',
    clienteCnpj: '12345678901234',
    status: 'aberto' as const,
    valorTotal: 1000,
    dataEmissao: new Date().toISOString(),
    itens: [],
  },
  {
    id: '2',
    numero: 2,
    versao: 0,
    tipo: 'simples' as const,
    clienteId: 'c2',
    clienteNome: 'Cliente 2',
    clienteCnpj: '98765432109876',
    status: 'aceito' as const,
    valorTotal: 2000,
    dataEmissao: new Date().toISOString(),
    itens: [],
  },
  {
    id: '3',
    numero: 3,
    versao: 0,
    tipo: 'simples' as const,
    clienteId: 'c3',
    clienteNome: 'Cliente 3',
    clienteCnpj: '11111111111111',
    status: 'recusado' as const,
    valorTotal: 1500,
    dataEmissao: new Date().toISOString(),
    itens: [],
  },
  {
    id: '4',
    numero: 4,
    versao: 0,
    tipo: 'simples' as const,
    clienteId: 'c4',
    clienteNome: 'Cliente 4',
    clienteCnpj: '22222222222222',
    status: 'expirado' as const,
    valorTotal: 500,
    dataEmissao: new Date().toISOString(),
    itens: [],
  },
];

const mockClientes = [
  { id: 'c1', razaoSocial: 'Empresa 1' },
  { id: 'c2', razaoSocial: 'Empresa 2' },
];

const mockDashboardStats = {
  total: 4,
  abertos: 1,
  aceitos: 1,
  recusados: 1,
  expirados: 1,
  valorTotal: 5000,
  valorAceitos: 2000,
  totalClientes: 2,
  porMes: [],
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock padrão para useDashboardStats
    vi.mocked(useDashboardStats).mockReturnValue({
      data: mockDashboardStats,
      isLoading: false,
    } as any);
  });

  it('deve mostrar loading quando está carregando orçamentos', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);
    vi.mocked(useClientes).mockReturnValue({
      data: mockClientes,
      isLoading: false,
    } as any);
    vi.mocked(useDashboardStats).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Painel')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('deve mostrar loading quando dashboardStats está carregando', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useClientes).mockReturnValue({
      data: mockClientes,
      isLoading: false,
    } as any);
    vi.mocked(useDashboardStats).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('deve mostrar mensagem quando não há dados', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(useClientes).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(useDashboardStats).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Nenhum dado disponível')).toBeInTheDocument();
  });

  it('deve renderizar estatísticas corretamente', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useClientes).mockReturnValue({
      data: mockClientes,
      isLoading: false,
    } as any);

    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Total de Orçamentos')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument(); // total
    expect(screen.getByText('Orçamentos Aceitos')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // aceitos
    expect(screen.getByText('Taxa de Conversão')).toBeInTheDocument();
    expect(screen.getByText('Clientes Cadastrados')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // clientes
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

    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Orçamentos por Mês (Últimos 6 meses)')).toBeInTheDocument();
    expect(screen.getByText('Status dos Orçamentos')).toBeInTheDocument();
    expect(screen.getByText('Evolução de Valores (em milhares R$)')).toBeInTheDocument();
  });

  it('deve renderizar orçamentos recentes', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useClientes).mockReturnValue({
      data: mockClientes,
      isLoading: false,
    } as any);

    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Orçamentos Recentes')).toBeInTheDocument();
    const orc1Numero = formatOrcamentoNumero(mockOrcamentos[0].numero, mockOrcamentos[0].dataEmissao, mockOrcamentos[0].versao);
    expect(screen.getByText(orc1Numero)).toBeInTheDocument();
    expect(screen.getByText('Cliente 1')).toBeInTheDocument();
  });

  it('deve abrir modal ao clicar em orçamento recente', async () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useClientes).mockReturnValue({
      data: mockClientes,
      isLoading: false,
    } as any);

    render(<Dashboard />, { wrapper: createWrapper() });

    const orc1Numero = formatOrcamentoNumero(mockOrcamentos[0].numero, mockOrcamentos[0].dataEmissao, mockOrcamentos[0].versao);
    const orcamentoItem = screen.getByText(orc1Numero).closest('div[title="Clique para ver detalhes"]');
    if (orcamentoItem) {
      fireEvent.click(orcamentoItem);
    }

    await waitFor(() => {
      expect(screen.getByTestId('orcamento-view-modal')).toBeInTheDocument();
    });
  });

  it('deve fechar modal ao clicar em fechar', async () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useClientes).mockReturnValue({
      data: mockClientes,
      isLoading: false,
    } as any);

    render(<Dashboard />, { wrapper: createWrapper() });

    const orc1Numero = formatOrcamentoNumero(mockOrcamentos[0].numero, mockOrcamentos[0].dataEmissao, mockOrcamentos[0].versao);
    const orcamentoItem = screen.getByText(orc1Numero).closest('div[title="Clique para ver detalhes"]');
    if (orcamentoItem) {
      fireEvent.click(orcamentoItem);
    }

    await waitFor(() => {
      expect(screen.getByTestId('orcamento-view-modal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Fechar'));

    await waitFor(() => {
      expect(screen.queryByTestId('orcamento-view-modal')).not.toBeInTheDocument();
    });
  });

  it('deve calcular taxa de conversão corretamente', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useClientes).mockReturnValue({
      data: mockClientes,
      isLoading: false,
    } as any);

    render(<Dashboard />, { wrapper: createWrapper() });

    // 1 aceito de 4 total = 25%
    expect(screen.getByText('25.0%')).toBeInTheDocument();
  });

  it('deve mostrar mensagem quando não há orçamentos cadastrados', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(useClientes).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Dashboard />, { wrapper: createWrapper() });

    // Pode haver múltiplos elementos devido ao layout mobile/desktop
    expect(screen.getAllByText('Nenhum orçamento cadastrado')[0]).toBeInTheDocument();
  });

  it('deve renderizar badges de status corretos', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);
    vi.mocked(useClientes).mockReturnValue({
      data: mockClientes,
      isLoading: false,
    } as any);

    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Abertos')).toBeInTheDocument();
    expect(screen.getByText('Aceitos')).toBeInTheDocument();
    expect(screen.getByText('Recusados')).toBeInTheDocument();
    expect(screen.getByText('Expirados')).toBeInTheDocument();
  });
});
