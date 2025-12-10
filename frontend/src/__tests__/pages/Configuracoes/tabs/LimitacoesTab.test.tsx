import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LimitacoesTab } from '../../../../pages/Configuracoes/tabs/LimitacoesTab';
import {
  useLimitacoes,
  useCriarLimitacao,
  useAtualizarLimitacao,
  useToggleLimitacao,
  useExcluirLimitacao,
} from '../../../../hooks/useLimitacoes';

vi.mock('../../../../hooks/useLimitacoes', () => ({
  useLimitacoes: vi.fn(),
  useCriarLimitacao: vi.fn(),
  useAtualizarLimitacao: vi.fn(),
  useToggleLimitacao: vi.fn(),
  useExcluirLimitacao: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockLimitacoes = [
  {
    id: 'lim1',
    texto: 'Esta proposta é válida por 30 dias a partir da data de emissão.',
    ativo: true,
    ordem: 1,
    createdAt: new Date(),
  },
  {
    id: 'lim2',
    texto: 'O pagamento deve ser realizado em até 15 dias após a conclusão dos serviços.',
    ativo: false,
    ordem: 2,
    createdAt: new Date(),
  },
];

const mockCriarMutateAsync = vi.fn();
const mockAtualizarMutateAsync = vi.fn();
const mockToggleMutateAsync = vi.fn();
const mockExcluirMutateAsync = vi.fn();

describe('LimitacoesTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useLimitacoes).mockReturnValue({
      data: mockLimitacoes,
      isLoading: false,
    } as any);

    vi.mocked(useCriarLimitacao).mockReturnValue({
      mutateAsync: mockCriarMutateAsync,
      isLoading: false,
    } as any);

    vi.mocked(useAtualizarLimitacao).mockReturnValue({
      mutateAsync: mockAtualizarMutateAsync,
      isLoading: false,
    } as any);

    vi.mocked(useToggleLimitacao).mockReturnValue({
      mutateAsync: mockToggleMutateAsync,
      isLoading: false,
    } as any);

    vi.mocked(useExcluirLimitacao).mockReturnValue({
      mutateAsync: mockExcluirMutateAsync,
      isLoading: false,
    } as any);
  });

  describe('Renderização', () => {
    it('deve renderizar título e descrição', () => {
      render(<LimitacoesTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Observações e Limitações')).toBeInTheDocument();
      expect(screen.getByText(/Cadastre os parágrafos de observações/)).toBeInTheDocument();
    });

    it('deve renderizar lista de limitações', () => {
      render(<LimitacoesTab />, { wrapper: createWrapper() });

      expect(screen.getByText(/Esta proposta é válida por 30 dias/)).toBeInTheDocument();
      expect(screen.getByText(/O pagamento deve ser realizado/)).toBeInTheDocument();
    });

    it('deve mostrar status Ativa/Inativa corretamente', () => {
      render(<LimitacoesTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Ativa')).toBeInTheDocument();
      expect(screen.getByText('Inativa')).toBeInTheDocument();
    });

    it('deve mostrar botão Desativar para item ativo', () => {
      render(<LimitacoesTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Desativar')).toBeInTheDocument();
    });

    it('deve mostrar botão Ativar para item inativo', () => {
      render(<LimitacoesTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Ativar')).toBeInTheDocument();
    });

    it('deve mostrar estado vazio quando não há limitações', () => {
      vi.mocked(useLimitacoes).mockReturnValue({
        data: [],
        isLoading: false,
      } as any);

      render(<LimitacoesTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Nenhuma observação cadastrada')).toBeInTheDocument();
      expect(screen.getByText('Cadastrar Primeira Observação')).toBeInTheDocument();
    });
  });

  describe('Criar nova limitação', () => {
    it('deve abrir modal ao clicar em Nova Observação', async () => {
      render(<LimitacoesTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('+ Nova Observação'));

      await waitFor(() => {
        expect(screen.getByText('Nova Observação')).toBeInTheDocument();
      });
    });

    it('deve desabilitar botão Cadastrar quando texto é curto', async () => {
      render(<LimitacoesTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('+ Nova Observação'));

      await waitFor(() => {
        expect(screen.getByText('Nova Observação')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/O Contratante deverá/);
      fireEvent.change(textarea, { target: { value: 'Texto curto' } });

      const cadastrarButton = screen.getByRole('button', { name: 'Cadastrar' });
      expect(cadastrarButton).toBeDisabled();
    });

    it('deve habilitar botão Cadastrar quando texto tem 20+ caracteres', async () => {
      render(<LimitacoesTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('+ Nova Observação'));

      await waitFor(() => {
        expect(screen.getByText('Nova Observação')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/O Contratante deverá/);
      fireEvent.change(textarea, { target: { value: 'Este texto tem mais de vinte caracteres para teste' } });

      const cadastrarButton = screen.getByRole('button', { name: 'Cadastrar' });
      expect(cadastrarButton).not.toBeDisabled();
    });

    it('deve chamar criar ao salvar nova limitação', async () => {
      mockCriarMutateAsync.mockResolvedValue({});

      render(<LimitacoesTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('+ Nova Observação'));

      await waitFor(() => {
        expect(screen.getByText('Nova Observação')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/O Contratante deverá/);
      fireEvent.change(textarea, { target: { value: 'Esta é uma nova observação com mais de vinte caracteres' } });

      fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(mockCriarMutateAsync).toHaveBeenCalledWith({
          texto: 'Esta é uma nova observação com mais de vinte caracteres',
        });
      });
    });

    it('deve mostrar erro ao falhar criar', async () => {
      mockCriarMutateAsync.mockRejectedValue({
        response: { data: { error: 'Erro ao criar observação' } },
      });
      vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<LimitacoesTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('+ Nova Observação'));

      await waitFor(() => {
        expect(screen.getByText('Nova Observação')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/O Contratante deverá/);
      fireEvent.change(textarea, { target: { value: 'Esta é uma nova observação com mais de vinte caracteres' } });

      fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(screen.getByText('Erro ao criar observação')).toBeInTheDocument();
      });
    });

    it('deve abrir modal pelo botão do estado vazio', async () => {
      vi.mocked(useLimitacoes).mockReturnValue({
        data: [],
        isLoading: false,
      } as any);

      render(<LimitacoesTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Cadastrar Primeira Observação'));

      await waitFor(() => {
        expect(screen.getByText('Nova Observação')).toBeInTheDocument();
      });
    });
  });

  describe('Editar limitação', () => {
    it('deve abrir modal de edição com dados preenchidos', async () => {
      render(<LimitacoesTab />, { wrapper: createWrapper() });

      const editarButtons = screen.getAllByText('Editar');
      fireEvent.click(editarButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Editar Observação')).toBeInTheDocument();
        expect(screen.getByDisplayValue(/Esta proposta é válida por 30 dias/)).toBeInTheDocument();
      });
    });

    it('deve chamar atualizar ao salvar edição', async () => {
      mockAtualizarMutateAsync.mockResolvedValue({});

      render(<LimitacoesTab />, { wrapper: createWrapper() });

      const editarButtons = screen.getAllByText('Editar');
      fireEvent.click(editarButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Editar Observação')).toBeInTheDocument();
      });

      const textarea = screen.getByDisplayValue(/Esta proposta é válida por 30 dias/);
      fireEvent.change(textarea, { target: { value: 'Texto atualizado com mais de vinte caracteres para validação' } });

      fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

      await waitFor(() => {
        expect(mockAtualizarMutateAsync).toHaveBeenCalledWith({
          id: 'lim1',
          data: { texto: 'Texto atualizado com mais de vinte caracteres para validação' },
        });
      });
    });

    it('deve mostrar erro ao falhar atualização', async () => {
      mockAtualizarMutateAsync.mockRejectedValue({
        response: { data: { message: 'Erro na atualização' } },
      });
      vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<LimitacoesTab />, { wrapper: createWrapper() });

      const editarButtons = screen.getAllByText('Editar');
      fireEvent.click(editarButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Editar Observação')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

      await waitFor(() => {
        expect(screen.getByText('Erro na atualização')).toBeInTheDocument();
      });
    });
  });

  describe('Toggle limitação', () => {
    it('deve chamar toggle ao clicar em Desativar', async () => {
      mockToggleMutateAsync.mockResolvedValue({});

      render(<LimitacoesTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Desativar'));

      await waitFor(() => {
        expect(mockToggleMutateAsync).toHaveBeenCalledWith('lim1');
      });
    });

    it('deve chamar toggle ao clicar em Ativar', async () => {
      mockToggleMutateAsync.mockResolvedValue({});

      render(<LimitacoesTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Ativar'));

      await waitFor(() => {
        expect(mockToggleMutateAsync).toHaveBeenCalledWith('lim2');
      });
    });

    it('deve logar erro ao falhar toggle', async () => {
      mockToggleMutateAsync.mockRejectedValue(new Error('Erro'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<LimitacoesTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Desativar'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Erro ao alterar status da limitação'));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Excluir limitação', () => {
    it('deve abrir modal de confirmação ao clicar em Excluir', async () => {
      render(<LimitacoesTab />, { wrapper: createWrapper() });

      const excluirButtons = screen.getAllByText('Excluir');
      fireEvent.click(excluirButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Tem certeza/)).toBeInTheDocument();
      });
    });

    it('deve excluir ao confirmar', async () => {
      mockExcluirMutateAsync.mockResolvedValue({});

      render(<LimitacoesTab />, { wrapper: createWrapper() });

      const excluirButtons = screen.getAllByText('Excluir');
      fireEvent.click(excluirButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Tem certeza/)).toBeInTheDocument();
      });

      // Encontra o botão de confirmar no modal
      const allExcluirButtons = screen.getAllByRole('button', { name: /Excluir/i });
      const confirmarButton = allExcluirButtons[allExcluirButtons.length - 1];
      fireEvent.click(confirmarButton);

      await waitFor(() => {
        expect(mockExcluirMutateAsync).toHaveBeenCalledWith('lim1');
      });
    });

    it('deve fechar modal ao cancelar exclusão', async () => {
      render(<LimitacoesTab />, { wrapper: createWrapper() });

      const excluirButtons = screen.getAllByText('Excluir');
      fireEvent.click(excluirButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Tem certeza/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

      await waitFor(() => {
        expect(screen.queryByText(/Tem certeza/)).not.toBeInTheDocument();
      });
    });

    it('deve logar erro ao falhar exclusão', async () => {
      mockExcluirMutateAsync.mockRejectedValue(new Error('Erro'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<LimitacoesTab />, { wrapper: createWrapper() });

      const excluirButtons = screen.getAllByText('Excluir');
      fireEvent.click(excluirButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Tem certeza/)).toBeInTheDocument();
      });

      const allExcluirButtons = screen.getAllByRole('button', { name: /Excluir/i });
      const confirmarButton = allExcluirButtons[allExcluirButtons.length - 1];
      fireEvent.click(confirmarButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Erro ao excluir limitação'));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Fechar modal', () => {
    it('deve fechar modal ao clicar em Cancelar', async () => {
      render(<LimitacoesTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('+ Nova Observação'));

      await waitFor(() => {
        expect(screen.getByText('Nova Observação')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      await waitFor(() => {
        expect(screen.queryByText('Nova Observação')).not.toBeInTheDocument();
      });
    });

    it('deve limpar formulário ao fechar modal', async () => {
      render(<LimitacoesTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('+ Nova Observação'));

      await waitFor(() => {
        expect(screen.getByText('Nova Observação')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/O Contratante deverá/);
      fireEvent.change(textarea, { target: { value: 'Texto temporário' } });

      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      // Abre novamente
      fireEvent.click(screen.getByText('+ Nova Observação'));

      await waitFor(() => {
        const newTextarea = screen.getByPlaceholderText(/O Contratante deverá/);
        expect(newTextarea).toHaveValue('');
      });
    });
  });

  describe('Validação do formulário', () => {
    it('não deve salvar com texto vazio', async () => {
      render(<LimitacoesTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('+ Nova Observação'));

      await waitFor(() => {
        expect(screen.getByText('Nova Observação')).toBeInTheDocument();
      });

      const cadastrarButton = screen.getByRole('button', { name: 'Cadastrar' });
      expect(cadastrarButton).toBeDisabled();
    });

    it('não deve salvar com texto apenas de espaços', async () => {
      render(<LimitacoesTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('+ Nova Observação'));

      await waitFor(() => {
        expect(screen.getByText('Nova Observação')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/O Contratante deverá/);
      fireEvent.change(textarea, { target: { value: '                              ' } });

      const cadastrarButton = screen.getByRole('button', { name: 'Cadastrar' });
      expect(cadastrarButton).toBeDisabled();
    });
  });
});
