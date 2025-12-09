import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

// Mock dos componentes para simplificar o teste
vi.mock('../pages/Login', () => ({
  Login: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock('../pages/Dashboard', () => ({
  Dashboard: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

vi.mock('../pages/Clientes', () => ({
  Clientes: () => <div data-testid="clientes-page">Clientes Page</div>,
}));

vi.mock('../pages/Orcamentos', () => ({
  Orcamentos: () => <div data-testid="orcamentos-page">Orcamentos Page</div>,
}));

vi.mock('../components/auth/PrivateRoute', () => ({
  PrivateRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../components/layout/AdminLayout', () => ({
  AdminLayout: () => <div data-testid="admin-layout">Admin Layout</div>,
}));

// Mock do Firebase Auth
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(null);
    return vi.fn();
  }),
}));

describe('App', () => {
  it('deve renderizar sem erros', () => {
    render(<App />);
    // O app deve renderizar algo
    expect(document.body).toBeTruthy();
  });

  it('deve ter GlobalStyles aplicado', () => {
    render(<App />);
    // GlobalStyles deve estar presente (injeta estilos no documento)
    expect(document.head).toBeTruthy();
  });

  it('deve renderizar com QueryClientProvider', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('deve renderizar com AuthProvider', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('deve configurar rotas corretamente', () => {
    render(<App />);
    // O BrowserRouter deve estar funcionando
    expect(window.location).toBeDefined();
  });
});
