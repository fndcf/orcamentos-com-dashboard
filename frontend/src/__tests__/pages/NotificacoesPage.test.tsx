import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import { NotificacoesPage } from '../../pages/NotificacoesPage';
import {
  useNotificacoesPaginadas,
  useNotificacoesVencidasPaginadas,
  useNotificacoesProximasPaginadas,
  useMarcarNotificacaoComoLida,
  useMarcarTodasNotificacoesComoLidas,
  useExcluirNotificacao,
  useNotificacaoResumo,
} from '../../hooks/useNotificacoes';

// Mock dos hooks
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../hooks/useNotificacoes', () => ({
  useNotificacoesPaginadas: vi.fn(),
  useNotificacoesVencidasPaginadas: vi.fn(),
  useNotificacoesProximasPaginadas: vi.fn(),
  useMarcarNotificacaoComoLida: vi.fn(),
  useMarcarTodasNotificacoesComoLidas: vi.fn(),
  useExcluirNotificacao: vi.fn(),
  useNotificacaoResumo: vi.fn(),
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

const mockNotificacoesTodas = [
  {
    id: '1',
    orcamentoId: 'orc-1',
    orcamentoNumero: 1,
    orcamentoDataEmissao: new Date(),
    clienteId: 'cli-1',
    clienteNome: 'Cliente Teste',
    itemDescricao: 'Extintor ABC 6kg - Vencimento da validade',
    palavraChave: 'VALIDADE',
    dataVencimento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    lida: false,
    createdAt: new Date(),
  },
  {
    id: '2',
    orcamentoId: 'orc-2',
    orcamentoNumero: 2,
    orcamentoDataEmissao: new Date(),
    clienteId: 'cli-2',
    clienteNome: 'Outro Cliente',
    itemDescricao: 'Hidrante de Parede',
    palavraChave: 'MANUTENCAO',
    dataVencimento: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lida: true,
    createdAt: new Date(),
  },
];

const mockNotificacoesVencidas = [
  {
    id: '2',
    orcamentoId: 'orc-2',
    orcamentoNumero: 2,
    orcamentoDataEmissao: new Date(),
    clienteId: 'cli-2',
    clienteNome: 'Outro Cliente',
    itemDescricao: 'Hidrante de Parede',
    palavraChave: 'MANUTENCAO',
    dataVencimento: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lida: true,
    createdAt: new Date(),
  },
];

const mockNotificacoesProximas = [
  {
    id: '1',
    orcamentoId: 'orc-1',
    orcamentoNumero: 1,
    orcamentoDataEmissao: new Date(),
    clienteId: 'cli-1',
    clienteNome: 'Cliente Teste',
    itemDescricao: 'Extintor ABC 6kg - Vencimento da validade',
    palavraChave: 'VALIDADE',
    dataVencimento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    lida: false,
    createdAt: new Date(),
  },
];

const mockResumo = {
  total: 10,
  naoLidas: 5,
  vencidas: 2,
  proximasVencer: 3,
};

const mockMarcarLida = { mutate: vi.fn(), isLoading: false };
const mockMarcarTodasLidas = { mutate: vi.fn(), isLoading: false };
const mockExcluir = { mutate: vi.fn(), isLoading: false };
const mockFetchNextPage = vi.fn();

// Helper para criar resposta paginada
const createPaginatedResponse = <T,>(items: T[], total?: number, hasMore = false) => ({
  pages: [{ items, total: total ?? items.length, hasMore, cursor: hasMore ? 'next-cursor' : undefined }],
  pageParams: [undefined],
});

describe('NotificacoesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    mockFetchNextPage.mockReset();

    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    vi.mocked(useNotificacaoResumo).mockReturnValue({
      data: mockResumo,
    } as any);

    vi.mocked(useNotificacoesPaginadas).mockReturnValue({
      data: createPaginatedResponse(mockNotificacoesTodas),
      isLoading: false,
      fetchNextPage: mockFetchNextPage,
      hasNextPage: false,
      isFetchingNextPage: false,
    } as any);

    vi.mocked(useNotificacoesVencidasPaginadas).mockReturnValue({
      data: createPaginatedResponse(mockNotificacoesVencidas),
      isLoading: false,
      fetchNextPage: mockFetchNextPage,
      hasNextPage: false,
      isFetchingNextPage: false,
    } as any);

    vi.mocked(useNotificacoesProximasPaginadas).mockReturnValue({
      data: createPaginatedResponse(mockNotificacoesProximas),
      isLoading: false,
      fetchNextPage: mockFetchNextPage,
      hasNextPage: false,
      isFetchingNextPage: false,
    } as any);

    vi.mocked(useMarcarNotificacaoComoLida).mockReturnValue(mockMarcarLida as any);
    vi.mocked(useMarcarTodasNotificacoesComoLidas).mockReturnValue(mockMarcarTodasLidas as any);
    vi.mocked(useExcluirNotificacao).mockReturnValue(mockExcluir as any);
  });

  describe('Renderização básica', () => {
    it('deve renderizar título da página', () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Notificações')).toBeInTheDocument();
    });

    it('deve renderizar cards de estatísticas', () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('Não Lidas')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Vencidas')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Próximas a Vencer (30 dias)')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('deve renderizar abas de filtro', () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      // Use getByRole para pegar apenas os botões das abas
      const tabs = screen.getAllByRole('button');
      const tabTexts = tabs.map(t => t.textContent);
      expect(tabTexts.some(t => t?.includes('Todas'))).toBe(true);
      expect(tabTexts.some(t => t?.includes('Vencidas'))).toBe(true);
      expect(tabTexts.some(t => t?.includes('Próximas a Vencer'))).toBe(true);
    });

    it('deve mostrar botão marcar todas como lidas', () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Marcar todas como lidas')).toBeInTheDocument();
    });
  });

  describe('Lista de notificações', () => {
    it('deve mostrar todas as notificações por padrão', () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Cliente Teste')).toBeInTheDocument();
      expect(screen.getByText('Outro Cliente')).toBeInTheDocument();
    });

    it('deve mostrar informações da notificação', () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Cliente Teste')).toBeInTheDocument();
      // O formato do orçamento é [ano][numero] (ex: 260001) - pode haver múltiplos
      const orcamentoElements = screen.getAllByText(/Orçamento\s+\d+/);
      expect(orcamentoElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Extintor ABC 6kg - Vencimento da validade')).toBeInTheDocument();
      expect(screen.getByText('VALIDADE')).toBeInTheDocument();
    });

    it('deve mostrar estado vazio quando não houver notificações', () => {
      vi.mocked(useNotificacoesPaginadas).mockReturnValue({
        data: createPaginatedResponse([]),
        isLoading: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);
      vi.mocked(useNotificacoesVencidasPaginadas).mockReturnValue({
        data: createPaginatedResponse([]),
        isLoading: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);
      vi.mocked(useNotificacoesProximasPaginadas).mockReturnValue({
        data: createPaginatedResponse([]),
        isLoading: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<NotificacoesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Nenhuma notificação encontrada')).toBeInTheDocument();
    });

    it('deve mostrar loading quando carregando', () => {
      vi.mocked(useNotificacoesPaginadas).mockReturnValue({
        data: undefined,
        isLoading: true,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<NotificacoesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });
  });

  describe('Filtros por abas', () => {
    it('deve filtrar por vencidas ao clicar na aba', async () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      // Encontrar a aba de Vencidas pelo texto com contagem
      const vencidasTab = screen.getByText(/Vencidas \(\d+\)/);
      fireEvent.click(vencidasTab);

      await waitFor(() => {
        expect(screen.getByText('Outro Cliente')).toBeInTheDocument();
        expect(screen.queryByText('Cliente Teste')).not.toBeInTheDocument();
      });
    });

    it('deve filtrar por próximas ao clicar na aba', async () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      // Encontrar a aba de Próximas pelo texto com contagem
      const proximasTab = screen.getByText(/Próximas a Vencer \(\d+\)/);
      fireEvent.click(proximasTab);

      await waitFor(() => {
        expect(screen.getByText('Cliente Teste')).toBeInTheDocument();
        expect(screen.queryByText('Outro Cliente')).not.toBeInTheDocument();
      });
    });

    it('deve voltar para todas ao clicar na aba', async () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      const vencidasTab = screen.getByText(/Vencidas \(\d+\)/);
      fireEvent.click(vencidasTab);
      await waitFor(() => {
        expect(screen.queryByText('Cliente Teste')).not.toBeInTheDocument();
      });

      const todasTab = screen.getByText(/Todas \(\d+\)/);
      fireEvent.click(todasTab);
      await waitFor(() => {
        expect(screen.getByText('Cliente Teste')).toBeInTheDocument();
        expect(screen.getByText('Outro Cliente')).toBeInTheDocument();
      });
    });

    it('deve mostrar contagem nas abas', () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Todas \(2\)/)).toBeInTheDocument();
      expect(screen.getByText(/Vencidas \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Próximas a Vencer \(1\)/)).toBeInTheDocument();
    });
  });

  describe('Interações', () => {
    it('deve navegar para orçamento ao clicar na notificação', () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Cliente Teste'));

      expect(mockNavigate).toHaveBeenCalledWith('/orcamentos?id=orc-1');
    });

    it('deve marcar como lida ao clicar em notificação não lida', () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Cliente Teste'));

      expect(mockMarcarLida.mutate).toHaveBeenCalledWith('1');
    });

    it('deve marcar todas como lidas ao clicar no botão', () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Marcar todas como lidas'));

      expect(mockMarcarTodasLidas.mutate).toHaveBeenCalled();
    });

    it('deve desabilitar botão marcar todas quando não houver não lidas', () => {
      vi.mocked(useNotificacaoResumo).mockReturnValue({
        data: { ...mockResumo, naoLidas: 0 },
      } as any);

      render(<NotificacoesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Marcar todas como lidas')).toBeDisabled();
    });

    it('deve mostrar botão marcar como lida para notificações não lidas', () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Marcar como lida')).toBeInTheDocument();
    });

    it('deve marcar como lida ao clicar no botão', () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Marcar como lida'));

      expect(mockMarcarLida.mutate).toHaveBeenCalledWith('1');
    });

    it('deve excluir notificação ao clicar em excluir', () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      const excluirButtons = screen.getAllByText('Excluir');
      fireEvent.click(excluirButtons[0]);

      expect(window.confirm).toHaveBeenCalled();
      expect(mockExcluir.mutate).toHaveBeenCalledWith('1');
    });

    it('não deve excluir se cancelar confirmação', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<NotificacoesPage />, { wrapper: createWrapper() });

      const excluirButtons = screen.getAllByText('Excluir');
      fireEvent.click(excluirButtons[0]);

      expect(mockExcluir.mutate).not.toHaveBeenCalled();
    });
  });

  describe('Formatação de datas', () => {
    it('deve mostrar "Vence em X dias" para notificações futuras', () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Vence em 5 dias')).toBeInTheDocument();
    });

    it('deve mostrar "Vencido há X dias" para notificações vencidas', () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Vencido há 2 dias')).toBeInTheDocument();
    });

    it('deve mostrar data formatada', () => {
      render(<NotificacoesPage />, { wrapper: createWrapper() });

      // Verifica se há datas formatadas no formato DD/MM/YYYY
      const dateRegex = /\d{2}\/\d{2}\/\d{4}/;
      const dates = screen.getAllByText(dateRegex);
      expect(dates.length).toBeGreaterThan(0);
    });
  });

  describe('Valores padrão e edge cases', () => {
    it('deve mostrar 0 quando resumo for undefined', () => {
      vi.mocked(useNotificacaoResumo).mockReturnValue({
        data: undefined,
      } as any);

      render(<NotificacoesPage />, { wrapper: createWrapper() });

      // Todos os valores devem ser 0
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThan(0);
    });

    it('deve renderizar corretamente sem dados', () => {
      vi.mocked(useNotificacoesPaginadas).mockReturnValue({
        data: undefined,
        isLoading: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);
      vi.mocked(useNotificacoesVencidasPaginadas).mockReturnValue({
        data: undefined,
        isLoading: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);
      vi.mocked(useNotificacoesProximasPaginadas).mockReturnValue({
        data: undefined,
        isLoading: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<NotificacoesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Nenhuma notificação encontrada')).toBeInTheDocument();
    });
  });

  describe('Paginação', () => {
    it('deve mostrar botão de carregar mais quando houver mais páginas', () => {
      vi.mocked(useNotificacoesPaginadas).mockReturnValue({
        data: createPaginatedResponse(mockNotificacoesTodas, 10, true),
        isLoading: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: true,
        isFetchingNextPage: false,
      } as any);

      render(<NotificacoesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Carregar mais notificações')).toBeInTheDocument();
    });

    it('deve chamar fetchNextPage ao clicar em carregar mais', () => {
      vi.mocked(useNotificacoesPaginadas).mockReturnValue({
        data: createPaginatedResponse(mockNotificacoesTodas, 10, true),
        isLoading: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: true,
        isFetchingNextPage: false,
      } as any);

      render(<NotificacoesPage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Carregar mais notificações'));

      expect(mockFetchNextPage).toHaveBeenCalled();
    });

    it('deve mostrar indicador de carregando mais', () => {
      vi.mocked(useNotificacoesPaginadas).mockReturnValue({
        data: createPaginatedResponse(mockNotificacoesTodas, 10, true),
        isLoading: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: true,
        isFetchingNextPage: true,
      } as any);

      render(<NotificacoesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Carregando mais notificações...')).toBeInTheDocument();
    });

    it('não deve mostrar botão de carregar mais quando não houver mais páginas', () => {
      vi.mocked(useNotificacoesPaginadas).mockReturnValue({
        data: createPaginatedResponse(mockNotificacoesTodas),
        isLoading: false,
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
      } as any);

      render(<NotificacoesPage />, { wrapper: createWrapper() });

      expect(screen.queryByText('Carregar mais notificações')).not.toBeInTheDocument();
    });
  });
});
