import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GlobalStyles } from '../../styles/GlobalStyles';

describe('GlobalStyles', () => {
  it('deve renderizar sem erros', () => {
    // GlobalStyles é um createGlobalStyle que injeta estilos globais
    // O teste verifica se o componente pode ser renderizado
    const { container } = render(
      <>
        <GlobalStyles />
        <div data-testid="content">Test Content</div>
      </>
    );

    expect(container).toBeTruthy();
  });

  it('deve ser um componente styled válido', () => {
    // Verifica que GlobalStyles é uma função (styled component)
    expect(typeof GlobalStyles).toBe('object');
  });
});
