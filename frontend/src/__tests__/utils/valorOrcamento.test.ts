import { describe, it, expect } from 'vitest';
import { descontoOrcamento, valorFinalOrcamento } from '../../utils/valorOrcamento';

const desconto = { percentual: 3.87, valorDesconto: 121, valorFinal: 3009 };

describe('valorFinalOrcamento', () => {
  it('deve descontar no pagamento à vista', () => {
    expect(valorFinalOrcamento({ valorTotal: 3130, condicaoPagamento: 'a_vista', descontoAVista: desconto })).toBe(3009);
  });

  it('deve descontar no parcelado (o desconto vale para todo o parcelamento)', () => {
    expect(valorFinalOrcamento({ valorTotal: 3130, condicaoPagamento: 'parcelado', descontoAVista: desconto })).toBe(3009);
  });

  it('deve ignorar desconto em condição "a combinar"', () => {
    expect(valorFinalOrcamento({ valorTotal: 3130, condicaoPagamento: 'a_combinar', descontoAVista: desconto })).toBe(3130);
  });

  it('deve usar o valor cheio sem desconto', () => {
    expect(valorFinalOrcamento({ valorTotal: 3130, condicaoPagamento: 'a_vista' })).toBe(3130);
  });

  it('não deve deixar o valor final negativo', () => {
    const exagerado = { percentual: 100, valorDesconto: 5000, valorFinal: 0 };
    expect(descontoOrcamento({ valorTotal: 3130, condicaoPagamento: 'a_vista', descontoAVista: exagerado })).toBe(3130);
    expect(valorFinalOrcamento({ valorTotal: 3130, condicaoPagamento: 'a_vista', descontoAVista: exagerado })).toBe(0);
  });
});
