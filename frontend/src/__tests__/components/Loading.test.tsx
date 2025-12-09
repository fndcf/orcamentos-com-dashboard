import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading, LoadingOverlay } from '../../components/ui/Loading';

describe('Loading Components', () => {
  describe('Loading', () => {
    it('deve renderizar spinner', () => {
      const { container } = render(<Loading />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('deve renderizar com tamanho padrão', () => {
      const { container } = render(<Loading />);
      const spinner = container.querySelector('div > div');
      expect(spinner).toBeInTheDocument();
    });

    it('deve renderizar com tamanho customizado', () => {
      const { container } = render(<Loading size={60} />);
      const spinner = container.querySelector('div > div');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('LoadingOverlay', () => {
    it('deve renderizar overlay com conteúdo', () => {
      render(
        <LoadingOverlay data-testid="overlay">
          <Loading />
        </LoadingOverlay>
      );
      expect(screen.getByTestId('overlay')).toBeInTheDocument();
    });

    it('deve renderizar como overlay posicionado', () => {
      const { container } = render(
        <LoadingOverlay data-testid="overlay">
          <span>Carregando...</span>
        </LoadingOverlay>
      );
      const overlay = container.firstChild as HTMLElement;
      const styles = window.getComputedStyle(overlay);
      expect(styles.position).toBe('absolute');
    });
  });
});
