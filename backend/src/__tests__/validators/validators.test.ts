import {
  validar,
  clienteCriarSchema,
  clienteAtualizarSchema,
  configuracoesGeraisAtualizarSchema,
  orcamentoCriarSchema,
  orcamentoAtualizarSchema,
  orcamentoStatusSchema,
  servicoCriarSchema,
  servicoAtualizarSchema,
  categoriaItemCriarSchema,
  limitacaoAtualizarSchema,
  palavraChaveCriarSchema,
  palavraChaveAtualizarSchema,
  itemServicoCriarSchema,
  itemServicoAtualizarSchema,
} from '../../validators';
import { ValidationError } from '../../utils/errors';

const esperarErro = (fn: () => unknown, mensagem: string) => {
  expect(fn).toThrow(ValidationError);
  expect(fn).toThrow(mensagem);
};

describe('validators', () => {
  describe('cliente', () => {
    const clienteValido = {
      razaoSocial: 'Empresa Teste',
      nomeFantasia: 'Teste',
      cnpj: '12.345.678/0001-90',
      tipoPessoa: 'juridica',
      endereco: 'Rua A, 1',
      cidade: 'Santos',
      estado: 'SP',
      cep: '11000-000',
      telefone: '13 99999-9999',
      email: 'contato@teste.com',
    };

    it('deve aceitar o payload enviado pelo formulário', () => {
      expect(validar(clienteCriarSchema, clienteValido)).toEqual(clienteValido);
    });

    it('deve descartar campos internos como id, createdAt e razaoSocialUpper', () => {
      const resultado = validar(clienteAtualizarSchema, {
        id: 'outro-id',
        createdAt: '2000-01-01',
        razaoSocialUpper: 'ZZZ',
        razaoSocial: 'Novo Nome',
      });

      expect(resultado).toEqual({ razaoSocial: 'Novo Nome' });
    });

    it('deve exigir razaoSocial na criação', () => {
      esperarErro(() => validar(clienteCriarSchema, { cnpj: '123' }), 'Campo obrigatório ausente: razaoSocial');
    });

    it('deve rejeitar tipoPessoa fora das opções', () => {
      esperarErro(
        () => validar(clienteAtualizarSchema, { tipoPessoa: 'outro' }),
        'Campo "tipoPessoa" inválido'
      );
    });
  });

  describe('configurações gerais', () => {
    it('deve rejeitar diasValidadeOrcamento como texto', () => {
      esperarErro(
        () => validar(configuracoesGeraisAtualizarSchema, { diasValidadeOrcamento: 'abc' }),
        'Campo "diasValidadeOrcamento" deve ser número'
      );
    });

    it('deve rejeitar valores negativos de imposto', () => {
      esperarErro(
        () => validar(configuracoesGeraisAtualizarSchema, { impostoMaterial: -5 }),
        'Campo "impostoMaterial" inválido'
      );
    });

    it('deve descartar chaves arbitrárias', () => {
      const resultado = validar(configuracoesGeraisAtualizarSchema, {
        telefoneEmpresa: '13 3411-5455',
        chaveArbitraria: 'x',
        __proto__: { admin: true },
      });

      expect(resultado).toEqual({ telefoneEmpresa: '13 3411-5455' });
    });

    it('deve aceitar o payload completo da aba Empresa', () => {
      const payload = {
        nomeEmpresa: 'FLAMA',
        cnpjEmpresa: '54.513.212/0001-00',
        enderecoEmpresa: 'Rua X',
        telefoneEmpresa: '13 99173-7341',
        emailEmpresa: '',
        diasValidadeOrcamento: 30,
        parcelamentoMaxParcelas: 6,
        parcelamentoValorMinimo: 1000,
        parcelamentoJurosAPartirDe: 3,
        parcelamentoTaxaJuros: 2.5,
        custoFixoMensal: 0,
        impostoMaterial: 0,
        impostoServico: 0,
      };

      expect(validar(configuracoesGeraisAtualizarSchema, payload)).toEqual(payload);
    });
  });

  describe('orçamento', () => {
    it('deve exigir clienteId na criação', () => {
      esperarErro(() => validar(orcamentoCriarSchema, {}), 'Campo obrigatório ausente: clienteId');
    });

    it('deve converter dataValidade em data na atualização', () => {
      const resultado = validar(orcamentoAtualizarSchema, { dataValidade: '2026-12-31T00:00:00.000Z' });

      expect(resultado.dataValidade).toBeInstanceOf(Date);
    });

    it('deve rejeitar dataValidade inválida', () => {
      esperarErro(
        () => validar(orcamentoAtualizarSchema, { dataValidade: 'não é data' }),
        'Campo "dataValidade" inválido'
      );
    });

    it('deve rejeitar prazo como texto', () => {
      esperarErro(
        () => validar(orcamentoAtualizarSchema, { prazoExecucaoServicos: '20' }),
        'Campo "prazoExecucaoServicos" deve ser número'
      );
    });

    it('deve rejeitar item sem etapa', () => {
      esperarErro(
        () =>
          validar(orcamentoAtualizarSchema, {
            itensCompleto: [
              {
                categoriaId: 'c',
                categoriaNome: 'C',
                descricao: 'Item',
                unidade: 'un',
                quantidade: 1,
                valorUnitarioMaoDeObra: 1,
                valorUnitarioMaterial: 1,
              },
            ],
          }),
        'Campo obrigatório ausente: itensCompleto.0.etapa'
      );
    });
  });

  describe('catálogo', () => {
    const itemDaTela = {
      categoriaId: 'cat1',
      descricao: 'Extintor PQS 4kg',
      unidade: 'UN',
      valorUnitario: 150.5,
      valorMaoDeObraUnitario: 30,
      valorCusto: 90,
      valorMaoDeObraCusto: 10,
    };

    it('deve aceitar o payload de item enviado pela tela de Configurações', () => {
      expect(validar(itemServicoCriarSchema, itemDaTela)).toEqual(itemDaTela);
    });

    it('deve aceitar item sem valores (campos vazios são omitidos pela tela)', () => {
      const semValores = { categoriaId: 'cat1', descricao: 'Item sem preço', unidade: 'UN' };
      expect(validar(itemServicoCriarSchema, semValores)).toEqual(semValores);
    });

    it('deve rejeitar valorCusto como texto', () => {
      esperarErro(
        () => validar(itemServicoAtualizarSchema, { valorCusto: 'abc' }),
        'Campo "valorCusto" deve ser número'
      );
    });

    it('deve rejeitar valor nulo (NaN da tela vira null no JSON)', () => {
      esperarErro(
        () => validar(itemServicoAtualizarSchema, { valorUnitario: null }),
        'Campo "valorUnitario" deve ser número'
      );
    });

    it('deve rejeitar valores negativos', () => {
      esperarErro(() => validar(itemServicoAtualizarSchema, { valorCusto: -1 }), 'Campo "valorCusto" inválido');
    });

    it('deve rejeitar ativo como texto', () => {
      esperarErro(
        () => validar(servicoAtualizarSchema, { ativo: 'false' }),
        'Campo "ativo" deve ser verdadeiro ou falso'
      );
    });

    it('deve rejeitar ordem negativa ou fracionária', () => {
      esperarErro(() => validar(limitacaoAtualizarSchema, { ordem: -1 }), 'Campo "ordem" inválido');
      esperarErro(() => validar(limitacaoAtualizarSchema, { ordem: 1.5 }), 'Campo "ordem" deve ser número inteiro');
    });

    it('deve rejeitar prazoDias como texto', () => {
      esperarErro(
        () => validar(palavraChaveAtualizarSchema, { prazoDias: 'abc' }),
        'Campo "prazoDias" deve ser número'
      );
    });

    it('deve aceitar os payloads de serviço, categoria e palavra-chave das telas', () => {
      expect(validar(servicoCriarSchema, { descricao: 'Manutenção de extintores' })).toEqual({
        descricao: 'Manutenção de extintores',
      });
      expect(validar(categoriaItemCriarSchema, { nome: 'Hidrantes' })).toEqual({ nome: 'Hidrantes' });
      expect(validar(palavraChaveCriarSchema, { palavra: 'EXTINTOR', prazoDias: 365 })).toEqual({
        palavra: 'EXTINTOR',
        prazoDias: 365,
      });
    });

    it('deve descartar campos extras do catálogo', () => {
      expect(validar(servicoAtualizarSchema, { descricao: 'Serviço X', createdAt: 'x', id: 'y' })).toEqual({
        descricao: 'Serviço X',
      });
    });
  });

  describe('status do orçamento', () => {
    it('deve aceitar status conhecido', () => {
      expect(validar(orcamentoStatusSchema, { status: 'aceito' })).toEqual({ status: 'aceito' });
    });

    it('deve rejeitar status desconhecido', () => {
      esperarErro(() => validar(orcamentoStatusSchema, { status: 'pago' }), 'Campo "status" inválido');
    });
  });

  it('deve tratar corpo ausente', () => {
    esperarErro(() => validar(clienteCriarSchema, undefined), 'Campo obrigatório ausente: corpo da requisição');
  });
});
