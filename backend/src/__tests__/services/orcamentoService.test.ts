import { orcamentoService } from '../../services/orcamentoService';
import { orcamentoRepository } from '../../repositories/orcamentoRepository';
import { clienteRepository } from '../../repositories/clienteRepository';
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

  const mockOrcamento = {
    id: 'o1',
    numero: 1,
    versao: 0,
    tipo: 'simples' as const,
    clienteId: 'c1',
    clienteNome: 'Empresa Teste',
    clienteCnpj: '12345678901234',
    status: 'aberto' as const,
    dataEmissao: new Date(),
    dataValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    itens: [
      { descricao: 'Serviço 1', quantidade: 1, unidade: 'Serv.', valorUnitario: 1000, valorTotal: 1000 },
    ],
    valorTotal: 1000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listar', () => {
    it('deve listar todos os orçamentos', async () => {
      (orcamentoRepository.findAll as jest.Mock).mockResolvedValue([mockOrcamento]);

      const result = await orcamentoService.listar();

      expect(orcamentoRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockOrcamento]);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar orçamento por ID', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);

      const result = await orcamentoService.buscarPorId('o1');

      expect(orcamentoRepository.findById).toHaveBeenCalledWith('o1');
      expect(result).toEqual(mockOrcamento);
    });
  });

  describe('buscarPorCliente', () => {
    it('deve buscar orçamentos por cliente', async () => {
      (orcamentoRepository.findByClienteId as jest.Mock).mockResolvedValue([mockOrcamento]);

      const result = await orcamentoService.buscarPorCliente('c1');

      expect(orcamentoRepository.findByClienteId).toHaveBeenCalledWith('c1');
      expect(result).toEqual([mockOrcamento]);
    });
  });

  describe('buscarPorStatus', () => {
    it('deve buscar orçamentos por status', async () => {
      (orcamentoRepository.findByStatus as jest.Mock).mockResolvedValue([mockOrcamento]);

      const result = await orcamentoService.buscarPorStatus('aberto');

      expect(orcamentoRepository.findByStatus).toHaveBeenCalledWith('aberto');
      expect(result).toEqual([mockOrcamento]);
    });
  });

  describe('criar', () => {
    it('deve criar um novo orçamento simples', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);
      (orcamentoRepository.getNextNumero as jest.Mock).mockResolvedValue(1);
      (orcamentoRepository.create as jest.Mock).mockResolvedValue(mockOrcamento);

      const data = {
        tipo: 'simples' as const,
        clienteId: 'c1',
        itens: [{ descricao: 'Serviço 1', quantidade: 1, unidade: 'Serv.', valorUnitario: 1000, valorTotal: 1000 }],
      };

      const result = await orcamentoService.criar(data);

      expect(clienteRepository.findById).toHaveBeenCalledWith('c1');
      expect(orcamentoRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockOrcamento);
    });

    it('deve lançar erro se cliente não existir', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(null);

      const data = {
        tipo: 'simples' as const,
        clienteId: 'inexistente',
        itens: [{ descricao: 'Serviço 1', quantidade: 1, unidade: 'Serv.', valorUnitario: 1000, valorTotal: 1000 }],
      };

      await expect(orcamentoService.criar(data)).rejects.toThrow(NotFoundError);
    });

    it('deve lançar erro se não houver itens', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);

      const data = {
        tipo: 'simples' as const,
        clienteId: 'c1',
        itens: [],
      };

      await expect(orcamentoService.criar(data)).rejects.toThrow(ValidationError);
    });

    it('deve lançar erro se descrição do item for curta', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);

      const data = {
        tipo: 'simples' as const,
        clienteId: 'c1',
        itens: [{ descricao: 'AB', quantidade: 1, unidade: 'Serv.', valorUnitario: 1000, valorTotal: 1000 }],
      };

      await expect(orcamentoService.criar(data)).rejects.toThrow(ValidationError);
    });

    it('deve lançar erro se quantidade for zero ou negativa', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);

      const data = {
        tipo: 'simples' as const,
        clienteId: 'c1',
        itens: [{ descricao: 'Serviço Teste', quantidade: 0, unidade: 'Serv.', valorUnitario: 1000, valorTotal: 1000 }],
      };

      await expect(orcamentoService.criar(data)).rejects.toThrow(ValidationError);
    });

    it('deve lançar erro se valor unitário for negativo', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);

      const data = {
        tipo: 'simples' as const,
        clienteId: 'c1',
        itens: [{ descricao: 'Serviço Teste', quantidade: 1, unidade: 'Serv.', valorUnitario: -100, valorTotal: -100 }],
      };

      await expect(orcamentoService.criar(data)).rejects.toThrow(ValidationError);
    });

    it('deve criar orçamento com observações, consultor e contato', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);
      (orcamentoRepository.getNextNumero as jest.Mock).mockResolvedValue(1);
      (orcamentoRepository.create as jest.Mock).mockImplementation((orc) => ({ ...orc, id: 'o1' }));

      const data = {
        tipo: 'simples' as const,
        clienteId: 'c1',
        itens: [{ descricao: 'Serviço 1', quantidade: 1, unidade: 'Serv.', valorUnitario: 1000, valorTotal: 1000 }],
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
        tipo: 'simples' as const,
        clienteId: 'c1',
        itens: [{ descricao: 'Serviço 1', quantidade: 1, unidade: 'Serv.', valorUnitario: 1000, valorTotal: 1000 }],
        diasValidade: 60,
      };

      await orcamentoService.criar(data);

      expect(orcamentoRepository.create).toHaveBeenCalled();
    });
  });

  describe('atualizar', () => {
    it('deve atualizar um orçamento aberto', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);
      (orcamentoRepository.update as jest.Mock).mockResolvedValue({ ...mockOrcamento, versao: 1 });

      const result = await orcamentoService.atualizar('o1', {
        observacoes: 'Nova observação',
      });

      expect(orcamentoRepository.update).toHaveBeenCalledWith('o1', expect.objectContaining({
        versao: 1,
        observacoes: 'Nova observação',
      }));
    });

    it('deve lançar erro ao tentar atualizar orçamento não aberto', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue({ ...mockOrcamento, status: 'aceito' });

      await expect(orcamentoService.atualizar('o1', { observacoes: 'teste' }))
        .rejects.toThrow(ValidationError);
    });

    it('deve atualizar itens e recalcular total', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);
      (orcamentoRepository.update as jest.Mock).mockImplementation((id, data) => ({ ...mockOrcamento, ...data }));

      const novosItens = [
        { descricao: 'Novo Serviço', quantidade: 2, unidade: 'Un.', valorUnitario: 500, valorTotal: 1000 },
      ];

      await orcamentoService.atualizar('o1', { itens: novosItens });

      expect(orcamentoRepository.update).toHaveBeenCalledWith('o1', expect.objectContaining({
        itens: expect.arrayContaining([
          expect.objectContaining({ descricao: 'Novo Serviço', valorTotal: 1000 }),
        ]),
        valorTotal: 1000,
      }));
    });

    it('deve lançar erro se novos itens forem vazios', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);

      await expect(orcamentoService.atualizar('o1', { itens: [] }))
        .rejects.toThrow(ValidationError);
    });

    it('deve validar cada item ao atualizar', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);

      const itensInvalidos = [
        { descricao: 'AB', quantidade: 1, unidade: 'Un.', valorUnitario: 100, valorTotal: 100 },
      ];

      await expect(orcamentoService.atualizar('o1', { itens: itensInvalidos }))
        .rejects.toThrow(ValidationError);
    });

    it('deve atualizar data de validade', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);
      (orcamentoRepository.update as jest.Mock).mockImplementation((id, data) => ({ ...mockOrcamento, ...data }));

      const novaData = new Date('2025-01-01');

      await orcamentoService.atualizar('o1', { dataValidade: novaData });

      expect(orcamentoRepository.update).toHaveBeenCalledWith('o1', expect.objectContaining({
        dataValidade: novaData,
      }));
    });
  });

  describe('atualizarStatus', () => {
    it('deve atualizar status de aberto para aceito', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);
      (orcamentoRepository.updateStatus as jest.Mock).mockResolvedValue({ ...mockOrcamento, status: 'aceito' });

      const result = await orcamentoService.atualizarStatus('o1', 'aceito');

      expect(orcamentoRepository.updateStatus).toHaveBeenCalledWith('o1', 'aceito', expect.any(Date));
    });

    it('deve atualizar status de aberto para recusado', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);
      (orcamentoRepository.updateStatus as jest.Mock).mockResolvedValue({ ...mockOrcamento, status: 'recusado' });

      await orcamentoService.atualizarStatus('o1', 'recusado');

      expect(orcamentoRepository.updateStatus).toHaveBeenCalledWith('o1', 'recusado', undefined);
    });

    it('deve lançar erro para transição inválida', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue({ ...mockOrcamento, status: 'aceito' });

      await expect(orcamentoService.atualizarStatus('o1', 'recusado'))
        .rejects.toThrow(ValidationError);
    });

    it('deve permitir voltar de aceito para aberto', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue({ ...mockOrcamento, status: 'aceito' });
      (orcamentoRepository.updateStatus as jest.Mock).mockResolvedValue({ ...mockOrcamento, status: 'aberto' });

      await orcamentoService.atualizarStatus('o1', 'aberto');

      expect(orcamentoRepository.updateStatus).toHaveBeenCalled();
    });

    it('deve permitir voltar de expirado para aberto', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue({ ...mockOrcamento, status: 'expirado' });
      (orcamentoRepository.updateStatus as jest.Mock).mockResolvedValue({ ...mockOrcamento, status: 'aberto' });

      await orcamentoService.atualizarStatus('o1', 'aberto');

      expect(orcamentoRepository.updateStatus).toHaveBeenCalled();
    });
  });

  describe('excluir', () => {
    it('deve excluir um orçamento aberto', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);
      (orcamentoRepository.delete as jest.Mock).mockResolvedValue(undefined);

      await orcamentoService.excluir('o1');

      expect(orcamentoRepository.delete).toHaveBeenCalledWith('o1');
    });

    it('deve lançar erro ao tentar excluir orçamento aceito', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue({ ...mockOrcamento, status: 'aceito' });

      await expect(orcamentoService.excluir('o1')).rejects.toThrow(ValidationError);
    });

    it('deve permitir excluir orçamento recusado', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue({ ...mockOrcamento, status: 'recusado' });
      (orcamentoRepository.delete as jest.Mock).mockResolvedValue(undefined);

      await orcamentoService.excluir('o1');

      expect(orcamentoRepository.delete).toHaveBeenCalledWith('o1');
    });
  });

  describe('duplicar', () => {
    it('deve duplicar um orçamento', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);
      (orcamentoRepository.getNextNumero as jest.Mock).mockResolvedValue(2);
      (orcamentoRepository.create as jest.Mock).mockImplementation((orc) => ({ ...orc, id: 'o2' }));

      const result = await orcamentoService.duplicar('o1');

      expect(result).toHaveProperty('numero', 2);
      expect(result).toHaveProperty('status', 'aberto');
      expect(result).toHaveProperty('versao', 0);
    });

    it('deve lançar erro se cliente não existir mais', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);
      (clienteRepository.findById as jest.Mock).mockRejectedValue(new Error('Cliente não encontrado'));

      await expect(orcamentoService.duplicar('o1')).rejects.toThrow(ValidationError);
    });

    it('deve manter consultor, contato e observações ao duplicar', async () => {
      const orcamentoCompleto = {
        ...mockOrcamento,
        consultor: 'João',
        contato: 'Maria',
        observacoes: 'Observação original',
      };
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(orcamentoCompleto);
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
  });

  describe('criar orçamento completo', () => {
    const mockOrcamentoCompleto = {
      id: 'o2',
      numero: 2,
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
      itens: [],
      valorTotalMaoDeObra: 500,
      valorTotalMaterial: 1000,
      valorTotal: 1500,
    };

    it('deve criar um orçamento completo', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);
      (orcamentoRepository.getNextNumero as jest.Mock).mockResolvedValue(2);
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

      expect(result.tipo).toBe('completo');
      expect(orcamentoRepository.create).toHaveBeenCalled();
    });

    it('deve lançar erro se orçamento completo não tiver itens', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);

      const data = {
        tipo: 'completo' as const,
        clienteId: 'c1',
        servicoId: 's1',
        itensCompleto: [],
      };

      await expect(orcamentoService.criar(data)).rejects.toThrow(ValidationError);
    });

    it('deve lançar erro se orçamento completo não tiver serviço', async () => {
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

    it('deve lançar erro se item completo não tiver categoria', async () => {
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

    it('deve lançar erro se item completo tiver descrição curta', async () => {
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

    it('deve lançar erro se item completo tiver quantidade zero', async () => {
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

    it('deve criar orçamento completo com limitações e prazos', async () => {
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

  describe('atualizar orçamento completo', () => {
    const mockOrcamentoCompleto = {
      id: 'o2',
      numero: 2,
      versao: 0,
      tipo: 'completo' as const,
      clienteId: 'c1',
      clienteNome: 'Empresa Teste',
      clienteCnpj: '12345678901234',
      status: 'aberto' as const,
      dataEmissao: new Date(),
      dataValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      servicoId: 's1',
      itens: [],
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
      valorTotal: 1500,
    };

    it('deve atualizar itens de orçamento completo', async () => {
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

      await orcamentoService.atualizar('o2', { itensCompleto: novosItens });

      expect(orcamentoRepository.update).toHaveBeenCalledWith('o2', expect.objectContaining({
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

    it('deve lançar erro se itens completos forem vazios na atualização', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);

      await expect(orcamentoService.atualizar('o2', { itensCompleto: [] }))
        .rejects.toThrow(ValidationError);
    });

    it('deve lançar erro se item completo não tiver categoria na atualização', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);

      await expect(orcamentoService.atualizar('o2', {
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

    it('deve lançar erro se item completo tiver descrição curta na atualização', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);

      await expect(orcamentoService.atualizar('o2', {
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Teste',
            descricao: 'AB',
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

    it('deve lançar erro se item completo tiver quantidade zero na atualização', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);

      await expect(orcamentoService.atualizar('o2', {
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

    it('deve atualizar campos opcionais do orçamento completo', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);
      (orcamentoRepository.update as jest.Mock).mockImplementation((id, data) => ({ ...mockOrcamentoCompleto, ...data }));

      await orcamentoService.atualizar('o2', {
        servicoId: 's2',
        servicoDescricao: 'Novo Serviço',
        limitacoesSelecionadas: ['lim1'],
        prazoExecucaoServicos: 45,
        prazoVistoriaBombeiros: 20,
        condicaoPagamento: 'a_combinar',
        parcelamentoTexto: '  texto com espaços  ',
      });

      expect(orcamentoRepository.update).toHaveBeenCalledWith('o2', expect.objectContaining({
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

  describe('duplicar orçamento completo', () => {
    const mockOrcamentoCompleto = {
      id: 'o2',
      numero: 2,
      versao: 0,
      tipo: 'completo' as const,
      clienteId: 'c1',
      clienteNome: 'Empresa Teste',
      clienteCnpj: '12345678901234',
      status: 'aceito' as const,
      dataEmissao: new Date(),
      dataValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      servicoId: 's1',
      servicoDescricao: 'Serviço Original',
      itens: [],
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
      limitacoesSelecionadas: ['lim1'],
      prazoExecucaoServicos: 30,
      prazoVistoriaBombeiros: 15,
      condicaoPagamento: 'parcelado' as const,
      parcelamentoTexto: '3x',
      valorTotalMaoDeObra: 500,
      valorTotalMaterial: 1000,
      valorTotal: 1500,
    };

    it('deve duplicar orçamento completo mantendo todos os campos', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamentoCompleto);
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);
      (orcamentoRepository.getNextNumero as jest.Mock).mockResolvedValue(3);
      (orcamentoRepository.create as jest.Mock).mockImplementation((orc) => ({ ...orc, id: 'o3' }));

      await orcamentoService.duplicar('o2');

      expect(orcamentoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: 'completo',
          status: 'aberto',
          versao: 0,
          numero: 3,
          servicoId: 's1',
          servicoDescricao: 'Serviço Original',
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

  describe('validações de itens simples adicionais', () => {
    it('deve lançar erro se quantidade for negativa', async () => {
      (clienteRepository.findById as jest.Mock).mockResolvedValue(mockCliente);

      const data = {
        tipo: 'simples' as const,
        clienteId: 'c1',
        itens: [{ descricao: 'Serviço Teste', quantidade: -1, unidade: 'Serv.', valorUnitario: 1000, valorTotal: 1000 }],
      };

      await expect(orcamentoService.criar(data)).rejects.toThrow(ValidationError);
    });

    it('deve lançar erro na atualização se quantidade for zero', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);

      await expect(orcamentoService.atualizar('o1', {
        itens: [{ descricao: 'Serviço Teste', quantidade: 0, unidade: 'Un.', valorUnitario: 100, valorTotal: 100 }],
      })).rejects.toThrow(ValidationError);
    });

    it('deve lançar erro na atualização se valor unitário for negativo', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);

      await expect(orcamentoService.atualizar('o1', {
        itens: [{ descricao: 'Serviço Teste', quantidade: 1, unidade: 'Un.', valorUnitario: -100, valorTotal: -100 }],
      })).rejects.toThrow(ValidationError);
    });
  });

  describe('cliente com CPF', () => {
    it('deve detectar pessoa física por CPF', async () => {
      const clientePF = { ...mockCliente, cnpj: '12345678901' };
      (clienteRepository.findById as jest.Mock).mockResolvedValue(clientePF);
      (orcamentoRepository.getNextNumero as jest.Mock).mockResolvedValue(1);
      (orcamentoRepository.create as jest.Mock).mockImplementation((orc) => ({ ...orc, id: 'o1' }));

      const data = {
        tipo: 'simples' as const,
        clienteId: 'c1',
        itens: [{ descricao: 'Serviço 1', quantidade: 1, unidade: 'Serv.', valorUnitario: 1000, valorTotal: 1000 }],
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
        ...mockOrcamento,
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
        ...mockOrcamento,
        dataValidade: new Date(Date.now() + 24 * 60 * 60 * 1000), // amanhã
      };
      (orcamentoRepository.findByStatus as jest.Mock).mockResolvedValue([orcamentoValido]);

      const result = await orcamentoService.verificarExpirados();

      expect(result).toBe(0);
      expect(orcamentoRepository.updateStatus).not.toHaveBeenCalled();
    });
  });
});
