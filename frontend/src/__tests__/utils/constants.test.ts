import { describe, it, expect } from 'vitest';
import {
  formatCPF,
  formatCNPJ,
  formatDocument,
  formatCEP,
  formatPhone,
  formatCurrency,
  formatDate,
  maskCEP,
  maskPhone,
} from '../../utils/constants';

describe('Funções de Formatação', () => {
  describe('formatCPF', () => {
    it('deve formatar CPF corretamente', () => {
      expect(formatCPF('12345678901')).toBe('123.456.789-01');
    });

    it('deve lidar com CPF já com formatação', () => {
      expect(formatCPF('123.456.789-01')).toBe('123.456.789-01');
    });

    it('deve retornar sem formatação para CPF incompleto', () => {
      expect(formatCPF('123456')).toBe('123456');
    });
  });

  describe('formatCNPJ', () => {
    it('deve formatar CNPJ corretamente', () => {
      expect(formatCNPJ('12345678901234')).toBe('12.345.678/9012-34');
    });

    it('deve lidar com CNPJ já com formatação', () => {
      expect(formatCNPJ('12.345.678/9012-34')).toBe('12.345.678/9012-34');
    });

    it('deve retornar sem formatação para CNPJ incompleto', () => {
      expect(formatCNPJ('12345678')).toBe('12345678');
    });
  });

  describe('formatDocument', () => {
    it('deve formatar CPF quando documento tem 11 dígitos', () => {
      expect(formatDocument('12345678901')).toBe('123.456.789-01');
    });

    it('deve formatar CNPJ quando documento tem 14 dígitos', () => {
      expect(formatDocument('12345678901234')).toBe('12.345.678/9012-34');
    });

    it('deve retornar sem formatação para documentos com menos de 11 dígitos', () => {
      expect(formatDocument('123456789')).toBe('123456789');
    });
  });

  describe('formatCEP', () => {
    it('deve formatar CEP corretamente', () => {
      expect(formatCEP('01234567')).toBe('01234-567');
    });

    it('deve lidar com CEP já com formatação', () => {
      expect(formatCEP('01234-567')).toBe('01234-567');
    });
  });

  describe('formatPhone', () => {
    it('deve formatar telefone celular (11 dígitos)', () => {
      expect(formatPhone('11999999999')).toBe('(11) 99999-9999');
    });

    it('deve formatar telefone fixo (10 dígitos)', () => {
      expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
    });

    it('deve lidar com telefone já formatado', () => {
      expect(formatPhone('(11) 99999-9999')).toBe('(11) 99999-9999');
    });
  });

  describe('formatCurrency', () => {
    it('deve formatar valor em reais', () => {
      const result = formatCurrency(1234.56);
      // Verifica se contém os elementos esperados (ignora non-breaking spaces)
      expect(result).toContain('R$');
      expect(result).toContain('1.234');
      expect(result).toContain('56');
    });

    it('deve formatar valor inteiro', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('R$');
      expect(result).toContain('1.000');
      expect(result).toContain('00');
    });

    it('deve formatar valor zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('R$');
      expect(result).toContain('0,00');
    });

    it('deve formatar valor negativo', () => {
      const result = formatCurrency(-500);
      expect(result).toContain('R$');
      expect(result).toContain('500');
    });
  });

  describe('formatDate', () => {
    it('deve formatar data a partir de objeto Date', () => {
      const date = new Date(2024, 0, 15); // 15 de janeiro de 2024
      expect(formatDate(date)).toBe('15/01/2024');
    });

    it('deve formatar data a partir de string ISO', () => {
      // Usa uma data com horário para evitar problemas de timezone
      const result = formatDate('2024-06-15T12:00:00.000Z');
      expect(result).toMatch(/\d{2}\/\d{2}\/2024/);
    });
  });

  describe('maskCEP', () => {
    it.each([
      ['1', '1'],
      ['11740', '11740'],
      ['117406', '11740-6'],
      ['11740630', '11740-630'],
      ['11740-630', '11740-630'],
    ])('deve formatar %s como %s enquanto digita', (entrada, esperado) => {
      expect(maskCEP(entrada)).toBe(esperado);
    });

    it('deve remover letras e limitar a 8 dígitos', () => {
      expect(maskCEP('D11111111111111111111')).toBe('11111-111');
    });
  });

  describe('maskPhone', () => {
    it.each([
      ['13', '13'],
      ['134', '(13) 4'],
      ['1334115455', '(13) 3411-5455'],
      ['13991737341', '(13) 99173-7341'],
      ['(13) 99173-7341', '(13) 99173-7341'],
    ])('deve formatar %s como %s', (entrada, esperado) => {
      expect(maskPhone(entrada)).toBe(esperado);
    });

    it('deve remover letras e limitar a 11 dígitos', () => {
      expect(maskPhone('1111111111111111111111111')).toBe('(11) 11111-1111');
      expect(maskPhone('abc13x99173y7341')).toBe('(13) 99173-7341');
    });
  });
});
