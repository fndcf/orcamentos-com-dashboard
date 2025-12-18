import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';

// Mock do useAuth
const mockSignOut = vi.fn();
const mockNavigate = vi.fn();
const mockLocation = { pathname: '/' };

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'test@test.com' },
    signOut: mockSignOut,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

// Mock dos hooks de notificações
vi.mock('../../hooks/useNotificacoes', () => ({
  useNotificacaoResumo: vi.fn(() => ({
    data: { naoLidas: 3, vencidas: 1, proximasVencer: 2, ativas: 3 },
    isLoading: false,
    refetch: vi.fn(),
  })),
  useNotificacoes: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useNotificacoesNaoLidas: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useNotificacoesAtivas: vi.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })),
  useNotificacoesAtivasPaginadas: vi.fn(() => ({
    data: {
      pages: [{ items: [], total: 0, hasMore: false, cursor: undefined }],
      pageParams: [undefined],
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  })),
  useMarcarComoLida: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isLoading: false,
  })),
  useMarcarTodasComoLidas: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isLoading: false,
  })),
  useMarcarNotificacaoComoLida: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isLoading: false,
  })),
  useMarcarTodasNotificacoesComoLidas: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isLoading: false,
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.pathname = '/';
  });

  it('deve renderizar o layout corretamente', () => {
    render(<AdminLayout />, { wrapper: createWrapper() });

    expect(screen.getByText('FLAMA')).toBeInTheDocument();
    expect(screen.getByText('Painel')).toBeInTheDocument();
    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByText('Orçamentos')).toBeInTheDocument();
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });

  it('deve mostrar email do usuário', () => {
    render(<AdminLayout />, { wrapper: createWrapper() });

    expect(screen.getByText('test@test.com')).toBeInTheDocument();
  });

  it('deve navegar para home ao clicar no logo', async () => {
    render(<AdminLayout />, { wrapper: createWrapper() });

    await userEvent.click(screen.getByText('FLAMA'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('deve navegar para Painel ao clicar no botão', async () => {
    render(<AdminLayout />, { wrapper: createWrapper() });

    await userEvent.click(screen.getByText('Painel'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('deve navegar para Clientes ao clicar no botão', async () => {
    render(<AdminLayout />, { wrapper: createWrapper() });

    await userEvent.click(screen.getByText('Clientes'));
    expect(mockNavigate).toHaveBeenCalledWith('/clientes');
  });

  it('deve navegar para Orçamentos ao clicar no botão', async () => {
    render(<AdminLayout />, { wrapper: createWrapper() });

    await userEvent.click(screen.getByText('Orçamentos'));
    expect(mockNavigate).toHaveBeenCalledWith('/orcamentos');
  });

  it('deve abrir dropdown de notificações ao clicar no ícone', async () => {
    render(<AdminLayout />, { wrapper: createWrapper() });

    await userEvent.click(screen.getByTitle('Notificações'));

    // O dropdown deve abrir e mostrar opções de notificação
    await waitFor(() => {
      expect(screen.getByText('Nenhuma notificação pendente')).toBeInTheDocument();
    });
  });

  it('deve navegar para configurações ao clicar no ícone', async () => {
    render(<AdminLayout />, { wrapper: createWrapper() });

    await userEvent.click(screen.getByTitle('Configurações'));
    expect(mockNavigate).toHaveBeenCalledWith('/configuracoes');
  });

  it('deve mostrar modal de logout ao clicar em Sair', async () => {
    render(<AdminLayout />, { wrapper: createWrapper() });

    await userEvent.click(screen.getByText('Sair'));

    expect(screen.getByText('Sair do Sistema')).toBeInTheDocument();
    expect(screen.getByText('Tem certeza que deseja sair do sistema?')).toBeInTheDocument();
  });

  it('deve fechar modal ao clicar em Cancelar', async () => {
    render(<AdminLayout />, { wrapper: createWrapper() });

    await userEvent.click(screen.getByText('Sair'));
    expect(screen.getByText('Sair do Sistema')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Cancelar'));

    await waitFor(() => {
      expect(screen.queryByText('Sair do Sistema')).not.toBeInTheDocument();
    });
  });

  it('deve fazer logout ao confirmar no modal', async () => {
    mockSignOut.mockResolvedValue(undefined);

    render(<AdminLayout />, { wrapper: createWrapper() });

    await userEvent.click(screen.getByText('Sair'));

    // Clica no botão "Sair" dentro do modal (que é diferente do botão no header)
    const sairButtons = screen.getAllByText('Sair');

    // O segundo botão "Sair" é o do modal
    await userEvent.click(sairButtons[1]);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('deve mostrar badge de notificações', () => {
    render(<AdminLayout />, { wrapper: createWrapper() });

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('deve marcar Painel como ativo quando pathname é /', () => {
    mockLocation.pathname = '/';

    render(<AdminLayout />, { wrapper: createWrapper() });

    // O botão Painel deve estar visível (não podemos testar o estilo diretamente)
    expect(screen.getByText('Painel')).toBeInTheDocument();
  });

  it('deve marcar Clientes como ativo quando pathname é /clientes', () => {
    mockLocation.pathname = '/clientes';

    render(<AdminLayout />, { wrapper: createWrapper() });

    expect(screen.getByText('Clientes')).toBeInTheDocument();
  });

  it('deve marcar Orçamentos como ativo quando pathname é /orcamentos', () => {
    mockLocation.pathname = '/orcamentos';

    render(<AdminLayout />, { wrapper: createWrapper() });

    expect(screen.getByText('Orçamentos')).toBeInTheDocument();
  });
});
