import { notificacaoService, inicializarEventHandlers } from '../../services/notificacaoService';
import { notificacaoRepository } from '../../repositories/notificacaoRepository';
import { orcamentoRepository } from '../../repositories/orcamentoRepository';
import { palavraChaveRepository } from '../../repositories/palavraChaveRepository';
import { eventBus, OrcamentoEvents } from '../../events';
import { NotFoundError } from '../../utils/errors';
import { Notificacao, Orcamento, PalavraChave } from '../../models';

// Mock dos repositories
jest.mock('../../repositories/notificacaoRepository');
jest.mock('../../repositories/orcamentoRepository');
jest.mock('../../repositories/palavraChaveRepository');

describe('notificacaoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockNotificacao: Notificacao = {
    id: '1',
    orcamentoId: 'orc1',
    orcamentoNumero: 1,
    clienteId: 'cli1',
    clienteNome: 'Cliente Teste',
    itemDescricao: 'Extintor ABC 6kg',
    palavraChave: 'extintor',
    dataVencimento: new Date('2025-12-31'),
    lida: false,
    createdAt: new Date(),
  };

  const mockOrcamento: Orcamento = {
    id: 'orc1',
    numero: 1,
    versao: 0,
    tipo: 'completo',
    clienteId: 'cli1',
    clienteNome: 'Cliente Teste',
    clienteCnpj: '12345678901234',
    status: 'aceito',
    dataEmissao: new Date('2025-01-01'),
    dataValidade: new Date('2025-02-01'),
    dataAceite: new Date('2025-01-15'),
    itensCompleto: [
      {
        etapa: 'comercial',
        categoriaId: 'cat1',
        categoriaNome: 'Extintores',
        descricao: 'Extintor ABC 6kg',
        quantidade: 10,
        unidade: 'UN',
        valorUnitarioMaoDeObra: 50,
        valorUnitarioMaterial: 50,
        valorTotalMaoDeObra: 500,
        valorTotalMaterial: 500,
        valorTotal: 1000,
      },
      {
        etapa: 'comercial',
        categoriaId: 'cat2',
        categoriaNome: 'Mangueiras',
        descricao: 'Mangueira de incêndio',
        quantidade: 5,
        unidade: 'M',
        valorUnitarioMaoDeObra: 100,
        valorUnitarioMaterial: 100,
        valorTotalMaoDeObra: 500,
        valorTotalMaterial: 500,
        valorTotal: 1000,
      },
    ],
    valorTotal: 2000,
    createdAt: new Date(),
  };

  const mockPalavraChave: PalavraChave = {
    id: 'pc1',
    palavra: 'extintor',
    prazoDias: 365,
    ativo: true,
    createdAt: new Date(),
  };

  describe('buscarPorId', () => {
    it('deve retornar notificação por ID', async () => {
      (notificacaoRepository.findById as jest.Mock).mockResolvedValue(mockNotificacao);

      const resultado = await notificacaoService.buscarPorId('1');

      expect(notificacaoRepository.findById).toHaveBeenCalledWith('1');
      expect(resultado).toEqual(mockNotificacao);
    });

    it('deve lançar NotFoundError quando notificação não existir', async () => {
      (notificacaoRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(notificacaoService.buscarPorId('inexistente')).rejects.toThrow(NotFoundError);
      await expect(notificacaoService.buscarPorId('inexistente')).rejects.toThrow('Notificação não encontrada');
    });
  });

  describe('marcarComoLida', () => {
    it('deve marcar notificação como lida', async () => {
      const notificacaoLida = { ...mockNotificacao, lida: true };
      (notificacaoRepository.marcarComoLida as jest.Mock).mockResolvedValue(notificacaoLida);

      const resultado = await notificacaoService.marcarComoLida('1');

      expect(notificacaoRepository.marcarComoLida).toHaveBeenCalledWith('1');
      expect(resultado.lida).toBe(true);
    });

    it('deve lançar NotFoundError quando notificação não existir', async () => {
      (notificacaoRepository.marcarComoLida as jest.Mock).mockResolvedValue(null);

      await expect(notificacaoService.marcarComoLida('inexistente')).rejects.toThrow(NotFoundError);
      await expect(notificacaoService.marcarComoLida('inexistente')).rejects.toThrow('Notificação não encontrada');
    });
  });

  describe('marcarTodasComoLidas', () => {
    it('deve marcar todas notificações como lidas', async () => {
      (notificacaoRepository.marcarTodasComoLidas as jest.Mock).mockResolvedValue(5);

      const resultado = await notificacaoService.marcarTodasComoLidas();

      expect(notificacaoRepository.marcarTodasComoLidas).toHaveBeenCalled();
      expect(resultado).toBe(5);
    });
  });

  describe('excluir', () => {
    it('deve excluir notificação com sucesso', async () => {
      (notificacaoRepository.delete as jest.Mock).mockResolvedValue(true);

      await expect(notificacaoService.excluir('1')).resolves.not.toThrow();

      expect(notificacaoRepository.delete).toHaveBeenCalledWith('1');
    });

    it('deve lançar NotFoundError quando notificação não existir', async () => {
      (notificacaoRepository.delete as jest.Mock).mockResolvedValue(false);

      await expect(notificacaoService.excluir('inexistente')).rejects.toThrow(NotFoundError);
      await expect(notificacaoService.excluir('inexistente')).rejects.toThrow('Notificação não encontrada');
    });
  });

  describe('gerarNotificacoesParaOrcamento', () => {
    it('deve gerar notificações para orçamento aceito', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);
      (palavraChaveRepository.findAtivas as jest.Mock).mockResolvedValue([mockPalavraChave]);
      (notificacaoRepository.exists as jest.Mock).mockResolvedValue(false);
      (notificacaoRepository.createMany as jest.Mock).mockResolvedValue([mockNotificacao]);

      const resultado = await notificacaoService.gerarNotificacoesParaOrcamento('orc1');

      expect(orcamentoRepository.findById).toHaveBeenCalledWith('orc1');
      expect(resultado).toHaveLength(1);
    });

    it('deve retornar array vazio para orçamento não aceito', async () => {
      const orcamentoPendente = { ...mockOrcamento, status: 'pendente' };
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(orcamentoPendente);

      const resultado = await notificacaoService.gerarNotificacoesParaOrcamento('orc1');

      expect(resultado).toEqual([]);
    });

    it('deve retornar array vazio para orçamento rejeitado', async () => {
      const orcamentoRejeitado = { ...mockOrcamento, status: 'rejeitado' };
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(orcamentoRejeitado);

      const resultado = await notificacaoService.gerarNotificacoesParaOrcamento('orc1');

      expect(resultado).toEqual([]);
    });
  });

  describe('processarOrcamento', () => {
    it('deve retornar array vazio quando não há palavras-chave ativas', async () => {
      (palavraChaveRepository.findAtivas as jest.Mock).mockResolvedValue([]);

      const resultado = await notificacaoService.processarOrcamento(mockOrcamento);

      expect(resultado).toEqual([]);
    });

    it('deve criar notificações para itens que contêm palavras-chave', async () => {
      (palavraChaveRepository.findAtivas as jest.Mock).mockResolvedValue([mockPalavraChave]);
      (notificacaoRepository.exists as jest.Mock).mockResolvedValue(false);
      (notificacaoRepository.createMany as jest.Mock).mockResolvedValue([mockNotificacao]);

      const resultado = await notificacaoService.processarOrcamento(mockOrcamento);

      expect(notificacaoRepository.createMany).toHaveBeenCalled();
      expect(resultado).toHaveLength(1);
    });

    it('deve não criar notificação duplicada', async () => {
      (palavraChaveRepository.findAtivas as jest.Mock).mockResolvedValue([mockPalavraChave]);
      (notificacaoRepository.exists as jest.Mock).mockResolvedValue(true);

      const resultado = await notificacaoService.processarOrcamento(mockOrcamento);

      expect(notificacaoRepository.createMany).not.toHaveBeenCalled();
      expect(resultado).toEqual([]);
    });

    it('deve processar itens do orçamento completo', async () => {
      const orcamentoCompleto: Orcamento = {
        ...mockOrcamento,
        itensCompleto: [
          {
            etapa: 'comercial',
            categoriaId: 'cat1',
            categoriaNome: 'Extintores',
            descricao: 'Extintor CO2 4kg',
            unidade: 'UN',
            quantidade: 5,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 250,
            valorTotalMaterial: 500,
            valorTotal: 750,
          },
        ],
      };
      (palavraChaveRepository.findAtivas as jest.Mock).mockResolvedValue([mockPalavraChave]);
      (notificacaoRepository.exists as jest.Mock).mockResolvedValue(false);
      (notificacaoRepository.createMany as jest.Mock).mockResolvedValue([mockNotificacao]);

      const resultado = await notificacaoService.processarOrcamento(orcamentoCompleto);

      expect(notificacaoRepository.createMany).toHaveBeenCalled();
      expect(resultado).toHaveLength(1);
    });

    it('deve usar dataEmissao quando dataAceite não existir', async () => {
      const orcamentoSemAceite = { ...mockOrcamento, dataAceite: undefined };
      (palavraChaveRepository.findAtivas as jest.Mock).mockResolvedValue([mockPalavraChave]);
      (notificacaoRepository.exists as jest.Mock).mockResolvedValue(false);
      (notificacaoRepository.createMany as jest.Mock).mockResolvedValue([mockNotificacao]);

      await notificacaoService.processarOrcamento(orcamentoSemAceite);

      expect(notificacaoRepository.createMany).toHaveBeenCalled();
    });

    it('deve ignorar itens sem descrição', async () => {
      const orcamentoSemDescricao: Orcamento = {
        ...mockOrcamento,
        itensCompleto: [
          {
            etapa: 'comercial',
            categoriaId: 'cat1',
            categoriaNome: 'Extintores',
            descricao: '',
            quantidade: 10,
            unidade: 'UN',
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 50,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 500,
            valorTotal: 1000,
          },
        ],
      };
      (palavraChaveRepository.findAtivas as jest.Mock).mockResolvedValue([mockPalavraChave]);

      const resultado = await notificacaoService.processarOrcamento(orcamentoSemDescricao);

      expect(resultado).toEqual([]);
    });

    it('deve fazer match case-insensitive de palavras-chave', async () => {
      const orcamentoMaiusculo: Orcamento = {
        ...mockOrcamento,
        itensCompleto: [
          {
            etapa: 'comercial',
            categoriaId: 'cat1',
            categoriaNome: 'Extintores',
            descricao: 'EXTINTOR ABC 6KG',
            quantidade: 10,
            unidade: 'UN',
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 50,
            valorTotalMaoDeObra: 500,
            valorTotalMaterial: 500,
            valorTotal: 1000,
          },
        ],
      };
      (palavraChaveRepository.findAtivas as jest.Mock).mockResolvedValue([mockPalavraChave]);
      (notificacaoRepository.exists as jest.Mock).mockResolvedValue(false);
      (notificacaoRepository.createMany as jest.Mock).mockResolvedValue([mockNotificacao]);

      const resultado = await notificacaoService.processarOrcamento(orcamentoMaiusculo);

      expect(notificacaoRepository.createMany).toHaveBeenCalled();
      expect(resultado).toHaveLength(1);
    });

    it('deve processar múltiplas palavras-chave', async () => {
      const palavraChave2: PalavraChave = {
        id: 'pc2',
        palavra: 'mangueira',
        prazoDias: 180,
        ativo: true,
        createdAt: new Date(),
      };
      (palavraChaveRepository.findAtivas as jest.Mock).mockResolvedValue([mockPalavraChave, palavraChave2]);
      (notificacaoRepository.exists as jest.Mock).mockResolvedValue(false);
      (notificacaoRepository.createMany as jest.Mock).mockResolvedValue([mockNotificacao, { ...mockNotificacao, id: '2' }]);

      const resultado = await notificacaoService.processarOrcamento(mockOrcamento);

      expect(resultado).toHaveLength(2);
    });
  });

  describe('processarTodosOrcamentosAceitos', () => {
    it('deve processar todos orçamentos aceitos', async () => {
      const orcamentos = [mockOrcamento, { ...mockOrcamento, id: 'orc2', numero: 'ORC-002' }];
      (orcamentoRepository.findByStatus as jest.Mock).mockResolvedValue(orcamentos);
      (palavraChaveRepository.findAtivas as jest.Mock).mockResolvedValue([mockPalavraChave]);
      (notificacaoRepository.exists as jest.Mock).mockResolvedValue(false);
      (notificacaoRepository.createMany as jest.Mock).mockResolvedValue([mockNotificacao]);

      const resultado = await notificacaoService.processarTodosOrcamentosAceitos();

      expect(orcamentoRepository.findByStatus).toHaveBeenCalledWith('aceito');
      expect(resultado.processados).toBe(2);
      expect(resultado.notificacoesCriadas).toBe(2);
    });

    it('deve retornar zero quando não há orçamentos aceitos', async () => {
      (orcamentoRepository.findByStatus as jest.Mock).mockResolvedValue([]);

      const resultado = await notificacaoService.processarTodosOrcamentosAceitos();

      expect(resultado.processados).toBe(0);
      expect(resultado.notificacoesCriadas).toBe(0);
    });
  });

  describe('removerNotificacoesDoOrcamento', () => {
    it('deve remover notificações do orçamento', async () => {
      (notificacaoRepository.deleteByOrcamentoId as jest.Mock).mockResolvedValue(3);

      const resultado = await notificacaoService.removerNotificacoesDoOrcamento('orc1');

      expect(notificacaoRepository.deleteByOrcamentoId).toHaveBeenCalledWith('orc1');
      expect(resultado).toBe(3);
    });
  });

  describe('contarNaoLidas', () => {
    it('deve contar notificações não lidas', async () => {
      (notificacaoRepository.findNaoLidas as jest.Mock).mockResolvedValue([mockNotificacao, { ...mockNotificacao, id: '2' }]);

      const resultado = await notificacaoService.contarNaoLidas();

      expect(resultado).toBe(2);
    });

    it('deve retornar zero quando não há notificações não lidas', async () => {
      (notificacaoRepository.findNaoLidas as jest.Mock).mockResolvedValue([]);

      const resultado = await notificacaoService.contarNaoLidas();

      expect(resultado).toBe(0);
    });
  });

  describe('obterResumo', () => {
    it('deve retornar resumo das notificações', async () => {
      (notificacaoRepository.findAll as jest.Mock).mockResolvedValue([mockNotificacao, { ...mockNotificacao, id: '2' }]);
      (notificacaoRepository.findNaoLidas as jest.Mock).mockResolvedValue([mockNotificacao]);
      (notificacaoRepository.findVencidas as jest.Mock).mockResolvedValue([]);
      (notificacaoRepository.findProximas as jest.Mock).mockResolvedValue([mockNotificacao, { ...mockNotificacao, id: '2' }]);
      (notificacaoRepository.findAtivas as jest.Mock).mockResolvedValue([mockNotificacao]);

      const resultado = await notificacaoService.obterResumo();

      expect(resultado).toEqual({
        total: 2,
        naoLidas: 1,
        vencidas: 0,
        proximasVencer: 2,
        ativas: 1,
      });
    });
  });

  // ========== TESTES DOS MÉTODOS PAGINADOS ==========

  describe('listarTodasPaginado', () => {
    const mockPaginatedResponse = {
      items: [mockNotificacao, { ...mockNotificacao, id: '2' }],
      total: 25,
      hasMore: true,
      cursor: 'bmV4dEN1cnNvcg==',
    };

    it('deve retornar notificações paginadas com valores padrão', async () => {
      (notificacaoRepository.findAllPaginated as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      const resultado = await notificacaoService.listarTodasPaginado();

      expect(notificacaoRepository.findAllPaginated).toHaveBeenCalledWith(10, undefined);
      expect(resultado).toEqual(mockPaginatedResponse);
    });

    it('deve retornar notificações paginadas com pageSize específico', async () => {
      (notificacaoRepository.findAllPaginated as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      const resultado = await notificacaoService.listarTodasPaginado(20);

      expect(notificacaoRepository.findAllPaginated).toHaveBeenCalledWith(20, undefined);
      expect(resultado).toEqual(mockPaginatedResponse);
    });

    it('deve retornar notificações paginadas com cursor', async () => {
      const responseComCursor = { ...mockPaginatedResponse, hasMore: false, cursor: undefined };
      (notificacaoRepository.findAllPaginated as jest.Mock).mockResolvedValue(responseComCursor);

      const resultado = await notificacaoService.listarTodasPaginado(10, 'abc123');

      expect(notificacaoRepository.findAllPaginated).toHaveBeenCalledWith(10, 'abc123');
      expect(resultado.hasMore).toBe(false);
    });
  });

  describe('listarNaoLidasPaginado', () => {
    const mockPaginatedResponse = {
      items: [mockNotificacao],
      total: 10,
      hasMore: true,
      cursor: 'bmV4dEN1cnNvcg==',
    };

    it('deve retornar notificações não lidas paginadas', async () => {
      (notificacaoRepository.findNaoLidasPaginated as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      const resultado = await notificacaoService.listarNaoLidasPaginado();

      expect(notificacaoRepository.findNaoLidasPaginated).toHaveBeenCalledWith(10, undefined);
      expect(resultado).toEqual(mockPaginatedResponse);
    });

    it('deve retornar notificações não lidas paginadas com parâmetros', async () => {
      (notificacaoRepository.findNaoLidasPaginated as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      const resultado = await notificacaoService.listarNaoLidasPaginado(5, 'cursor123');

      expect(notificacaoRepository.findNaoLidasPaginated).toHaveBeenCalledWith(5, 'cursor123');
      expect(resultado).toEqual(mockPaginatedResponse);
    });
  });

  describe('listarVencidasPaginado', () => {
    const mockPaginatedResponse = {
      items: [mockNotificacao],
      total: 5,
      hasMore: false,
      cursor: undefined,
    };

    it('deve retornar notificações vencidas paginadas', async () => {
      (notificacaoRepository.findVencidasPaginated as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      const resultado = await notificacaoService.listarVencidasPaginado();

      expect(notificacaoRepository.findVencidasPaginated).toHaveBeenCalledWith(10, undefined);
      expect(resultado).toEqual(mockPaginatedResponse);
    });

    it('deve retornar notificações vencidas paginadas com parâmetros', async () => {
      (notificacaoRepository.findVencidasPaginated as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      const resultado = await notificacaoService.listarVencidasPaginado(15, 'cursorXYZ');

      expect(notificacaoRepository.findVencidasPaginated).toHaveBeenCalledWith(15, 'cursorXYZ');
      expect(resultado).toEqual(mockPaginatedResponse);
    });
  });

  describe('listarAtivasPaginado', () => {
    const mockPaginatedResponse = {
      items: [mockNotificacao, { ...mockNotificacao, id: '2' }],
      total: 15,
      hasMore: true,
      cursor: 'YXRpdmFzQ3Vyc29y',
    };

    it('deve retornar notificações ativas paginadas com valores padrão', async () => {
      (notificacaoRepository.findAtivasPaginated as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      const resultado = await notificacaoService.listarAtivasPaginado();

      expect(notificacaoRepository.findAtivasPaginated).toHaveBeenCalledWith(60, 10, undefined);
      expect(resultado).toEqual(mockPaginatedResponse);
    });

    it('deve retornar notificações ativas paginadas com dias específico', async () => {
      (notificacaoRepository.findAtivasPaginated as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      const resultado = await notificacaoService.listarAtivasPaginado(30);

      expect(notificacaoRepository.findAtivasPaginated).toHaveBeenCalledWith(30, 10, undefined);
      expect(resultado).toEqual(mockPaginatedResponse);
    });

    it('deve retornar notificações ativas paginadas com todos os parâmetros', async () => {
      (notificacaoRepository.findAtivasPaginated as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      const resultado = await notificacaoService.listarAtivasPaginado(45, 20, 'myCursor');

      expect(notificacaoRepository.findAtivasPaginated).toHaveBeenCalledWith(45, 20, 'myCursor');
      expect(resultado).toEqual(mockPaginatedResponse);
    });
  });

  describe('listarProximasPaginado', () => {
    const mockPaginatedResponse = {
      items: [mockNotificacao, { ...mockNotificacao, id: '2' }],
      total: 22,
      hasMore: true,
      cursor: 'cHJveGltYXNDdXJzb3I=',
    };

    it('deve retornar notificações próximas paginadas com valores padrão', async () => {
      (notificacaoRepository.findProximasPaginated as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      const resultado = await notificacaoService.listarProximasPaginado();

      expect(notificacaoRepository.findProximasPaginated).toHaveBeenCalledWith(30, 10, undefined);
      expect(resultado).toEqual(mockPaginatedResponse);
    });

    it('deve retornar notificações próximas paginadas com dias específico', async () => {
      (notificacaoRepository.findProximasPaginated as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      const resultado = await notificacaoService.listarProximasPaginado(15);

      expect(notificacaoRepository.findProximasPaginated).toHaveBeenCalledWith(15, 10, undefined);
      expect(resultado).toEqual(mockPaginatedResponse);
    });

    it('deve retornar notificações próximas paginadas com todos os parâmetros', async () => {
      (notificacaoRepository.findProximasPaginated as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      const resultado = await notificacaoService.listarProximasPaginado(30, 20, 'myCursor');

      expect(notificacaoRepository.findProximasPaginated).toHaveBeenCalledWith(30, 20, 'myCursor');
      expect(resultado).toEqual(mockPaginatedResponse);
    });
  });
});

describe('inicializarEventHandlers', () => {
  const mockOrcamento: Orcamento = {
    id: 'orc1',
    numero: 1,
    versao: 0,
    tipo: 'completo',
    clienteId: 'cli1',
    clienteNome: 'Cliente Teste',
    clienteCnpj: '12345678901234',
    status: 'aceito',
    dataEmissao: new Date('2025-01-01'),
    dataValidade: new Date('2025-02-01'),
    dataAceite: new Date('2025-01-15'),
    itensCompleto: [
      {
        etapa: 'comercial',
        categoriaId: 'cat1',
        categoriaNome: 'Extintores',
        descricao: 'Extintor ABC 6kg',
        quantidade: 10,
        unidade: 'UN',
        valorUnitarioMaoDeObra: 50,
        valorUnitarioMaterial: 50,
        valorTotalMaoDeObra: 500,
        valorTotalMaterial: 500,
        valorTotal: 1000,
      },
    ],
    valorTotal: 1000,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    eventBus.clear();
  });

  it('deve registrar handler para STATUS_CHANGED', () => {
    inicializarEventHandlers();

    // Verificar que o handler foi registrado (o evento existe)
    expect(() => eventBus.emit(OrcamentoEvents.STATUS_CHANGED, {
      orcamentoId: 'test',
      statusAnterior: 'pendente',
      statusNovo: 'aceito',
    })).not.toThrow();
  });

  it('deve gerar notificações quando status muda para aceito', async () => {
    (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);
    (palavraChaveRepository.findAtivas as jest.Mock).mockResolvedValue([]);

    inicializarEventHandlers();

    await eventBus.emit(OrcamentoEvents.STATUS_CHANGED, {
      orcamentoId: 'orc1',
      statusAnterior: 'pendente',
      statusNovo: 'aceito',
    });

    // Aguarda um tick para o handler assíncrono executar
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(orcamentoRepository.findById).toHaveBeenCalledWith('orc1');
  });

  it('deve remover notificações quando status muda de aceito para outro', async () => {
    (notificacaoRepository.deleteByOrcamentoId as jest.Mock).mockResolvedValue(2);

    inicializarEventHandlers();

    await eventBus.emit(OrcamentoEvents.STATUS_CHANGED, {
      orcamentoId: 'orc1',
      statusAnterior: 'aceito',
      statusNovo: 'rejeitado',
    });

    // Aguarda um tick para o handler assíncrono executar
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(notificacaoRepository.deleteByOrcamentoId).toHaveBeenCalledWith('orc1');
  });

  it('deve não fazer nada quando status não envolve aceito', async () => {
    inicializarEventHandlers();

    await eventBus.emit(OrcamentoEvents.STATUS_CHANGED, {
      orcamentoId: 'orc1',
      statusAnterior: 'pendente',
      statusNovo: 'rejeitado',
    });

    // Aguarda um tick para o handler assíncrono executar
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(orcamentoRepository.findById).not.toHaveBeenCalled();
    expect(notificacaoRepository.deleteByOrcamentoId).not.toHaveBeenCalled();
  });

  it('deve capturar erro sem propagar quando handler falha', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (orcamentoRepository.findById as jest.Mock).mockRejectedValue(new Error('DB Error'));

    inicializarEventHandlers();

    await eventBus.emit(OrcamentoEvents.STATUS_CHANGED, {
      orcamentoId: 'orc1',
      statusAnterior: 'pendente',
      statusNovo: 'aceito',
    });

    // Aguarda um tick para o handler assíncrono executar
    await new Promise(resolve => setTimeout(resolve, 10));

    // O logger formata a mensagem com timestamp e nível
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[NotificacaoService] Erro ao processar evento de mudança de status:')
    );

    consoleErrorSpy.mockRestore();
  });
});
