import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import { NotificacaoDropdown } from '../../../components/notificacoes/NotificacaoDropdown';
import {
  useNotificacaoResumo,
  useNotificacoesAtivas,
  useMarcarNotificacaoComoLida,
  useMarcarTodasNotificacoesComoLidas,
} from '../../../hooks/useNotificacoes';

// Mock dos hooks
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../hooks/useNotificacoes', () => ({
  useNotificacaoResumo: vi.fn(),
  useNotificacoesAtivas: vi.fn(),
  useMarcarNotificacaoComoLida: vi.fn(),
  useMarcarTodasNotificacoesComoLidas: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

const mockNotificacoes = [
  {
    id: '1',
    orcamentoId: 'orc-1',
    orcamentoNumero: 1001,
    clienteId: 'cli-1',
    clienteNome: 'Cliente Teste',
    itemDescricao: 'Extintor ABC 6kg - Vencimento da validade',
    palavraChave: 'VALIDADE',
    dataVencimento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias no futuro
    lida: false,
    createdAt: new Date(),
  },
  {
    id: '2',
    orcamentoId: 'orc-2',
    orcamentoNumero: 1002,
    clienteId: 'cli-2',
    clienteNome: 'Outro Cliente',
    itemDescricao: 'Hidrante de Parede - Vencimento da manutenção',
    palavraChave: 'MANUTENCAO',
    dataVencimento: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias no passado (vencida)
    lida: true,
    createdAt: new Date(),
  },
  {
    id: '3',
    orcamentoId: 'orc-3',
    orcamentoNumero: 1003,
    clienteId: 'cli-3',
    clienteNome: 'Terceiro Cliente',
    itemDescricao: 'Este é um texto muito longo que deve ser truncado para exibição no dropdown porque ultrapassa 80 caracteres facilmente',
    palavraChave: 'TESTE',
    dataVencimento: new Date(), // Vence hoje
    lida: false,
    createdAt: new Date(),
  },
];

const mockResumo = {
  total: 10,
  naoLidas: 3,
  vencidas: 1,
  proximasVencer: 5,
  ativas: 3,
};

const mockMarcarLida = { mutate: vi.fn(), isLoading: false };
const mockMarcarTodasLidas = { mutate: vi.fn(), isLoading: false };
const mockRefetch = vi.fn();

describe('NotificacaoDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    mockRefetch.mockReset();

    vi.mocked(useNotificacaoResumo).mockReturnValue({
      data: mockResumo,
    } as any);

    vi.mocked(useNotificacoesAtivas).mockReturnValue({
      data: mockNotificacoes,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    vi.mocked(useMarcarNotificacaoComoLida).mockReturnValue(mockMarcarLida as any);
    vi.mocked(useMarcarTodasNotificacoesComoLidas).mockReturnValue(mockMarcarTodasLidas as any);
  });

  it('deve renderizar o botão de notificações', () => {
    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    expect(screen.getByTitle('Notificações')).toBeInTheDocument();
  });

  it('deve mostrar badge com número de ativas', () => {
    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('deve mostrar 99+ quando houver mais de 99 ativas', () => {
    vi.mocked(useNotificacaoResumo).mockReturnValue({
      data: { ...mockResumo, ativas: 150 },
    } as any);

    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('não deve mostrar badge quando não houver ativas', () => {
    vi.mocked(useNotificacaoResumo).mockReturnValue({
      data: { ...mockResumo, ativas: 0 },
    } as any);

    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('deve mostrar ícone vermelho quando houver vencidas', () => {
    vi.mocked(useNotificacaoResumo).mockReturnValue({
      data: { ...mockResumo, vencidas: 2 },
    } as any);

    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    // Ícone vermelho para vencidas
    expect(screen.getByText('🔴')).toBeInTheDocument();
  });

  it('deve mostrar ícone normal quando não houver vencidas', () => {
    vi.mocked(useNotificacaoResumo).mockReturnValue({
      data: { ...mockResumo, vencidas: 0 },
    } as any);

    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    expect(screen.getByText('🔔')).toBeInTheDocument();
  });

  it('deve abrir dropdown ao clicar no botão', () => {
    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTitle('Notificações'));

    expect(screen.getByText('Notificações')).toBeInTheDocument();
    expect(screen.getByText('Marcar todas como lidas')).toBeInTheDocument();
  });

  it('deve fechar dropdown ao clicar novamente', () => {
    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    const button = screen.getByTitle('Notificações');
    fireEvent.click(button);
    expect(screen.getByText('Marcar todas como lidas')).toBeInTheDocument();

    fireEvent.click(button);
    // Dropdown fechado não mostra o botão
    expect(screen.queryByText('Marcar todas como lidas')).not.toBeVisible();
  });

  it('deve mostrar lista de notificações no dropdown', () => {
    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTitle('Notificações'));

    expect(screen.getByText(/Cliente Teste - Orç. #1001/)).toBeInTheDocument();
    expect(screen.getByText(/Outro Cliente - Orç. #1002/)).toBeInTheDocument();
  });

  it('deve truncar descrição longa', () => {
    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTitle('Notificações'));

    // Texto truncado em 80 caracteres
    expect(screen.getByText(/Este é um texto muito longo que deve ser truncado para exibição no dropdown porq\.\.\./)).toBeInTheDocument();
  });

  it('deve mostrar estado vazio quando não houver notificações', () => {
    vi.mocked(useNotificacoesAtivas).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTitle('Notificações'));

    expect(screen.getByText('Nenhuma notificação pendente')).toBeInTheDocument();
  });

  it('deve mostrar estado de carregamento', () => {
    vi.mocked(useNotificacoesAtivas).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTitle('Notificações'));

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('deve mostrar estado de erro', () => {
    vi.mocked(useNotificacoesAtivas).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTitle('Notificações'));

    expect(screen.getByText('Erro ao carregar notificações')).toBeInTheDocument();
  });

  it('deve chamar marcar todas como lidas ao clicar no botão', () => {
    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTitle('Notificações'));
    fireEvent.click(screen.getByText('Marcar todas como lidas'));

    expect(mockMarcarTodasLidas.mutate).toHaveBeenCalled();
  });

  it('deve desabilitar botão marcar todas quando não houver ativas', () => {
    vi.mocked(useNotificacaoResumo).mockReturnValue({
      data: { ...mockResumo, ativas: 0 },
    } as any);

    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTitle('Notificações'));

    expect(screen.getByText('Marcar todas como lidas')).toBeDisabled();
  });

  it('deve navegar para orçamento ao clicar em notificação', () => {
    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTitle('Notificações'));
    fireEvent.click(screen.getByText(/Cliente Teste - Orç. #1001/));

    expect(mockNavigate).toHaveBeenCalledWith('/orcamentos?id=orc-1');
  });

  it('deve marcar como lida ao clicar em notificação não lida', () => {
    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTitle('Notificações'));
    fireEvent.click(screen.getByText(/Cliente Teste - Orç. #1001/));

    expect(mockMarcarLida.mutate).toHaveBeenCalledWith('1');
  });

  it('não deve marcar como lida ao clicar em notificação já lida', () => {
    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTitle('Notificações'));
    fireEvent.click(screen.getByText(/Outro Cliente - Orç. #1002/));

    // Notificação 2 já está lida
    expect(mockMarcarLida.mutate).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/orcamentos?id=orc-2');
  });

  it('deve navegar para página de notificações ao clicar em ver todas', () => {
    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTitle('Notificações'));
    fireEvent.click(screen.getByText('Ver todas as notificações'));

    expect(mockNavigate).toHaveBeenCalledWith('/notificacoes');
  });

  it('deve mostrar palavras-chave nas notificações', () => {
    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTitle('Notificações'));

    expect(screen.getByText('VALIDADE')).toBeInTheDocument();
    expect(screen.getByText('MANUTENCAO')).toBeInTheDocument();
  });

  it('deve mostrar "Renovação em X dias" para notificações futuras', () => {
    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTitle('Notificações'));

    expect(screen.getByText('Renovação em 5 dias')).toBeInTheDocument();
  });

  it('deve mostrar "Renovação hoje" para notificações com vencimento hoje', () => {
    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTitle('Notificações'));

    expect(screen.getByText('Renovação hoje')).toBeInTheDocument();
  });

  it('deve mostrar "Venceu há X dias" para notificações vencidas', () => {
    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTitle('Notificações'));

    expect(screen.getByText('Venceu há 2 dias')).toBeInTheDocument();
  });

  it('deve fechar dropdown ao clicar fora', async () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <NotificacaoDropdown />
      </div>,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByTitle('Notificações'));
    expect(screen.getByText('Marcar todas como lidas')).toBeVisible();

    fireEvent.mouseDown(screen.getByTestId('outside'));

    await waitFor(() => {
      expect(screen.queryByText('Marcar todas como lidas')).not.toBeVisible();
    });
  });

  it('deve mostrar no máximo 5 notificações no dropdown', () => {
    const manyNotifications = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      orcamentoId: `orc-${i + 1}`,
      orcamentoNumero: 1000 + i,
      clienteId: `cli-${i + 1}`,
      clienteNome: `Cliente ${i + 1}`,
      itemDescricao: `Item ${i + 1}`,
      palavraChave: 'TESTE',
      dataVencimento: new Date(),
      lida: false,
      createdAt: new Date(),
    }));

    vi.mocked(useNotificacoesAtivas).mockReturnValue({
      data: manyNotifications,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTitle('Notificações'));

    // Deve mostrar apenas 5 notificações
    expect(screen.getByText(/Cliente 1 - Orç. #1000/)).toBeInTheDocument();
    expect(screen.getByText(/Cliente 5 - Orç. #1004/)).toBeInTheDocument();
    expect(screen.queryByText(/Cliente 6 - Orç. #1005/)).not.toBeInTheDocument();
  });

  it('deve chamar refetch quando dropdown é aberto', async () => {
    render(<NotificacaoDropdown />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTitle('Notificações'));

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
