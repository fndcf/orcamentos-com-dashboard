import { orcamentoRepository } from '../repositories/orcamentoRepository';
import { clienteRepository } from '../repositories/clienteRepository';
import { configuracoesGeraisRepository } from '../repositories/configuracoesGeraisRepository';
import { Orcamento, OrcamentoItem, OrcamentoItemCompleto, OrcamentoStatus, OrcamentoTipo, TipoPessoa, ParcelamentoDados } from '../models';
import { ValidationError, NotFoundError } from '../utils/errors';
import { eventBus, OrcamentoEvents } from '../events';

// Helper para detectar tipo de pessoa baseado no documento (CPF ou CNPJ)
function detectarTipoPessoa(documento: string): TipoPessoa {
  const docLimpo = documento?.replace(/\D/g, '') || '';
  return docLimpo.length <= 11 ? 'fisica' : 'juridica';
}

interface CriarOrcamentoDTO {
  tipo: OrcamentoTipo;
  clienteId: string;
  // Campos para orçamento simples
  itens?: OrcamentoItem[];
  // Campos para orçamento completo
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number;
  prazoVistoriaBombeiros?: number;
  condicaoPagamento?: 'a_combinar' | 'parcelado';
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados;
  // Campos comuns
  observacoes?: string;
  diasValidade?: number;
  consultor?: string;
  contato?: string;
}

interface AtualizarOrcamentoDTO {
  // Campos para orçamento simples
  itens?: OrcamentoItem[];
  // Campos para orçamento completo
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number;
  prazoVistoriaBombeiros?: number;
  condicaoPagamento?: 'a_combinar' | 'parcelado';
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados;
  // Campos comuns
  observacoes?: string;
  dataValidade?: Date;
}

export const orcamentoService = {
  async listar(): Promise<Orcamento[]> {
    return orcamentoRepository.findAll();
  },

  async buscarPorId(id: string): Promise<Orcamento> {
    return orcamentoRepository.findById(id);
  },

  async buscarPorCliente(clienteId: string): Promise<Orcamento[]> {
    return orcamentoRepository.findByClienteId(clienteId);
  },

  async buscarPorStatus(status: OrcamentoStatus): Promise<Orcamento[]> {
    return orcamentoRepository.findByStatus(status);
  },

  async criar(data: CriarOrcamentoDTO): Promise<Orcamento> {
    // Validar cliente
    const cliente = await clienteRepository.findById(data.clienteId);
    if (!cliente) {
      throw new NotFoundError('Cliente não encontrado');
    }

    const tipo = data.tipo || 'simples';

    // Obter próximo número
    const numero = await orcamentoRepository.getNextNumero();

    // Buscar configuração de dias de validade
    const configuracoes = await configuracoesGeraisRepository.get();
    const diasValidadeConfig = configuracoes.diasValidadeOrcamento || 30;

    // Definir datas
    const dataEmissao = new Date();
    const diasValidade = data.diasValidade || diasValidadeConfig;
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + diasValidade);

    // Base do orçamento
    const orcamento: Omit<Orcamento, 'id' | 'createdAt'> = {
      numero,
      versao: 0,
      tipo,
      clienteId: data.clienteId,
      clienteNome: cliente.razaoSocial,
      clienteCnpj: cliente.cnpj || '',
      clienteTipoPessoa: detectarTipoPessoa(cliente.cnpj || ''),
      status: 'aberto',
      dataEmissao,
      dataValidade,
      itens: [],
      valorTotal: 0,
    };

    // Adicionar dados do cliente (Firestore não aceita undefined)
    if (cliente.endereco) orcamento.clienteEndereco = cliente.endereco;
    if (cliente.cidade) orcamento.clienteCidade = cliente.cidade;
    if (cliente.estado) orcamento.clienteEstado = cliente.estado;
    if (cliente.cep) orcamento.clienteCep = cliente.cep;
    if (cliente.telefone) orcamento.clienteTelefone = cliente.telefone;
    if (cliente.email) orcamento.clienteEmail = cliente.email;

    // Adicionar consultor e contato se existirem
    if (data.consultor?.trim()) orcamento.consultor = data.consultor.trim();
    if (data.contato?.trim()) orcamento.contato = data.contato.trim();

    // Adicionar observações apenas se existir
    if (data.observacoes?.trim()) {
      orcamento.observacoes = data.observacoes.trim();
    }

    if (tipo === 'simples') {
      // Validar itens simples
      if (!data.itens || data.itens.length === 0) {
        throw new ValidationError('O orçamento deve ter pelo menos um item');
      }

      // Validar cada item
      for (const item of data.itens) {
        if (!item.descricao || item.descricao.trim().length < 3) {
          throw new ValidationError('Descrição do item deve ter pelo menos 3 caracteres');
        }
        if (item.quantidade <= 0) {
          throw new ValidationError('Quantidade deve ser maior que zero');
        }
        if (item.valorUnitario < 0) {
          throw new ValidationError('Valor unitário não pode ser negativo');
        }
      }

      // Calcular valores dos itens e total
      const itensCalculados = data.itens.map(item => ({
        ...item,
        descricao: item.descricao.trim(),
        valorTotal: item.quantidade * item.valorUnitario,
      }));

      orcamento.itens = itensCalculados;
      orcamento.valorTotal = itensCalculados.reduce((acc, item) => acc + item.valorTotal, 0);

      // Campos opcionais do orçamento simples (limitações)
      if (data.limitacoesSelecionadas && data.limitacoesSelecionadas.length > 0) {
        orcamento.limitacoesSelecionadas = data.limitacoesSelecionadas;
      }

    } else {
      // Orçamento completo
      if (!data.itensCompleto || data.itensCompleto.length === 0) {
        throw new ValidationError('O orçamento completo deve ter pelo menos um item');
      }

      // Validar serviço
      if (!data.servicoId) {
        throw new ValidationError('O orçamento completo deve ter um serviço selecionado');
      }

      // Validar cada item completo
      for (const item of data.itensCompleto) {
        if (!item.categoriaId) {
          throw new ValidationError('Cada item deve ter uma categoria');
        }
        if (!item.descricao || item.descricao.trim().length < 3) {
          throw new ValidationError('Descrição do item deve ter pelo menos 3 caracteres');
        }
        if (item.quantidade <= 0) {
          throw new ValidationError('Quantidade deve ser maior que zero');
        }
      }

      // Calcular valores dos itens completos
      const itensCalculados = data.itensCompleto.map(item => ({
        ...item,
        descricao: item.descricao.trim(),
        valorTotalMaoDeObra: item.quantidade * item.valorUnitarioMaoDeObra,
        valorTotalMaterial: item.quantidade * item.valorUnitarioMaterial,
        valorTotal: item.quantidade * (item.valorUnitarioMaoDeObra + item.valorUnitarioMaterial),
      }));

      const valorTotalMaoDeObra = itensCalculados.reduce((acc, item) => acc + item.valorTotalMaoDeObra, 0);
      const valorTotalMaterial = itensCalculados.reduce((acc, item) => acc + item.valorTotalMaterial, 0);
      const valorTotal = valorTotalMaoDeObra + valorTotalMaterial;

      // Campos do orçamento completo
      orcamento.servicoId = data.servicoId;
      if (data.servicoDescricao) orcamento.servicoDescricao = data.servicoDescricao;
      orcamento.itensCompleto = itensCalculados;
      orcamento.valorTotalMaoDeObra = valorTotalMaoDeObra;
      orcamento.valorTotalMaterial = valorTotalMaterial;
      orcamento.valorTotal = valorTotal;

      // Campos opcionais do orçamento completo
      if (data.limitacoesSelecionadas && data.limitacoesSelecionadas.length > 0) {
        orcamento.limitacoesSelecionadas = data.limitacoesSelecionadas;
      }
      if (data.prazoExecucaoServicos) orcamento.prazoExecucaoServicos = data.prazoExecucaoServicos;
      if (data.prazoVistoriaBombeiros) orcamento.prazoVistoriaBombeiros = data.prazoVistoriaBombeiros;
      if (data.condicaoPagamento) orcamento.condicaoPagamento = data.condicaoPagamento;
      if (data.parcelamentoTexto?.trim()) orcamento.parcelamentoTexto = data.parcelamentoTexto.trim();
      if (data.parcelamentoDados) orcamento.parcelamentoDados = data.parcelamentoDados;
    }

    return orcamentoRepository.create(orcamento);
  },

  async atualizar(id: string, data: AtualizarOrcamentoDTO): Promise<Orcamento> {
    const orcamento = await orcamentoRepository.findById(id);

    // Só permite atualizar se estiver aberto
    if (orcamento.status !== 'aberto') {
      throw new ValidationError('Só é possível atualizar orçamentos com status "aberto"');
    }

    const updateData: Partial<Orcamento> = {
      // Incrementar a versão a cada edição
      versao: (orcamento.versao || 0) + 1,
    };

    // Atualização para orçamento simples
    if (orcamento.tipo === 'simples' && data.itens) {
      if (data.itens.length === 0) {
        throw new ValidationError('O orçamento deve ter pelo menos um item');
      }

      // Validar cada item
      for (const item of data.itens) {
        if (!item.descricao || item.descricao.trim().length < 3) {
          throw new ValidationError('Descrição do item deve ter pelo menos 3 caracteres');
        }
        if (item.quantidade <= 0) {
          throw new ValidationError('Quantidade deve ser maior que zero');
        }
        if (item.valorUnitario < 0) {
          throw new ValidationError('Valor unitário não pode ser negativo');
        }
      }

      // Calcular valores
      const itensCalculados = data.itens.map(item => ({
        ...item,
        descricao: item.descricao.trim(),
        valorTotal: item.quantidade * item.valorUnitario,
      }));

      updateData.itens = itensCalculados;
      updateData.valorTotal = itensCalculados.reduce((acc, item) => acc + item.valorTotal, 0);
    }

    // Atualização para orçamento completo
    if (orcamento.tipo === 'completo' && data.itensCompleto) {
      if (data.itensCompleto.length === 0) {
        throw new ValidationError('O orçamento completo deve ter pelo menos um item');
      }

      // Validar cada item completo
      for (const item of data.itensCompleto) {
        if (!item.categoriaId) {
          throw new ValidationError('Cada item deve ter uma categoria');
        }
        if (!item.descricao || item.descricao.trim().length < 3) {
          throw new ValidationError('Descrição do item deve ter pelo menos 3 caracteres');
        }
        if (item.quantidade <= 0) {
          throw new ValidationError('Quantidade deve ser maior que zero');
        }
      }

      // Calcular valores dos itens completos
      const itensCalculados = data.itensCompleto.map(item => ({
        ...item,
        descricao: item.descricao.trim(),
        valorTotalMaoDeObra: item.quantidade * item.valorUnitarioMaoDeObra,
        valorTotalMaterial: item.quantidade * item.valorUnitarioMaterial,
        valorTotal: item.quantidade * (item.valorUnitarioMaoDeObra + item.valorUnitarioMaterial),
      }));

      const valorTotalMaoDeObra = itensCalculados.reduce((acc, item) => acc + item.valorTotalMaoDeObra, 0);
      const valorTotalMaterial = itensCalculados.reduce((acc, item) => acc + item.valorTotalMaterial, 0);
      const valorTotal = valorTotalMaoDeObra + valorTotalMaterial;

      updateData.itensCompleto = itensCalculados;
      updateData.valorTotalMaoDeObra = valorTotalMaoDeObra;
      updateData.valorTotalMaterial = valorTotalMaterial;
      updateData.valorTotal = valorTotal;
    }

    // Campos opcionais do orçamento completo
    if (data.servicoId !== undefined) updateData.servicoId = data.servicoId;
    if (data.servicoDescricao !== undefined) updateData.servicoDescricao = data.servicoDescricao;
    if (data.limitacoesSelecionadas !== undefined) updateData.limitacoesSelecionadas = data.limitacoesSelecionadas;
    if (data.prazoExecucaoServicos !== undefined) updateData.prazoExecucaoServicos = data.prazoExecucaoServicos;
    if (data.prazoVistoriaBombeiros !== undefined) updateData.prazoVistoriaBombeiros = data.prazoVistoriaBombeiros;
    if (data.condicaoPagamento !== undefined) updateData.condicaoPagamento = data.condicaoPagamento;
    if (data.parcelamentoTexto !== undefined) updateData.parcelamentoTexto = data.parcelamentoTexto?.trim() || undefined;
    if (data.parcelamentoDados !== undefined) updateData.parcelamentoDados = data.parcelamentoDados;

    if (data.observacoes !== undefined) {
      const obs = data.observacoes?.trim();
      if (obs) {
        updateData.observacoes = obs;
      }
    }

    if (data.dataValidade) {
      updateData.dataValidade = data.dataValidade;
    }

    return orcamentoRepository.update(id, updateData);
  },

  async atualizarStatus(id: string, status: OrcamentoStatus): Promise<Orcamento> {
    const orcamento = await orcamentoRepository.findById(id);

    // Validar transições de status
    const transicoesValidas: Record<OrcamentoStatus, OrcamentoStatus[]> = {
      aberto: ['aceito', 'recusado', 'expirado'],
      aceito: ['aberto'],
      recusado: ['aberto'],
      expirado: ['aberto'],
    };

    if (!transicoesValidas[orcamento.status].includes(status)) {
      throw new ValidationError(
        `Não é possível mudar o status de "${orcamento.status}" para "${status}"`
      );
    }

    const dataAceite = status === 'aceito' ? new Date() : undefined;
    const statusAnterior = orcamento.status;

    const orcamentoAtualizado = await orcamentoRepository.updateStatus(id, status, dataAceite);

    // Emite evento de mudança de status - notificacaoService escuta e reage
    // Isso elimina a dependência circular entre os serviços
    eventBus.emit(OrcamentoEvents.STATUS_CHANGED, {
      orcamentoId: id,
      statusAnterior,
      statusNovo: status,
    });

    return orcamentoAtualizado;
  },

  async excluir(id: string): Promise<void> {
    const orcamento = await orcamentoRepository.findById(id);

    // Só permite excluir se não estiver aceito
    if (orcamento.status === 'aceito') {
      throw new ValidationError('Não é possível excluir um orçamento aceito');
    }

    return orcamentoRepository.delete(id);
  },

  async duplicar(id: string): Promise<Orcamento> {
    const orcamentoOriginal = await orcamentoRepository.findById(id);

    // Verificar se o cliente ainda existe
    let cliente;
    try {
      cliente = await clienteRepository.findById(orcamentoOriginal.clienteId);
    } catch {
      throw new ValidationError('Cliente do orçamento original não existe mais');
    }

    // Obter próximo número
    const numero = await orcamentoRepository.getNextNumero();

    // Buscar configuração de dias de validade
    const configuracoes = await configuracoesGeraisRepository.get();
    const diasValidade = configuracoes.diasValidadeOrcamento || 30;

    // Definir novas datas
    const dataEmissao = new Date();
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + diasValidade);

    const novoOrcamento: Omit<Orcamento, 'id' | 'createdAt'> = {
      numero,
      versao: 0,
      tipo: orcamentoOriginal.tipo || 'simples',
      clienteId: orcamentoOriginal.clienteId,
      clienteNome: cliente.razaoSocial,
      clienteCnpj: cliente.cnpj || '',
      clienteTipoPessoa: detectarTipoPessoa(cliente.cnpj || ''),
      status: 'aberto',
      dataEmissao,
      dataValidade,
      itens: orcamentoOriginal.itens || [],
      valorTotal: orcamentoOriginal.valorTotal,
    };

    // Adicionar dados do cliente (Firestore não aceita undefined)
    if (cliente.endereco) novoOrcamento.clienteEndereco = cliente.endereco;
    if (cliente.cidade) novoOrcamento.clienteCidade = cliente.cidade;
    if (cliente.estado) novoOrcamento.clienteEstado = cliente.estado;
    if (cliente.cep) novoOrcamento.clienteCep = cliente.cep;
    if (cliente.telefone) novoOrcamento.clienteTelefone = cliente.telefone;
    if (cliente.email) novoOrcamento.clienteEmail = cliente.email;

    // Manter consultor, contato e observações do original
    if (orcamentoOriginal.consultor) novoOrcamento.consultor = orcamentoOriginal.consultor;
    if (orcamentoOriginal.contato) novoOrcamento.contato = orcamentoOriginal.contato;
    if (orcamentoOriginal.observacoes) novoOrcamento.observacoes = orcamentoOriginal.observacoes;

    // Campos específicos para orçamento completo
    if (orcamentoOriginal.tipo === 'completo') {
      if (orcamentoOriginal.servicoId) novoOrcamento.servicoId = orcamentoOriginal.servicoId;
      if (orcamentoOriginal.servicoDescricao) novoOrcamento.servicoDescricao = orcamentoOriginal.servicoDescricao;
      if (orcamentoOriginal.itensCompleto) novoOrcamento.itensCompleto = orcamentoOriginal.itensCompleto;
      if (orcamentoOriginal.limitacoesSelecionadas) novoOrcamento.limitacoesSelecionadas = orcamentoOriginal.limitacoesSelecionadas;
      if (orcamentoOriginal.prazoExecucaoServicos) novoOrcamento.prazoExecucaoServicos = orcamentoOriginal.prazoExecucaoServicos;
      if (orcamentoOriginal.prazoVistoriaBombeiros) novoOrcamento.prazoVistoriaBombeiros = orcamentoOriginal.prazoVistoriaBombeiros;
      if (orcamentoOriginal.condicaoPagamento) novoOrcamento.condicaoPagamento = orcamentoOriginal.condicaoPagamento;
      if (orcamentoOriginal.parcelamentoTexto) novoOrcamento.parcelamentoTexto = orcamentoOriginal.parcelamentoTexto;
      if (orcamentoOriginal.parcelamentoDados) novoOrcamento.parcelamentoDados = orcamentoOriginal.parcelamentoDados;
      if (orcamentoOriginal.valorTotalMaoDeObra) novoOrcamento.valorTotalMaoDeObra = orcamentoOriginal.valorTotalMaoDeObra;
      if (orcamentoOriginal.valorTotalMaterial) novoOrcamento.valorTotalMaterial = orcamentoOriginal.valorTotalMaterial;
    }

    return orcamentoRepository.create(novoOrcamento);
  },

  async getEstatisticas() {
    return orcamentoRepository.getEstatisticas();
  },

  async verificarExpirados(): Promise<number> {
    const orcamentosAbertos = await orcamentoRepository.findByStatus('aberto');
    const hoje = new Date();
    let expirados = 0;

    for (const orcamento of orcamentosAbertos) {
      if (orcamento.dataValidade < hoje) {
        await orcamentoRepository.updateStatus(orcamento.id!, 'expirado');
        expirados++;
      }
    }

    return expirados;
  },
};
