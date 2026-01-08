import { describe, it, expect } from 'vitest';
import type {
  OrcamentoStatus,
  Cliente,
  OrcamentoItemCompleto,
  Orcamento,
  PalavraChave,
  ConfiguracoesGerais,
  Notificacao,
  Usuario,
  DashboardStats,
  BrasilAPICNPJ,
} from '../../types';

describe('Types', () => {
  describe('OrcamentoStatus', () => {
    it('deve aceitar valores válidos de status', () => {
      const statusAberto: OrcamentoStatus = 'aberto';
      const statusAceito: OrcamentoStatus = 'aceito';
      const statusRecusado: OrcamentoStatus = 'recusado';
      const statusExpirado: OrcamentoStatus = 'expirado';

      expect(statusAberto).toBe('aberto');
      expect(statusAceito).toBe('aceito');
      expect(statusRecusado).toBe('recusado');
      expect(statusExpirado).toBe('expirado');
    });
  });

  describe('Cliente', () => {
    it('deve criar objeto Cliente válido', () => {
      const cliente: Cliente = {
        id: '1',
        razaoSocial: 'Empresa LTDA',
        nomeFantasia: 'Empresa',
        cnpj: '12.345.678/0001-90',
        endereco: 'Rua Teste, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        telefone: '(11) 99999-9999',
        email: 'contato@empresa.com',
        createdAt: new Date(),
      };

      expect(cliente.razaoSocial).toBe('Empresa LTDA');
      expect(cliente.cnpj).toBe('12.345.678/0001-90');
    });

    it('deve aceitar Cliente sem campos opcionais', () => {
      const cliente: Cliente = {
        razaoSocial: 'Empresa LTDA',
        cnpj: '12.345.678/0001-90',
        endereco: 'Rua Teste, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        telefone: '(11) 99999-9999',
        email: 'contato@empresa.com',
        createdAt: new Date(),
      };

      expect(cliente.id).toBeUndefined();
      expect(cliente.nomeFantasia).toBeUndefined();
    });
  });

  describe('OrcamentoItemCompleto', () => {
    it('deve criar objeto OrcamentoItemCompleto válido', () => {
      const item: OrcamentoItemCompleto = {
        etapa: 'residencial',
        categoriaId: 'cat1',
        categoriaNome: 'Extintores',
        descricao: 'Extintor ABC 6kg',
        unidade: 'UN',
        quantidade: 10,
        valorUnitarioMaoDeObra: 50.0,
        valorUnitarioMaterial: 100.0,
        valorTotalMaoDeObra: 500.0,
        valorTotalMaterial: 1000.0,
        valorTotal: 1500.0,
      };

      expect(item.descricao).toBe('Extintor ABC 6kg');
      expect(item.valorTotal).toBe(1500.0);
      expect(item.etapa).toBe('residencial');
    });
  });

  describe('Orcamento', () => {
    it('deve criar objeto Orcamento válido', () => {
      const orcamento: Orcamento = {
        id: '1',
        numero: 1,
        versao: 1,
        tipo: 'completo',
        clienteId: 'c1',
        clienteNome: 'Cliente Teste',
        clienteCnpj: '12.345.678/0001-90',
        status: 'aberto',
        dataEmissao: new Date(),
        dataValidade: new Date(),
        itensCompleto: [],
        valorTotal: 0,
        createdAt: new Date(),
      };

      expect(orcamento.numero).toBe(1);
      expect(orcamento.status).toBe('aberto');
      expect(orcamento.tipo).toBe('completo');
    });
  });

  describe('PalavraChave', () => {
    it('deve criar objeto PalavraChave válido', () => {
      const palavra: PalavraChave = {
        id: '1',
        palavra: 'extintor',
        prazoDias: 365,
        ativo: true,
        createdAt: new Date(),
      };

      expect(palavra.palavra).toBe('extintor');
      expect(palavra.prazoDias).toBe(365);
    });
  });

  describe('ConfiguracoesGerais', () => {
    it('deve criar objeto ConfiguracoesGerais válido', () => {
      const config: ConfiguracoesGerais = {
        diasValidadeOrcamento: 30,
        nomeEmpresa: 'FLAMA',
        cnpjEmpresa: '54.513.212/0001-00',
        enderecoEmpresa: 'Rua José Apelian, 196',
        telefoneEmpresa: '13 99173-7341',
        emailEmpresa: 'contato@flama.com.br',
      };

      expect(config.diasValidadeOrcamento).toBe(30);
      expect(config.nomeEmpresa).toBe('FLAMA');
    });
  });

  describe('Notificacao', () => {
    it('deve criar objeto Notificacao válido', () => {
      const notificacao: Notificacao = {
        id: '1',
        orcamentoId: 'o1',
        orcamentoNumero: 1,
        clienteId: 'c1',
        clienteNome: 'Cliente Teste',
        itemDescricao: 'Extintor ABC',
        palavraChave: 'extintor',
        dataVencimento: new Date(),
        lida: false,
        createdAt: new Date(),
      };

      expect(notificacao.orcamentoNumero).toBe(1);
      expect(notificacao.lida).toBe(false);
    });
  });

  describe('Usuario', () => {
    it('deve criar objeto Usuario válido', () => {
      const usuario: Usuario = {
        id: '1',
        email: 'usuario@email.com',
        nome: 'Usuário Teste',
        createdAt: new Date(),
      };

      expect(usuario.email).toBe('usuario@email.com');
      expect(usuario.nome).toBe('Usuário Teste');
    });
  });

  describe('DashboardStats', () => {
    it('deve criar objeto DashboardStats válido', () => {
      const stats: DashboardStats = {
        total: 80,
        abertos: 10,
        aceitos: 50,
        recusados: 15,
        expirados: 5,
        valorTotal: 500000,
        valorAceitos: 350000,
        totalClientes: 22,
        porMes: [
          { mes: 'Jan/26', ano: 2026, mesIndex: 0, total: 10, aceitos: 5, valor: 50000 },
        ],
      };

      expect(stats.total).toBe(80);
      expect(stats.aceitos).toBe(50);
      expect(stats.porMes[0].mes).toBe('Jan/26');
    });
  });

  describe('BrasilAPICNPJ', () => {
    it('deve criar objeto BrasilAPICNPJ válido', () => {
      const dados: BrasilAPICNPJ = {
        cnpj: '54513212000100',
        razao_social: 'FLAMA SISTEMAS DE PROTECAO LTDA',
        nome_fantasia: 'FLAMA',
        logradouro: 'Rua José Apelian',
        numero: '196',
        complemento: '',
        bairro: 'Savoy',
        municipio: 'Itanhaém',
        uf: 'SP',
        cep: '11742630',
        telefone: '1399173734',
        email: 'contato@flama.com.br',
      };

      expect(dados.razao_social).toBe('FLAMA SISTEMAS DE PROTECAO LTDA');
      expect(dados.municipio).toBe('Itanhaém');
    });
  });
});
