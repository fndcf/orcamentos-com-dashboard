import { describe, it, expect } from 'vitest';
import { csvCell, gerarCSV } from '../../utils/csv';

describe('csvCell', () => {
  it('deve envolver o valor em aspas', () => {
    expect(csvCell('Cliente 1')).toBe('"Cliente 1"');
  });

  it('deve duplicar aspas internas', () => {
    expect(csvCell('Empresa "Alfa"')).toBe('"Empresa ""Alfa"""');
  });

  it('deve manter ponto e vírgula e quebra de linha dentro da célula', () => {
    expect(csvCell('A;B\nC')).toBe('"A;B\nC"');
  });

  it.each([
    ['=1+1', `"'=1+1"`],
    ['+55 11 9999', `"'+55 11 9999"`],
    ['-cmd', `"'-cmd"`],
    ['@SUM(A1)', `"'@SUM(A1)"`],
    ['\tTAB', `"'\tTAB"`],
    ['=HYPERLINK("https://exemplo.invalido";"Clique")', `"'=HYPERLINK(""https://exemplo.invalido"";""Clique"")"`],
  ])('deve neutralizar fórmula em %j', (entrada, esperado) => {
    expect(csvCell(entrada)).toBe(esperado);
  });

  it.each(['-123,45', '-10', '1234,56', '0'])('deve manter número %s sem prefixo', (numero) => {
    expect(csvCell(numero)).toBe(`"${numero}"`);
  });

  it('deve converter números, null e undefined', () => {
    expect(csvCell(42)).toBe('"42"');
    expect(csvCell(null)).toBe('""');
    expect(csvCell(undefined)).toBe('""');
  });
});

describe('gerarCSV', () => {
  it('deve gerar linhas separadas por quebra de linha e células por ponto e vírgula', () => {
    expect(
      gerarCSV([
        ['Número', 'Cliente'],
        [1, '=1+1'],
      ])
    ).toBe('"Número";"Cliente"\n"1";"\'=1+1"');
  });
});
