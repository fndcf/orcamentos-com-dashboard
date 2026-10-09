import { inicioDoDia, fimDoDia, mesAnoBrasilia } from '../../utils/datas';

describe('datas no horário de Brasília', () => {
  it('deve começar o dia às 00:00 de Brasília (03:00 UTC)', () => {
    expect(inicioDoDia('2026-10-01').toISOString()).toBe('2026-10-01T03:00:00.000Z');
  });

  it('deve terminar o dia às 23:59:59.999 de Brasília', () => {
    expect(fimDoDia('2026-10-09').toISOString()).toBe('2026-10-10T02:59:59.999Z');
  });

  it('deve ler datas com horário como estão', () => {
    expect(inicioDoDia('2026-10-01T12:00:00.000Z').toISOString()).toBe('2026-10-01T12:00:00.000Z');
  });

  it('deve manter no mês certo um orçamento emitido à noite no último dia do mês', () => {
    // 31/10 às 23h em Brasília = 01/11 02:00 UTC
    expect(mesAnoBrasilia(new Date('2026-11-01T02:00:00.000Z'))).toEqual({ mes: 9, ano: 2026 });
    expect(mesAnoBrasilia(new Date('2026-11-01T03:00:00.000Z'))).toEqual({ mes: 10, ano: 2026 });
  });

  it('deve virar o ano no horário de Brasília', () => {
    expect(mesAnoBrasilia(new Date('2027-01-01T02:59:00.000Z'))).toEqual({ mes: 11, ano: 2026 });
  });
});
