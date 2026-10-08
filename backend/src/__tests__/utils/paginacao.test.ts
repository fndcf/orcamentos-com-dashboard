import { MAX_ITENS_POR_PAGINA, numeroPagina, tamanhoPagina } from '../../utils/paginacao';

describe('tamanhoPagina', () => {
  it('deve usar o valor informado dentro do limite', () => {
    expect(tamanhoPagina('20', 10)).toBe(20);
  });

  it('deve limitar ao máximo permitido', () => {
    expect(tamanhoPagina('100000', 10)).toBe(MAX_ITENS_POR_PAGINA);
  });

  it.each([undefined, '', 'abc', '0', '-5'])('deve usar o padrão para %p', (valor) => {
    expect(tamanhoPagina(valor, 10)).toBe(10);
  });
});

describe('numeroPagina', () => {
  it('deve usar a página informada', () => {
    expect(numeroPagina('3')).toBe(3);
  });

  it.each([undefined, 'abc', '0', '-2'])('deve usar a página 1 para %p', (valor) => {
    expect(numeroPagina(valor)).toBe(1);
  });
});
