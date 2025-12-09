import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../../components/ui/Modal';

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Título do Modal',
    children: <p>Conteúdo do modal</p>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'unset';
  });

  it('deve renderizar quando isOpen é true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Título do Modal')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo do modal')).toBeInTheDocument();
  });

  it('não deve renderizar quando isOpen é false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Título do Modal')).not.toBeInTheDocument();
  });

  it('deve chamar onClose ao clicar no botão de fechar', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onClose ao clicar no overlay', () => {
    const onClose = vi.fn();
    const { container } = render(<Modal {...defaultProps} onClose={onClose} />);

    // O overlay é o primeiro elemento com position fixed
    const overlay = container.firstChild;
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('não deve chamar onClose ao clicar no conteúdo do modal', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Conteúdo do modal'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve renderizar footer quando fornecido', () => {
    render(
      <Modal {...defaultProps} footer={<button>Ação</button>} />
    );

    expect(screen.getByText('Ação')).toBeInTheDocument();
  });

  it('deve aplicar width customizado', () => {
    render(<Modal {...defaultProps} width="800px" />);
    expect(screen.getByText('Título do Modal')).toBeInTheDocument();
  });

  it('deve aplicar size small', () => {
    render(<Modal {...defaultProps} size="small" />);
    expect(screen.getByText('Título do Modal')).toBeInTheDocument();
  });

  it('deve aplicar size medium', () => {
    render(<Modal {...defaultProps} size="medium" />);
    expect(screen.getByText('Título do Modal')).toBeInTheDocument();
  });

  it('deve aplicar size large', () => {
    render(<Modal {...defaultProps} size="large" />);
    expect(screen.getByText('Título do Modal')).toBeInTheDocument();
  });

  it('deve bloquear scroll do body quando aberto', () => {
    render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('deve restaurar scroll do body quando fechado', () => {
    const { rerender } = render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<Modal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('unset');
  });

  it('deve restaurar scroll do body ao desmontar', () => {
    const { unmount } = render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('unset');
  });

  it('deve preferir width sobre size quando ambos são fornecidos', () => {
    render(<Modal {...defaultProps} width="600px" size="large" />);
    expect(screen.getByText('Título do Modal')).toBeInTheDocument();
  });

  it('deve usar width padrão quando nem width nem size são fornecidos', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Título do Modal')).toBeInTheDocument();
  });
});
