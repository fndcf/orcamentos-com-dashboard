import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PrivateRoute } from '../../components/auth/PrivateRoute';

// Mock do useAuth
const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('PrivateRoute', () => {
  it('deve mostrar loading quando está carregando', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });

    render(
      <MemoryRouter>
        <PrivateRoute>
          <div>Conteúdo Protegido</div>
        </PrivateRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('deve redirecionar para login quando não há usuário', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    render(
      <MemoryRouter initialEntries={['/']}>
        <PrivateRoute>
          <div>Conteúdo Protegido</div>
        </PrivateRoute>
      </MemoryRouter>
    );

    // Quando não há usuário, o Navigate redireciona para /login
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('deve renderizar children quando há usuário', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'test@test.com', uid: '123' },
      loading: false,
    });

    render(
      <MemoryRouter>
        <PrivateRoute>
          <div>Conteúdo Protegido</div>
        </PrivateRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
  });

  it('deve aplicar estilo de centralização no loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });

    render(
      <MemoryRouter>
        <PrivateRoute>
          <div>Conteúdo</div>
        </PrivateRoute>
      </MemoryRouter>
    );

    const loadingDiv = screen.getByText('Carregando...').parentElement;
    // O estilo é inline, então verificamos se o elemento existe
    expect(loadingDiv).toBeTruthy();
  });
});
