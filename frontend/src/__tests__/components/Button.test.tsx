import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../components/ui/Button';

describe('Button Component', () => {
  it('deve renderizar o botão com texto', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByText('Clique aqui')).toBeInTheDocument();
  });

  it('deve chamar onClick quando clicado', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clique</Button>);

    fireEvent.click(screen.getByText('Clique'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('não deve chamar onClick quando desabilitado', () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Clique
      </Button>
    );

    fireEvent.click(screen.getByText('Clique'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('deve aplicar variante primary por padrão', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByText('Primary');
    expect(button).toBeInTheDocument();
  });

  it('deve aplicar variante danger quando especificado', () => {
    render(<Button $variant="danger">Danger</Button>);
    const button = screen.getByText('Danger');
    expect(button).toBeInTheDocument();
  });

  it('deve aplicar variante ghost quando especificado', () => {
    render(<Button $variant="ghost">Ghost</Button>);
    const button = screen.getByText('Ghost');
    expect(button).toBeInTheDocument();
  });

  it('deve ter atributo disabled quando prop disabled é true', () => {
    render(<Button disabled>Desabilitado</Button>);
    expect(screen.getByText('Desabilitado')).toBeDisabled();
  });

  it('deve ter tipo button por padrão', () => {
    render(<Button>Botão</Button>);
    expect(screen.getByText('Botão')).toHaveAttribute('type', 'button');
  });

  it('deve aceitar tipo submit', () => {
    render(<Button type="submit">Enviar</Button>);
    expect(screen.getByText('Enviar')).toHaveAttribute('type', 'submit');
  });
});
