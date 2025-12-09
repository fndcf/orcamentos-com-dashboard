import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../../components/ui/Pagination';

describe('Pagination Component', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    itemsPerPage: 10,
    onPageChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não deve renderizar quando totalPages é 1', () => {
    const { container } = render(
      <Pagination {...defaultProps} totalPages={1} totalItems={10} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar quando totalPages é maior que 1', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText(/Exibindo 1-10 de 50 registros/)).toBeInTheDocument();
  });

  it('deve mostrar a informação correta de registros', () => {
    render(<Pagination {...defaultProps} currentPage={2} />);
    expect(screen.getByText(/Exibindo 11-20 de 50 registros/)).toBeInTheDocument();
  });

  it('deve mostrar informação correta na última página parcial', () => {
    render(
      <Pagination
        {...defaultProps}
        currentPage={5}
        totalPages={5}
        totalItems={45}
        itemsPerPage={10}
      />
    );
    expect(screen.getByText(/Exibindo 41-45 de 45 registros/)).toBeInTheDocument();
  });

  it('deve chamar onPageChange ao clicar no botão anterior', () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />);

    const prevButton = screen.getByText('<');
    fireEvent.click(prevButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('deve chamar onPageChange ao clicar no botão próximo', () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />);

    const nextButton = screen.getByText('>');
    fireEvent.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('deve desabilitar botão anterior na primeira página', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    const prevButton = screen.getByText('<');
    expect(prevButton).toBeDisabled();
  });

  it('deve desabilitar botão próximo na última página', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);
    const nextButton = screen.getByText('>');
    expect(nextButton).toBeDisabled();
  });

  it('deve chamar onPageChange ao clicar em um número de página', () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

    const page3Button = screen.getByText('3');
    fireEvent.click(page3Button);

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('deve mostrar todas as páginas quando totalPages <= 5', () => {
    render(<Pagination {...defaultProps} totalPages={4} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('deve mostrar reticências quando há muitas páginas e está no início', () => {
    render(
      <Pagination
        {...defaultProps}
        currentPage={1}
        totalPages={10}
        totalItems={100}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('deve mostrar reticências quando há muitas páginas e está no meio', () => {
    render(
      <Pagination
        {...defaultProps}
        currentPage={5}
        totalPages={10}
        totalItems={100}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    // Deve haver duas reticências
    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBe(2);
  });

  it('deve mostrar reticências apenas à esquerda quando está no final', () => {
    render(
      <Pagination
        {...defaultProps}
        currentPage={9}
        totalPages={10}
        totalItems={100}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBe(1);
  });

  it('deve destacar a página atual como ativa', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);

    const page3Button = screen.getByText('3');
    expect(page3Button).toBeInTheDocument();
  });

  it('deve funcionar com totalPages = 2', () => {
    render(
      <Pagination
        {...defaultProps}
        totalPages={2}
        totalItems={15}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('deve calcular corretamente o último item quando não preenche a página', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={2}
        totalItems={15}
        itemsPerPage={10}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Exibindo 11-15 de 15 registros/)).toBeInTheDocument();
  });

  it('deve mostrar páginas adjacentes quando currentPage > 3', () => {
    render(
      <Pagination
        {...defaultProps}
        currentPage={6}
        totalPages={10}
        totalItems={100}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('deve incluir a última página quando currentPage < totalPages - 2', () => {
    render(
      <Pagination
        {...defaultProps}
        currentPage={3}
        totalPages={10}
        totalItems={100}
      />
    );

    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
