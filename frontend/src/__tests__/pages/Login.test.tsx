import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Login } from '../../pages/Login';

// Mock do useAuth
const mockSignIn = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o formulário de login', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText('FLAMA')).toBeInTheDocument();
    expect(screen.getByText('Sistema de Orçamentos')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('deve atualizar campos de input', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Senha');

    await userEvent.type(emailInput, 'test@test.com');
    await userEvent.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@test.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('deve chamar signIn ao submeter o formulário', async () => {
    mockSignIn.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    await userEvent.type(emailInput, 'test@test.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@test.com', 'password123');
    });
  });

  it('deve navegar para home após login bem sucedido', async () => {
    mockSignIn.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    await userEvent.type(emailInput, 'test@test.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('deve mostrar erro quando login falha', async () => {
    mockSignIn.mockRejectedValue(new Error('Invalid credentials'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    await userEvent.type(emailInput, 'test@test.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email ou senha incorretos')).toBeInTheDocument();
    });
  });

  it('deve mostrar "Entrando..." durante o loading', async () => {
    // Mock que demora para resolver
    mockSignIn.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    await userEvent.type(emailInput, 'test@test.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled();
  });

  it('deve ter inputs com placeholders corretos', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('deve ter inputs do tipo correto', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
  });
});
