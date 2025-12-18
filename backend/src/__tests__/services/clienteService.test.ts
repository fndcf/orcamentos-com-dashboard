import { clienteService } from '../../services/clienteService';
import { clienteRepository } from '../../repositories/clienteRepository';
import { ValidationError } from '../../utils/errors';
import { Cliente } from '../../models';

// Mock do repository
jest.mock('../../repositories/clienteRepository');

const mockClienteRepository = clienteRepository as jest.Mocked<typeof clienteRepository>;

describe('ClienteService', () => {
  const mockCliente: Cliente = {
    id: '1',
    razaoSocial: 'Empresa Teste LTDA',
    nomeFantasia: 'Empresa Teste',
    cnpj: '12345678901234',
    endereco: 'Rua Teste, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234567',
    telefone: '11999999999',
    email: 'teste@empresa.com',
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listar', () => {
    it('deve retornar lista de clientes', async () => {
      mockClienteRepository.findAll.mockResolvedValue([mockCliente]);

      const result = await clienteService.listar();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCliente);
      expect(mockClienteRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('deve retornar lista vazia quando não há clientes', async () => {
      mockClienteRepository.findAll.mockResolvedValue([]);

      const result = await clienteService.listar();

      expect(result).toHaveLength(0);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar cliente por ID', async () => {
      mockClienteRepository.findById.mockResolvedValue(mockCliente);

      const result = await clienteService.buscarPorId('1');

      expect(result).toEqual(mockCliente);
      expect(mockClienteRepository.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('buscarPorDocumento', () => {
    it('deve retornar cliente por CNPJ', async () => {
      mockClienteRepository.findByDocumento.mockResolvedValue(mockCliente);

      const result = await clienteService.buscarPorDocumento('12345678901234');

      expect(result).toEqual(mockCliente);
      expect(mockClienteRepository.findByDocumento).toHaveBeenCalledWith('12345678901234');
    });

    it('deve retornar null quando cliente não encontrado', async () => {
      mockClienteRepository.findByDocumento.mockResolvedValue(null);

      const result = await clienteService.buscarPorDocumento('00000000000000');

      expect(result).toBeNull();
    });
  });

  describe('pesquisar', () => {
    it('deve retornar lista vazia para termo menor que 2 caracteres', async () => {
      const result = await clienteService.pesquisar('a');

      expect(result).toHaveLength(0);
      expect(mockClienteRepository.search).not.toHaveBeenCalled();
    });

    it('deve retornar lista vazia para termo vazio', async () => {
      const result = await clienteService.pesquisar('');

      expect(result).toHaveLength(0);
    });

    it('deve chamar repository.search para termos válidos', async () => {
      mockClienteRepository.search.mockResolvedValue([mockCliente]);

      const result = await clienteService.pesquisar('Empresa');

      expect(result).toHaveLength(1);
      expect(mockClienteRepository.search).toHaveBeenCalledWith('Empresa');
    });
  });

  describe('criar', () => {
    const novoCliente = {
      razaoSocial: 'Nova Empresa LTDA',
      cnpj: '98765432109876',
      endereco: 'Rua Nova, 456',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      cep: '20000000',
      telefone: '21888888888',
      email: 'nova@empresa.com',
    };

    it('deve criar cliente com CNPJ válido (14 dígitos)', async () => {
      mockClienteRepository.findByDocumento.mockResolvedValue(null);
      mockClienteRepository.create.mockResolvedValue({ ...novoCliente, id: '2', createdAt: new Date() });

      const result = await clienteService.criar(novoCliente);

      expect(result.id).toBe('2');
      expect(mockClienteRepository.create).toHaveBeenCalled();
    });

    it('deve criar cliente com CPF válido (11 dígitos)', async () => {
      const clientePF = { ...novoCliente, cnpj: '12345678901' };
      mockClienteRepository.findByDocumento.mockResolvedValue(null);
      mockClienteRepository.create.mockResolvedValue({ ...clientePF, id: '3', createdAt: new Date() });

      const result = await clienteService.criar(clientePF);

      expect(result.id).toBe('3');
    });

    it('deve lançar erro para razão social muito curta', async () => {
      const clienteInvalido = { ...novoCliente, razaoSocial: 'AB' };

      await expect(clienteService.criar(clienteInvalido)).rejects.toThrow(ValidationError);
      await expect(clienteService.criar(clienteInvalido)).rejects.toThrow(
        'Nome/Razão social deve ter pelo menos 3 caracteres'
      );
    });

    it('deve lançar erro para CNPJ vazio em pessoa jurídica', async () => {
      const clienteInvalido = { ...novoCliente, cnpj: '', tipoPessoa: 'juridica' as const };

      await expect(clienteService.criar(clienteInvalido)).rejects.toThrow(ValidationError);
      await expect(clienteService.criar(clienteInvalido)).rejects.toThrow('CNPJ é obrigatório para pessoa jurídica');
    });

    it('deve permitir CPF vazio para pessoa física', async () => {
      const clientePessoaFisica = { ...novoCliente, cnpj: '', tipoPessoa: 'fisica' as const };
      mockClienteRepository.findByDocumento.mockResolvedValue(null);
      mockClienteRepository.create.mockResolvedValue({ ...clientePessoaFisica, id: '4', createdAt: new Date() });

      const result = await clienteService.criar(clientePessoaFisica);

      expect(result.id).toBe('4');
    });

    it('deve lançar erro para documento com tamanho inválido', async () => {
      const clienteInvalido = { ...novoCliente, cnpj: '123456' };

      await expect(clienteService.criar(clienteInvalido)).rejects.toThrow(ValidationError);
      await expect(clienteService.criar(clienteInvalido)).rejects.toThrow(
        'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos'
      );
    });

    it('deve lançar erro para documento já cadastrado', async () => {
      mockClienteRepository.findByDocumento.mockResolvedValue(mockCliente);

      await expect(clienteService.criar(novoCliente)).rejects.toThrow(ValidationError);
      await expect(clienteService.criar(novoCliente)).rejects.toThrow(
        'Já existe um cliente cadastrado com este CPF/CNPJ'
      );
    });
  });

  describe('atualizar', () => {
    it('deve atualizar cliente existente', async () => {
      const dadosAtualizacao = { razaoSocial: 'Empresa Atualizada LTDA' };
      mockClienteRepository.update.mockResolvedValue({ ...mockCliente, ...dadosAtualizacao });

      const result = await clienteService.atualizar('1', dadosAtualizacao);

      expect(result.razaoSocial).toBe('Empresa Atualizada LTDA');
      expect(mockClienteRepository.update).toHaveBeenCalledWith('1', dadosAtualizacao);
    });

    it('deve lançar erro ao atualizar com razão social muito curta', async () => {
      const dadosInvalidos = { razaoSocial: 'AB' };

      await expect(clienteService.atualizar('1', dadosInvalidos)).rejects.toThrow(ValidationError);
    });

    it('deve lançar erro ao atualizar com documento de outro cliente', async () => {
      const outroCliente = { ...mockCliente, id: '2' };
      mockClienteRepository.findByDocumento.mockResolvedValue(outroCliente);

      await expect(clienteService.atualizar('1', { cnpj: '12345678901234' })).rejects.toThrow(
        'Já existe outro cliente cadastrado com este CPF/CNPJ'
      );
    });

    it('deve lançar erro ao atualizar com documento de tamanho inválido', async () => {
      const dadosInvalidos = { cnpj: '123456' };

      await expect(clienteService.atualizar('1', dadosInvalidos)).rejects.toThrow(ValidationError);
      await expect(clienteService.atualizar('1', dadosInvalidos)).rejects.toThrow(
        'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos'
      );
    });

    it('deve permitir atualização quando documento pertence ao mesmo cliente', async () => {
      mockClienteRepository.findByDocumento.mockResolvedValue(mockCliente);
      mockClienteRepository.update.mockResolvedValue({ ...mockCliente, cnpj: '12345678901234' });

      const result = await clienteService.atualizar('1', { cnpj: '12345678901234' });

      expect(result.cnpj).toBe('12345678901234');
      expect(mockClienteRepository.update).toHaveBeenCalled();
    });

    it('deve lançar erro ao mudar para pessoa jurídica sem CNPJ', async () => {
      const dadosInvalidos = { tipoPessoa: 'juridica' as const, cnpj: '' };

      await expect(clienteService.atualizar('1', dadosInvalidos)).rejects.toThrow(ValidationError);
      await expect(clienteService.atualizar('1', dadosInvalidos)).rejects.toThrow(
        'CNPJ é obrigatório para pessoa jurídica'
      );
    });

    it('deve lançar erro ao mudar para pessoa jurídica com documento inválido', async () => {
      const dadosInvalidos = { tipoPessoa: 'juridica' as const, cnpj: '12345678901' }; // CPF ao invés de CNPJ

      await expect(clienteService.atualizar('1', dadosInvalidos)).rejects.toThrow(ValidationError);
      await expect(clienteService.atualizar('1', dadosInvalidos)).rejects.toThrow(
        'CNPJ é obrigatório para pessoa jurídica'
      );
    });

    it('deve permitir atualização para pessoa jurídica com CNPJ válido', async () => {
      mockClienteRepository.findByDocumento.mockResolvedValue(null);
      mockClienteRepository.update.mockResolvedValue({
        ...mockCliente,
        tipoPessoa: 'juridica',
        cnpj: '12345678901234',
      });

      const result = await clienteService.atualizar('1', {
        tipoPessoa: 'juridica' as const,
        cnpj: '12345678901234',
      });

      expect(result.tipoPessoa).toBe('juridica');
      expect(mockClienteRepository.update).toHaveBeenCalled();
    });

    it('deve atualizar com documento vazio quando não está validando', async () => {
      mockClienteRepository.update.mockResolvedValue({ ...mockCliente, cnpj: '' });

      // Não deve lançar erro porque não está passando cnpj com valor inválido
      const result = await clienteService.atualizar('1', { razaoSocial: 'Novo Nome' });

      expect(mockClienteRepository.update).toHaveBeenCalledWith('1', { razaoSocial: 'Novo Nome' });
    });
  });

  describe('excluir', () => {
    it('deve excluir cliente existente', async () => {
      mockClienteRepository.delete.mockResolvedValue();

      await clienteService.excluir('1');

      expect(mockClienteRepository.delete).toHaveBeenCalledWith('1');
    });
  });
});
