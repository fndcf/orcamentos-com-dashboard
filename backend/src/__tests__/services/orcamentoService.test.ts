import { orcamentoService } from '../../services/orcamentoService';
import { orcamentoRepository } from '../../repositories/orcamentoRepository';
import { clienteRepository } from '../../repositories/clienteRepository';
import { configuracoesGeraisRepository } from '../../repositories/configuracoesGeraisRepository';
import { ValidationError, NotFoundError } from '../../utils/errors';

// Mock dos repositories
jest.mock('../../repositories/orcamentoRepository', () => ({
  orcamentoRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByClienteId: jest.fn(),
    findByStatus: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
    getNextNumero: jest.fn(),
    getEstatisticas: jest.fn(),
  },
}));

jest.mock('../../repositories/clienteRepository', () => ({
  clienteRepository: {
    findById: jest.fn(),
  },
}));

jest.mock('../../repositories/configuracoesGeraisRepository', () => ({
  configuracoesGeraisRepository: {
    get: jest.fn(),
  },
}));

describe('orcamentoService', () => {
  const mockCliente = {
    id: 'c1',
    razaoSocial: 'Empresa Teste',
    cnpj: '12345678901234',
    endereco: 'Rua Teste, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234567',
    telefone: '11999999999',
    email: 'teste@email.com',
  };

  const mockOrcamentoCompleto = {
    id: 'o1',
    numero: 1,
    versao: 0,
    tipo: 'completo' as const,
    clienteId: 'c1',
    clienteNome: 'Empresa Teste',
    clienteCnpj: '12345678901234',
    status: 'aberto' as const,
    dataEmissao: new Date(),
    dataValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    servicoId: 's1',
    servicoDescricao: 'Serviço de Manutenção',
    itensCompleto: [
      {
        etapa: 'comercial' as const,
        categoriaId: 'cat1',
        categoriaNome: 'Extintor',
        descricao: 'Extintor ABC 6kg',
        unidade: 'UN',
        quantidade: 10,
        valorUnitarioMaoDeObra: 50,
        valorUnitarioMaterial: 100,
        valorTotalMaoDeObra: 500,
        valorTotalMaterial: 1000,
        valorTotal: 1500,
      },
    ],
    valorTotalMaoDeObra: 500,
    valorTotalMaterial: 1000,
    valorTotal: 1500,
  };

  const mockConfiguracoes = {
    diasValidadeOrcamento: 30,
    nomeEmpresa: 'Empresa Teste',
    cnpjEmpresa: '12345678901234',
    enderecoEmpresa: 'Rua Teste, 123',
    telefoneEmpresa: '11999999999',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Configura o mock das configurações gerais por padrão
    (configuracoesGeraisRepository.get as jest.Mock).mockResolvedValue(mockConfiguracoes);
  });

  describe('listar', () => {
    it('deve listar todos os orçamentos', async () => {
      (orcamentoRepository.findAll as jest.Mock).mockResolvedValue([mockOrcamentoCompleto]);

      const result = await orcamentoService.listar();

      expect(orcamentoRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockOrcamentoCompleto]);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar orçamento por ID', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);

      const result = await orcamentoService.buscarPorId('o1');

      expect(orcamentoRepository.findById).toHaveBeenCalledWith('o1');
      expect(result).toEqual(mockOrcamentoCompleto);
    });
  });

  describe('buscarPorCliente', () => {
    it('deve buscar orçamentos por cliente', async () => {
      (orcamentoRepository.findByClienteId as jest.Mock).mockResolvedValue([mockOrcamentoCompleto]);

      const result = await orcamentoService.buscarPorCliente('c1');

      expect(orcamentoRepository.findByClienteId).toHaveBeenCalledWith('c1');
      expect(result).toEqual([mockOrcamentoCompleto]);
    });
  });

  describe('buscarPorStatus', () => {
    it('deve buscar orçamentos por status', async () => {
      (orcamentoRepository.findByStatus as jest.Mock).mockResolvedValue([mockOrcamentoCompleto]);

      const result = await orcamentoService.buscarPorStatus('aberto');

      expect(orcamentoRepository.findByStatus).toHaveBeenCalledWith('aberto');
      expect(result).toEqual([mockOrcamentoCompleto]);
    });
  });

  describe('criar', () => {
    it('deve criar um novo orçamento completo', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);
      (orcamentoRepository.getNextNumero as jest.Mock).mockResolvedValue(1);
      (orcamentoRepository.create as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        servicoDescricao: 'Serviço de Manutenção',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintor',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 10,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 1000,
            valorTotal: 1500,
          },
        ],
      };

      const result = await orcamentoService.criar(data);

      expect(clienteRepository.findById).toHaveBeenCalledWith('c1');
      expect(orcamentoRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockOrcamentoCompleto);
    });

    it('deve lançar erro se cliente não existir', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(null);

      const data = {
        tipo: 'completo' as const,
        clienteId: 'inexistente',
        servicoId: 's1',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintor',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 10,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 1000,
            valorTotal: 1500,
          },
        ],
      };

      await expect(orcamentoService.criar(data)).rejects.toThrow(NotFoundError);
    });

    it('deve lançar erro se não houver itens', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        itensCompleto: [],
      };

      await expect(orcamentoService.criar(data)).rejects.toThrow(ValidationError);
    });

    it('deve lançar erro se descrição do item for curta', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintor',
            descricao: 'AB',
            unidade: 'UN',
            quantidade: 10,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 1000,
            valorTotal: 1500,
          },
        ],
      };

      await expect(orcamentoService.criar(data)).rejects.toThrow(ValidationError);
    });

    it('deve lançar erro se quantidade for zero ou negativa', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintor',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 0,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 0,
            valorTotalMaterial: 0,
            valorTotal: 0,
          },
        ],
      };

      await expect(orcamentoService.criar(data)).rejects.toThrow(ValidationError);
    });

    it('deve criar orçamento com observações, consultor e contato', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);
      (orcamentoRepository.getNextNumero as jest.Mock).mockResolvedValue(1);
      (orcamentoRepository.create as jest.Mock).mockImplementation((orc) => ({ ...orc, id: 'o1' }));

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintor',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 10,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 1000,
            valorTotal: 1500,
          },
        ],
        observacoes: 'Observação teste',
        consultor: 'João',
        contato: 'Maria',
      };

      await orcamentoService.criar(data);

      expect(orcamentoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          observacoes: 'Observação teste',
          consultor: 'João',
          contato: 'Maria',
        })
      );
    });

    it('deve usar dias de validade customizados', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);
      (orcamentoRepository.getNextNumero as jest.Mock).mockResolvedValue(1);
      (orcamentoRepository.create as jest.Mock).mockImplementation((orc) => ({ ...orc, id: 'o1' }));

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintor',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 10,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 1000,
            valorTotal: 1500,
          },
        ],
        diasValidade: 60,
      };

      await orcamentoService.criar(data);

      expect(orcamentoRepository.create).toHaveBeenCalled();
    });

    it('deve lançar erro se orçamento não tiver serviço', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintor',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 10,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 1000,
            valorTotal: 1500,
          },
        ],
      };

      await expect(orcamentoService.criar(data)).rejects.toThrow(ValidationError);
    });

    it('deve lançar erro se item não tiver categoria', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: '',
            categoriaNome: 'Extintor',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 10,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 1000,
            valorTotal: 1500,
          },
        ],
      };

      await expect(orcamentoService.criar(data)).rejects.toThrow(ValidationError);
    });

    it('deve criar orçamento com limitações e prazos', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);
      (orcamentoRepository.getNextNumero as jest.Mock).mockResolvedValue(2);
      (orcamentoRepository.create as jest.Mock).mockImplementation((orc) => ({ ...orc, id: 'o2' }));

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        servicoDescricao: 'Serviço de Manutenção',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintor',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 10,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 1000,
            valorTotal: 1500,
          },
        ],
        limitacoesSelecionadas: ['lim1', 'lim2'],
        prazoExecucaoServicos: 30,
        prazoVistoriaBombeiros: 15,
        condicaoPagamento: 'parcelado' as const,
        parcelamentoTexto: '3x sem juros',
      };

      await orcamentoService.criar(data);

      expect(orcamentoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          limitacoesSelecionadas: ['lim1', 'lim2'],
          prazoExecucaoServicos: 30,
          prazoVistoriaBombeiros: 15,
          condicaoPagamento: 'parcelado',
          parcelamentoTexto: '3x sem juros',
        })
      );
    });
  });

  describe('atualizar', () => {
    it('deve atualizar um orçamento aberto', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);
      (orcamentoRepository.update as jest.Mock).mockResolvedValue({ ...mockOrcamentoCompleto, versao: 1 });

      const result = await orcamentoService.atualizar('o1', {
        observacoes: 'Nova observação',
      });

      expect(orcamentoRepository.update).toHaveBeenCalledWith('o1', expect.objectContaining({
        versao: 1,
        observacoes: 'Nova observação',
      }));
    });

    it('deve lançar erro ao tentar atualizar orçamento não aberto', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue({ ...mockOrcamentoCompleto, status: 'aceito' });

      await expect(orcamentoService.atualizar('o1', { observacoes: 'teste' }))
        .rejects.toThrow(ValidationError);
    });

    it('deve atualizar itens e recalcular total', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);
      (orcamentoRepository.update as jest.Mock).mockImplementation((id, data) => ({ ...mockOrcamentoCompleto, ...data }));

      const novosItens = [
        {
          etapa: 'comercial' as const,
          categoriaId: 'cat2',
          categoriaNome: 'Mangueiras',
          descricao: 'Mangueira de Incêndio',
          unidade: 'M',
          quantidade: 20,
          valorUnitarioMaoDeObra: 10,
          valorUnitarioMaterial: 25,
          valorTotalMaoDeObra: 200,
          valorTotalMaterial: 500,
          valorTotal: 700,
        },
      ];

      await orcamentoService.atualizar('o1', { itensCompleto: novosItens });

      expect(orcamentoRepository.update).toHaveBeenCalledWith('o1', expect.objectContaining({
        itensCompleto: expect.arrayContaining([
          expect.objectContaining({
            descricao: 'Mangueira de Incêndio',
            valorTotalMaoDeObra: 200,
            valorTotalMaterial: 500,
            valorTotal: 700,
          }),
        ]),
        valorTotalMaoDeObra: 200,
        valorTotalMaterial: 500,
        valorTotal: 700,
      }));
    });

    it('deve lançar erro se novos itens forem vazios', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);

      await expect(orcamentoService.atualizar('o1', { itensCompleto: [] }))
        .rejects.toThrow(ValidationError);
    });

    it('deve validar cada item ao atualizar', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);

      const itensInvalidos = [
        {
          etapa: 'comercial' as const,
          categoriaId: 'cat1',
          categoriaNome: 'Extintor',
          descricao: 'AB',
          unidade: 'UN',
          quantidade: 1,
          valorUnitarioMaoDeObra: 50,
          valorUnitarioMaterial: 100,
          valorTotalMaoDeObra: 50,
          valorTotalMaterial: 100,
          valorTotal: 150,
        },
      ];

      await expect(orcamentoService.atualizar('o1', { itensCompleto: itensInvalidos }))
        .rejects.toThrow(ValidationError);
    });

    it('deve atualizar data de validade', async () => {
      // Criar mock com data específica diferente da que vamos atualizar
      const dataOriginal = new Date('2024-06-01T00:00:00.000Z');
      const mockComDataEspecifica = {
        id: 'o1',
        numero: 1,
        versao: 0,
        tipo: 'completo' as const,
        clienteId: 'c1',
        clienteNome: 'Empresa Teste',
        clienteCnpj: '12345678901234',
        status: 'aberto' as const,
        dataEmissao: new Date(),
        dataValidade: dataOriginal,
        servicoId: 's1',
        servicoDescricao: 'Serviço de Manutenção',
        itensCompleto: mockOrcamentoCompleto.itensCompleto,
        valorTotal: 1500,
        valorTotalMaoDeObra: 500,
        valorTotalMaterial: 1000,
        createdAt: new Date(),
      };
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockComDataEspecifica);
      (orcamentoRepository.update as jest.Mock).mockImplementation((id, data) => ({ ...mockComDataEspecifica, ...data }));

      // Data nova diferente da original
      const novaData = new Date('2025-01-01T00:00:00.000Z');

      await orcamentoService.atualizar('o1', { dataValidade: novaData });

      expect(orcamentoRepository.update).toHaveBeenCalledWith('o1', expect.objectContaining({
        dataValidade: novaData,
      }));
    });

    it('deve lançar erro se item não tiver categoria na atualização', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);

      await expect(orcamentoService.atualizar('o1', {
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: '',
            categoriaNome: 'Teste',
            descricao: 'Teste Item',
            unidade: 'UN',
            quantidade: 1,
            valorUnitarioMaoDeObra: 10,
            valorUnitarioMaterial: 20,
            valorTotalMaoDeObra: 10,
            valorTotalMaterial: 20,
            valorTotal: 30,
          },
        ],
      })).rejects.toThrow(ValidationError);
    });

    it('deve lançar erro se item tiver quantidade zero na atualização', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);

      await expect(orcamentoService.atualizar('o1', {
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Teste',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 0,
            valorUnitarioMaoDeObra: 10,
            valorUnitarioMaterial: 20,
            valorTotalMaoDeObra: 0,
            valorTotalMaterial: 0,
            valorTotal: 0,
          },
        ],
      })).rejects.toThrow(ValidationError);
    });

    it('deve atualizar campos opcionais do orçamento', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);
      (orcamentoRepository.update as jest.Mock).mockImplementation((id, data) => ({ ...mockOrcamentoCompleto, ...data }));

      await orcamentoService.atualizar('o1', {
        servicoId: 's2',
        servicoDescricao: 'Novo Serviço',
        limitacoesSelecionadas: ['lim1'],
        prazoExecucaoServicos: 45,
        prazoVistoriaBombeiros: 20,
        condicaoPagamento: 'a_combinar',
        parcelamentoTexto: '  texto com espaços  ',
      });

      expect(orcamentoRepository.update).toHaveBeenCalledWith('o1', expect.objectContaining({
        servicoId: 's2',
        servicoDescricao: 'Novo Serviço',
        limitacoesSelecionadas: ['lim1'],
        prazoExecucaoServicos: 45,
        prazoVistoriaBombeiros: 20,
        condicaoPagamento: 'a_combinar',
        parcelamentoTexto: 'texto com espaços',
      }));
    });
  });

  describe('atualizarStatus', () => {
    it('deve atualizar status de aberto para aceito', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);
      (orcamentoRepository.updateStatus as jest.Mock).mockResolvedValue({ ...mockOrcamentoCompleto, status: 'aceito' });

      const result = await orcamentoService.atualizarStatus('o1', 'aceito');

      expect(orcamentoRepository.updateStatus).toHaveBeenCalledWith('o1', 'aceito', expect.any(Date));
    });

    it('deve atualizar status de aberto para recusado', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);
      (orcamentoRepository.updateStatus as jest.Mock).mockResolvedValue({ ...mockOrcamentoCompleto, status: 'recusado' });

      await orcamentoService.atualizarStatus('o1', 'recusado');

      expect(orcamentoRepository.updateStatus).toHaveBeenCalledWith('o1', 'recusado', undefined);
    });

    it('deve lançar erro para transição inválida', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue({ ...mockOrcamentoCompleto, status: 'aceito' });

      await expect(orcamentoService.atualizarStatus('o1', 'recusado'))
        .rejects.toThrow(ValidationError);
    });

    it('deve permitir voltar de aceito para aberto', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue({ ...mockOrcamentoCompleto, status: 'aceito' });
      (orcamentoRepository.updateStatus as jest.Mock).mockResolvedValue({ ...mockOrcamentoCompleto, status: 'aberto' });

      await orcamentoService.atualizarStatus('o1', 'aberto');

      expect(orcamentoRepository.updateStatus).toHaveBeenCalled();
    });

    it('deve permitir voltar de expirado para aberto', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue({ ...mockOrcamentoCompleto, status: 'expirado' });
      (orcamentoRepository.updateStatus as jest.Mock).mockResolvedValue({ ...mockOrcamentoCompleto, status: 'aberto' });

      await orcamentoService.atualizarStatus('o1', 'aberto');

      expect(orcamentoRepository.updateStatus).toHaveBeenCalled();
    });
  });

  describe('excluir', () => {
    it('deve excluir um orçamento aberto', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);
      (orcamentoRepository.delete as jest.Mock).mockResolvedValue(undefined);

      await orcamentoService.excluir('o1');

      expect(orcamentoRepository.delete).toHaveBeenCalledWith('o1');
    });

    it('deve lançar erro ao tentar excluir orçamento aceito', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue({ ...mockOrcamentoCompleto, status: 'aceito' });

      await expect(orcamentoService.excluir('o1')).rejects.toThrow(ValidationError);
    });

    it('deve permitir excluir orçamento recusado', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue({ ...mockOrcamentoCompleto, status: 'recusado' });
      (orcamentoRepository.delete as jest.Mock).mockResolvedValue(undefined);

      await orcamentoService.excluir('o1');

      expect(orcamentoRepository.delete).toHaveBeenCalledWith('o1');
    });
  });

  describe('duplicar', () => {
    it('deve duplicar um orçamento', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);
      (orcamentoRepository.getNextNumero as jest.Mock).mockResolvedValue(2);
      (orcamentoRepository.create as jest.Mock).mockImplementation((orc) => ({ ...orc, id: 'o2' }));

      const result = await orcamentoService.duplicar('o1');

      expect(result).toHaveProperty('numero', 2);
      expect(result).toHaveProperty('status', 'aberto');
      expect(result).toHaveProperty('versao', 0);
    });

    it('deve lançar erro se cliente não existir mais', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);
      (clienteRepository.findById as jest.Mock).mockRejectedValue(new Error('Cliente não encontrado'));

      await expect(orcamentoService.duplicar('o1')).rejects.toThrow(ValidationError);
    });

    it('deve manter consultor, contato e observações ao duplicar', async () => {
      const orcamentoComDados = {
        ...mockOrcamentoCompleto,
        consultor: 'João',
        contato: 'Maria',
        observacoes: 'Observação original',
      };
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(orcamentoComDados);
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);
      (orcamentoRepository.getNextNumero as jest.Mock).mockResolvedValue(2);
      (orcamentoRepository.create as jest.Mock).mockImplementation((orc) => ({ ...orc, id: 'o2' }));

      const result = await orcamentoService.duplicar('o1');

      expect(orcamentoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          consultor: 'João',
          contato: 'Maria',
          observacoes: 'Observação original',
        })
      );
    });

    it('deve duplicar orçamento mantendo todos os campos', async () => {
      const orcamentoCompleto = {
        ...mockOrcamentoCompleto,
        status: 'aceito' as const,
        limitacoesSelecionadas: ['lim1'],
        prazoExecucaoServicos: 30,
        prazoVistoriaBombeiros: 15,
        condicaoPagamento: 'parcelado' as const,
        parcelamentoTexto: '3x',
      };
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(orcamentoCompleto);
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);
      (orcamentoRepository.getNextNumero as jest.Mock).mockResolvedValue(3);
      (orcamentoRepository.create as jest.Mock).mockImplementation((orc) => ({ ...orc, id: 'o3' }));

      await orcamentoService.duplicar('o1');

      expect(orcamentoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: 'completo',
          status: 'aberto',
          versao: 0,
          numero: 3,
          servicoId: 's1',
          servicoDescricao: 'Serviço de Manutenção',
          itensCompleto: mockOrcamentoCompleto.itensCompleto,
          limitacoesSelecionadas: ['lim1'],
          prazoExecucaoServicos: 30,
          prazoVistoriaBombeiros: 15,
          condicaoPagamento: 'parcelado',
          parcelamentoTexto: '3x',
          valorTotalMaoDeObra: 500,
          valorTotalMaterial: 1000,
        })
      );
    });
  });

  describe('cliente com CPF', () => {
    it('deve detectar pessoa física por CPF', async () => {
      const clientePF = { ...mockCliente, cnpj: '12345678901' };
      (clienteRepository.findById as jest.Mock).mockResolvedValue(clientePF);
      (orcamentoRepository.getNextNumero as jest.Mock).mockResolvedValue(1);
      (orcamentoRepository.create as jest.Mock).mockImplementation((orc) => ({ ...orc, id: 'o1' }));

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintor',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 10,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 1000,
            valorTotal: 1500,
          },
        ],
      };

      await orcamentoService.criar(data);

      expect(orcamentoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          clienteTipoPessoa: 'fisica',
        })
      );
    });
  });

  describe('getEstatisticas', () => {
    it('deve retornar estatísticas', async () => {
      const stats = { total: 10, aceitos: 5 };
      (orcamentoRepository.getEstatisticas as jest.Mock).mockResolvedValue(stats);

      const result = await orcamentoService.getEstatisticas();

      expect(orcamentoRepository.getEstatisticas).toHaveBeenCalled();
      expect(result).toEqual(stats);
    });
  });

  describe('verificarExpirados', () => {
    it('deve marcar orçamentos expirados', async () => {
      const orcamentoExpirado = {
        ...mockOrcamentoCompleto,
        dataValidade: new Date(Date.now() - 24 * 60 * 60 * 1000), // ontem
      };
      (orcamentoRepository.findByStatus as jest.Mock).mockResolvedValue([orcamentoExpirado]);
      (orcamentoRepository.updateStatus as jest.Mock).mockResolvedValue({ ...orcamentoExpirado, status: 'expirado' });

      const result = await orcamentoService.verificarExpirados();

      expect(result).toBe(1);
      expect(orcamentoRepository.updateStatus).toHaveBeenCalledWith('o1', 'expirado');
    });

    it('não deve marcar orçamentos válidos como expirados', async () => {
      const orcamentoValido = {
        ...mockOrcamentoCompleto,
        dataValidade: new Date(Date.now() + 24 * 60 * 60 * 1000), // amanhã
      };
      (orcamentoRepository.findByStatus as jest.Mock).mockResolvedValue([orcamentoValido]);

      const result = await orcamentoService.verificarExpirados();

      expect(result).toBe(0);
      expect(orcamentoRepository.updateStatus).not.toHaveBeenCalled();
    });
  });
});
