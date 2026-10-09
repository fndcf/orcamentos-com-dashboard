import { describe, it, expect } from 'vitest';
import { dataLocalISO, diaMes } from '../../utils/datas';

describe('datas locais', () => {
  it('deve usar o dia local, não o dia em UTC', () => {
    // 09/10 às 22h no horário local continua sendo 09/10
    expect(dataLocalISO(new Date(2026, 9, 9, 22, 0))).toBe('2026-10-09');
    expect(dataLocalISO(new Date(2026, 9, 1, 0, 30))).toBe('2026-10-01');
  });

  it('deve formatar o rótulo do dia sem deslocar a data', () => {
    expect(diaMes('2026-10-01')).toBe('01/10');
    expect(diaMes('2026-12-31')).toBe('31/12');
  });
});
