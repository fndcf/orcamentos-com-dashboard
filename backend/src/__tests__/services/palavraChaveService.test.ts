import { palavraChaveService } from '../../services/palavraChaveService';
import { palavraChaveRepository } from '../../repositories/palavraChaveRepository';
import { AppError, ValidationError, NotFoundError } from '../../utils/errors';
import { PalavraChave } from '../../models';

// Mock do repository
jest.mock('../../repositories/palavraChaveRepository');

describe('palavraChaveService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPalavraChave: PalavraChave = {
    id: '1',
    palavra: 'extintor',
    prazoDias: 345,
    ativo: true,
    createdAt: new Date(),
  };

  describe('listar', () => {
    it('deve retornar lista de palavras-chave', async () => {
      const palavras = [mockPalavraChave, { ...mockPalavraChave, id: '2', palavra: 'mangueira' }];
      (palavraChaveRepository.findAll as jest.Mock).mockResolvedValue(palavras);

      const resultado = await palavraChaveService.listar();

      expect(palavraChaveRepository.findAll).toHaveBeenCalled();
      expect(resultado).toEqual(palavras);
    });

    it('deve retornar lista vazia quando não houver palavras-chave', async () => {
      (palavraChaveRepository.findAll as jest.Mock).mockResolvedValue([]);

      const resultado = await palavraChaveService.listar();

      expect(resultado).toEqual([]);
    });
  });

  describe('listarAtivas', () => {
    it('deve retornar apenas palavras-chave ativas', async () => {
      const palavrasAtivas = [mockPalavraChave];
      (palavraChaveRepository.findAtivas as jest.Mock).mockResolvedValue(palavrasAtivas);

      const resultado = await palavraChaveService.listarAtivas();

      expect(palavraChaveRepository.findAtivas).toHaveBeenCalled();
      expect(resultado).toEqual(palavrasAtivas);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar palavra-chave por ID', async () => {
      (palavraChaveRepository.findById as jest.Mock).mockResolvedValue(mockPalavraChave);

      const resultado = await palavraChaveService.buscarPorId('1');

      expect(palavraChaveRepository.findById).toHaveBeenCalledWith('1');
      expect(resultado).toEqual(mockPalavraChave);
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(palavraChaveService.buscarPorId('')).rejects.toThrow(ValidationError);
      await expect(palavraChaveService.buscarPorId('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando palavra-chave não existir', async () => {
      (palavraChaveRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(palavraChaveService.buscarPorId('inexistente')).rejects.toThrow(NotFoundError);
      await expect(palavraChaveService.buscarPorId('inexistente')).rejects.toThrow(
        'Palavra-chave não encontrada'
      );
    });
  });

  describe('criar', () => {
    it('deve criar palavra-chave com sucesso', async () => {
      const dados = { palavra: 'extintor', prazoDias: 345 };
      (palavraChaveRepository.findByPalavra as jest.Mock).mockResolvedValue(null);
      (palavraChaveRepository.create as jest.Mock).mockResolvedValue(mockPalavraChave);

      const resultado = await palavraChaveService.criar(dados);

      expect(palavraChaveRepository.findByPalavra).toHaveBeenCalledWith('extintor');
      expect(palavraChaveRepository.create).toHaveBeenCalledWith({
        palavra: 'extintor',
        prazoDias: 345,
        ativo: true,
      });
      expect(resultado).toEqual(mockPalavraChave);
    });

    it('deve criar palavra-chave inativa quando especificado', async () => {
      const dados = { palavra: 'extintor', prazoDias: 345, ativo: false };
      (palavraChaveRepository.findByPalavra as jest.Mock).mockResolvedValue(null);
      (palavraChaveRepository.create as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        ativo: false,
      });

      await palavraChaveService.criar(dados);

      expect(palavraChaveRepository.create).toHaveBeenCalledWith({
        palavra: 'extintor',
        prazoDias: 345,
        ativo: false,
      });
    });

    it('deve lançar ValidationError quando palavra for muito curta', async () => {
      await expect(palavraChaveService.criar({ palavra: 'a', prazoDias: 345 })).rejects.toThrow(
        ValidationError
      );
      await expect(palavraChaveService.criar({ palavra: 'a', prazoDias: 345 })).rejects.toThrow(
        'Palavra-chave deve ter pelo menos 2 caracteres'
      );
    });

    it('deve lançar ValidationError quando palavra for vazia', async () => {
      await expect(palavraChaveService.criar({ palavra: '', prazoDias: 345 })).rejects.toThrow(
        ValidationError
      );
    });

    it('deve lançar ValidationError quando prazo for menor que 1', async () => {
      await expect(palavraChaveService.criar({ palavra: 'extintor', prazoDias: 0 })).rejects.toThrow(
        ValidationError
      );
      await expect(palavraChaveService.criar({ palavra: 'extintor', prazoDias: 0 })).rejects.toThrow(
        'Prazo deve ser de pelo menos 1 dia'
      );
    });

    it('deve lançar ValidationError quando prazo for maior que 3650 dias', async () => {
      await expect(
        palavraChaveService.criar({ palavra: 'extintor', prazoDias: 3651 })
      ).rejects.toThrow(ValidationError);
      await expect(
        palavraChaveService.criar({ palavra: 'extintor', prazoDias: 3651 })
      ).rejects.toThrow('Prazo não pode ser maior que 10 anos (3650 dias)');
    });

    it('deve lançar AppError quando palavra já existir', async () => {
      (palavraChaveRepository.findByPalavra as jest.Mock).mockResolvedValue(mockPalavraChave);

      await expect(palavraChaveService.criar({ palavra: 'extintor', prazoDias: 345 })).rejects.toThrow(
        AppError
      );
      await expect(palavraChaveService.criar({ palavra: 'extintor', prazoDias: 345 })).rejects.toThrow(
        'Já existe uma palavra-chave com este termo'
      );
    });

    it('deve fazer trim da palavra antes de salvar', async () => {
      (palavraChaveRepository.findByPalavra as jest.Mock).mockResolvedValue(null);
      (palavraChaveRepository.create as jest.Mock).mockResolvedValue(mockPalavraChave);

      await palavraChaveService.criar({ palavra: '  extintor  ', prazoDias: 345 });

      expect(palavraChaveRepository.create).toHaveBeenCalledWith({
        palavra: 'extintor',
        prazoDias: 345,
        ativo: true,
      });
    });
  });

  describe('atualizar', () => {
    it('deve atualizar palavra-chave com sucesso', async () => {
      const dados = { palavra: 'extintor atualizado', prazoDias: 400 };
      (palavraChaveRepository.findById as jest.Mock).mockResolvedValue(mockPalavraChave);
      (palavraChaveRepository.findByPalavra as jest.Mock).mockResolvedValue(null);
      (palavraChaveRepository.update as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        ...dados,
      });

      const resultado = await palavraChaveService.atualizar('1', dados);

      expect(palavraChaveRepository.findById).toHaveBeenCalledWith('1');
      expect(palavraChaveRepository.update).toHaveBeenCalledWith('1', {
        palavra: 'extintor atualizado',
        prazoDias: 400,
      });
      expect(resultado.palavra).toBe('extintor atualizado');
    });

    it('deve atualizar apenas o prazo', async () => {
      (palavraChaveRepository.findById as jest.Mock).mockResolvedValue(mockPalavraChave);
      (palavraChaveRepository.update as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        prazoDias: 400,
      });

      await palavraChaveService.atualizar('1', { prazoDias: 400 });

      expect(palavraChaveRepository.update).toHaveBeenCalledWith('1', { prazoDias: 400 });
    });

    it('deve atualizar apenas o status ativo', async () => {
      (palavraChaveRepository.findById as jest.Mock).mockResolvedValue(mockPalavraChave);
      (palavraChaveRepository.update as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        ativo: false,
      });

      await palavraChaveService.atualizar('1', { ativo: false });

      expect(palavraChaveRepository.update).toHaveBeenCalledWith('1', { ativo: false });
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(palavraChaveService.atualizar('', { palavra: 'teste' })).rejects.toThrow(
        ValidationError
      );
      await expect(palavraChaveService.atualizar('', { palavra: 'teste' })).rejects.toThrow(
        'ID é obrigatório'
      );
    });

    it('deve lançar NotFoundError quando palavra-chave não existir', async () => {
      (palavraChaveRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        palavraChaveService.atualizar('inexistente', { palavra: 'teste' })
      ).rejects.toThrow(NotFoundError);
    });

    it('deve lançar ValidationError quando nova palavra for muito curta', async () => {
      (palavraChaveRepository.findById as jest.Mock).mockResolvedValue(mockPalavraChave);

      await expect(palavraChaveService.atualizar('1', { palavra: 'a' })).rejects.toThrow(
        ValidationError
      );
      await expect(palavraChaveService.atualizar('1', { palavra: 'a' })).rejects.toThrow(
        'Palavra-chave deve ter pelo menos 2 caracteres'
      );
    });

    it('deve lançar AppError quando nova palavra já existir em outro registro', async () => {
      (palavraChaveRepository.findById as jest.Mock).mockResolvedValue(mockPalavraChave);
      (palavraChaveRepository.findByPalavra as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        id: '2',
        palavra: 'mangueira',
      });

      await expect(palavraChaveService.atualizar('1', { palavra: 'mangueira' })).rejects.toThrow(
        AppError
      );
      await expect(palavraChaveService.atualizar('1', { palavra: 'mangueira' })).rejects.toThrow(
        'Já existe uma palavra-chave com este termo'
      );
    });

    it('deve permitir atualizar para a mesma palavra (case insensitive)', async () => {
      (palavraChaveRepository.findById as jest.Mock).mockResolvedValue(mockPalavraChave);
      (palavraChaveRepository.update as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        palavra: 'EXTINTOR',
      });

      await palavraChaveService.atualizar('1', { palavra: 'EXTINTOR' });

      expect(palavraChaveRepository.update).toHaveBeenCalled();
    });

    it('deve lançar ValidationError quando novo prazo for menor que 1', async () => {
      (palavraChaveRepository.findById as jest.Mock).mockResolvedValue(mockPalavraChave);

      await expect(palavraChaveService.atualizar('1', { prazoDias: 0 })).rejects.toThrow(
        ValidationError
      );
      await expect(palavraChaveService.atualizar('1', { prazoDias: 0 })).rejects.toThrow(
        'Prazo deve ser de pelo menos 1 dia'
      );
    });

    it('deve lançar ValidationError quando novo prazo for maior que 3650', async () => {
      (palavraChaveRepository.findById as jest.Mock).mockResolvedValue(mockPalavraChave);

      await expect(palavraChaveService.atualizar('1', { prazoDias: 4000 })).rejects.toThrow(
        ValidationError
      );
      await expect(palavraChaveService.atualizar('1', { prazoDias: 4000 })).rejects.toThrow(
        'Prazo não pode ser maior que 10 anos (3650 dias)'
      );
    });

    it('deve lançar AppError quando update retornar null', async () => {
      (palavraChaveRepository.findById as jest.Mock).mockResolvedValue(mockPalavraChave);
      (palavraChaveRepository.update as jest.Mock).mockResolvedValue(null);

      await expect(palavraChaveService.atualizar('1', { prazoDias: 400 })).rejects.toThrow(
        AppError
      );
      await expect(palavraChaveService.atualizar('1', { prazoDias: 400 })).rejects.toThrow(
        'Erro ao atualizar palavra-chave'
      );
    });
  });

  describe('excluir', () => {
    it('deve excluir palavra-chave com sucesso', async () => {
      (palavraChaveRepository.findById as jest.Mock).mockResolvedValue(mockPalavraChave);
      (palavraChaveRepository.delete as jest.Mock).mockResolvedValue(true);

      await expect(palavraChaveService.excluir('1')).resolves.not.toThrow();

      expect(palavraChaveRepository.findById).toHaveBeenCalledWith('1');
      expect(palavraChaveRepository.delete).toHaveBeenCalledWith('1');
    });

    it('deve lançar ValidationError quando ID não for fornecido', async () => {
      await expect(palavraChaveService.excluir('')).rejects.toThrow(ValidationError);
      await expect(palavraChaveService.excluir('')).rejects.toThrow('ID é obrigatório');
    });

    it('deve lançar NotFoundError quando palavra-chave não existir', async () => {
      (palavraChaveRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(palavraChaveService.excluir('inexistente')).rejects.toThrow(NotFoundError);
      await expect(palavraChaveService.excluir('inexistente')).rejects.toThrow(
        'Palavra-chave não encontrada'
      );
    });

    it('deve lançar AppError quando delete retornar false', async () => {
      (palavraChaveRepository.findById as jest.Mock).mockResolvedValue(mockPalavraChave);
      (palavraChaveRepository.delete as jest.Mock).mockResolvedValue(false);

      await expect(palavraChaveService.excluir('1')).rejects.toThrow(AppError);
      await expect(palavraChaveService.excluir('1')).rejects.toThrow(
        'Erro ao excluir palavra-chave'
      );
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar de ativo para inativo', async () => {
      (palavraChaveRepository.findById as jest.Mock).mockResolvedValue(mockPalavraChave);
      (palavraChaveRepository.update as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        ativo: false,
      });

      const resultado = await palavraChaveService.toggleAtivo('1');

      expect(palavraChaveRepository.update).toHaveBeenCalledWith('1', { ativo: false });
      expect(resultado.ativo).toBe(false);
    });

    it('deve alternar de inativo para ativo', async () => {
      (palavraChaveRepository.findById as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        ativo: false,
      });
      (palavraChaveRepository.update as jest.Mock).mockResolvedValue({
        ...mockPalavraChave,
        ativo: true,
      });

      const resultado = await palavraChaveService.toggleAtivo('1');

      expect(palavraChaveRepository.update).toHaveBeenCalledWith('1', { ativo: true });
      expect(resultado.ativo).toBe(true);
    });

    it('deve lançar erro quando palavra-chave não existir', async () => {
      (palavraChaveRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(palavraChaveService.toggleAtivo('inexistente')).rejects.toThrow(NotFoundError);
    });
  });
});
