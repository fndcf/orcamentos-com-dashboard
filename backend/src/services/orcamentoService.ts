import { orcamentoRepository } from "../repositories/orcamentoRepository";
import { clienteRepository } from "../repositories/clienteRepository";
import { configuracoesGeraisRepository } from "../repositories/configuracoesGeraisRepository";
import {
  Orcamento,
  OrcamentoItemCompleto,
  OrcamentoStatus,
  OrcamentoTipo,
  TipoPessoa,
  ParcelamentoDados,
  DescontoAVistaDados,
  DashboardStats,
  DashboardMesStats,
  PaginatedResponse,
} from "../models";
import { ValidationError, NotFoundError } from "../utils/errors";
import { eventBus, OrcamentoEvents } from "../events";
import { FieldValue } from "../config/firebase";

// Helper para detectar tipo de pessoa baseado no documento (CPF ou CNPJ)
function detectarTipoPessoa(documento: string): TipoPessoa {
  const docLimpo = documento?.replace(/\D/g, "") || "";
  return docLimpo.length <= 11 ? "fisica" : "juridica";
}

// Helper para comparar valores de forma profunda (para detectar mudanças reais)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isEqual(a: any, b: any): boolean {
  // Se ambos são null/undefined
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;

  // Se são tipos primitivos
  if (typeof a !== "object" || typeof b !== "object") {
    return a === b;
  }

  // Se são objetos Date, comparar timestamps
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Se apenas um é Date, não são iguais
  if (a instanceof Date || b instanceof Date) {
    return false;
  }

  // Se são arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }

  // Se são objetos
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => isEqual(a[key], b[key]));
}

interface CriarOrcamentoDTO {
  tipo: OrcamentoTipo;
  clienteId: string;
  // Campos do orçamento completo
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number;
  prazoVistoriaBombeiros?: number;
  condicaoPagamento?: "a_vista" | "a_combinar" | "parcelado";
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados;
  descontoAVista?: DescontoAVistaDados;
  mostrarValoresDetalhados?: boolean;
  // Campos comuns
  observacoes?: string;
  diasValidade?: number;
  consultor?: string;
  contato?: string;
  email?: string;
  telefone?: string;
  enderecoServico?: string;
}

interface AtualizarOrcamentoDTO {
  // Campos do orçamento completo
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number;
  prazoVistoriaBombeiros?: number;
  condicaoPagamento?: "a_vista" | "a_combinar" | "parcelado";
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados;
  descontoAVista?: DescontoAVistaDados;
  mostrarValoresDetalhados?: boolean;
  // Campos comuns
  observacoes?: string;
  dataValidade?: Date;
  consultor?: string;
  contato?: string;
  email?: string;
  telefone?: string;
  enderecoServico?: string;
}

export const orcamentoService = {
  async listar(): Promise<Orcamento[]> {
    return orcamentoRepository.findAll();
  },

  async listarPaginado(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: OrcamentoStatus;
      clienteId?: string;
      busca?: string;
    }
  ): Promise<PaginatedResponse<Orcamento>> {
    return orcamentoRepository.findPaginated(page, limit, filters);
  },

  async buscarPorId(id: string): Promise<Orcamento> {
    return orcamentoRepository.findById(id);
  },

  async buscarPorCliente(clienteId: string): Promise<Orcamento[]> {
    return orcamentoRepository.findByClienteId(clienteId);
  },

  async getHistoricoCliente(clienteId: string, limit: number = 5): Promise<{
    orcamentos: Orcamento[];
    resumo: {
      total: number;
      aceitos: number;
      valorTotalAceitos: number;
    };
  }> {
    return orcamentoRepository.getHistoricoCliente(clienteId, limit);
  },

  async buscarPorStatus(status: OrcamentoStatus): Promise<Orcamento[]> {
    return orcamentoRepository.findByStatus(status);
  },

  async buscarPorPeriodo(dataInicio: string, dataFim: string): Promise<Orcamento[]> {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      throw new ValidationError('Datas inválidas');
    }

    // Ajustar fim para o final do dia
    fim.setHours(23, 59, 59, 999);

    return orcamentoRepository.findByPeriodo(inicio, fim);
  },

  async criar(data: CriarOrcamentoDTO): Promise<Orcamento> {
    // Validar cliente
    const cliente = await clienteRepository.findById(data.clienteId);
    if (!cliente) {
      throw new NotFoundError("Cliente não encontrado");
    }

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

    // Validar itens completos
    if (!data.itensCompleto || data.itensCompleto.length === 0) {
      throw new ValidationError("O orçamento deve ter pelo menos um item");
    }

    // Validar serviço
    if (!data.servicoId) {
      throw new ValidationError("O orçamento deve ter um serviço selecionado");
    }

    // Validar cada item completo
    for (const item of data.itensCompleto) {
      if (!item.categoriaId) {
        throw new ValidationError("Cada item deve ter uma categoria");
      }
      if (!item.descricao || item.descricao.trim().length < 3) {
        throw new ValidationError(
          "Descrição do item deve ter pelo menos 3 caracteres"
        );
      }
      if (item.quantidade <= 0) {
        throw new ValidationError("Quantidade deve ser maior que zero");
      }
    }

    // Calcular valores dos itens completos
    const itensCalculados = data.itensCompleto.map((item) => ({
      ...item,
      descricao: item.descricao.trim(),
      valorTotalMaoDeObra: item.quantidade * item.valorUnitarioMaoDeObra,
      valorTotalMaterial: item.quantidade * item.valorUnitarioMaterial,
      valorTotal:
        item.quantidade *
        (item.valorUnitarioMaoDeObra + item.valorUnitarioMaterial),
    }));

    const valorTotalMaoDeObra = itensCalculados.reduce(
      (acc, item) => acc + item.valorTotalMaoDeObra,
      0
    );
    const valorTotalMaterial = itensCalculados.reduce(
      (acc, item) => acc + item.valorTotalMaterial,
      0
    );
    const valorTotal = valorTotalMaoDeObra + valorTotalMaterial;

    // Base do orçamento
    const orcamento: Omit<Orcamento, "id" | "createdAt"> = {
      numero,
      versao: 0,
      tipo: "completo",
      clienteId: data.clienteId,
      clienteNome: cliente.razaoSocial,
      clienteCnpj: cliente.cnpj || "",
      clienteTipoPessoa: detectarTipoPessoa(cliente.cnpj || ""),
      status: "aberto",
      dataEmissao,
      dataValidade,
      servicoId: data.servicoId,
      itensCompleto: itensCalculados,
      valorTotalMaoDeObra,
      valorTotalMaterial,
      valorTotal,
    };

    // Adicionar dados do cliente (Firestore não aceita undefined)
    if (cliente.endereco) orcamento.clienteEndereco = cliente.endereco;
    if (cliente.cidade) orcamento.clienteCidade = cliente.cidade;
    if (cliente.estado) orcamento.clienteEstado = cliente.estado;
    if (cliente.cep) orcamento.clienteCep = cliente.cep;
    if (cliente.telefone) orcamento.clienteTelefone = cliente.telefone;
    if (cliente.email) orcamento.clienteEmail = cliente.email;

    // Adicionar consultor, contato, email, telefone e enderecoServico se existirem
    if (data.consultor?.trim()) orcamento.consultor = data.consultor.trim();
    if (data.contato?.trim()) orcamento.contato = data.contato.trim();
    if (data.email?.trim()) orcamento.email = data.email.trim();
    if (data.telefone?.trim()) orcamento.telefone = data.telefone.trim();
    if (data.enderecoServico?.trim()) orcamento.enderecoServico = data.enderecoServico.trim();

    // Adicionar observações apenas se existir
    if (data.observacoes?.trim()) {
      orcamento.observacoes = data.observacoes.trim();
    }

    // Campos opcionais do orçamento
    if (data.servicoDescricao)
      orcamento.servicoDescricao = data.servicoDescricao;
    if (data.limitacoesSelecionadas && data.limitacoesSelecionadas.length > 0) {
      orcamento.limitacoesSelecionadas = data.limitacoesSelecionadas;
    }
    if (data.prazoExecucaoServicos)
      orcamento.prazoExecucaoServicos = data.prazoExecucaoServicos;
    if (data.prazoVistoriaBombeiros)
      orcamento.prazoVistoriaBombeiros = data.prazoVistoriaBombeiros;
    if (data.condicaoPagamento)
      orcamento.condicaoPagamento = data.condicaoPagamento;
    if (data.parcelamentoTexto?.trim())
      orcamento.parcelamentoTexto = data.parcelamentoTexto.trim();
    if (data.parcelamentoDados)
      orcamento.parcelamentoDados = data.parcelamentoDados;
    if (data.descontoAVista) orcamento.descontoAVista = data.descontoAVista;
    if (data.mostrarValoresDetalhados !== undefined)
      orcamento.mostrarValoresDetalhados = data.mostrarValoresDetalhados;

    return orcamentoRepository.create(orcamento);
  },

  async atualizar(id: string, data: AtualizarOrcamentoDTO): Promise<Orcamento> {
    const orcamento = await orcamentoRepository.findById(id);

    // Só permite atualizar se estiver aberto
    if (orcamento.status !== "aberto") {
      throw new ValidationError(
        'Só é possível atualizar orçamentos com status "aberto"'
      );
    }

    const updateData: Partial<Orcamento> = {};

    // Atualização dos itens - compara com valores existentes
    if (data.itensCompleto) {
      if (data.itensCompleto.length === 0) {
        throw new ValidationError("O orçamento deve ter pelo menos um item");
      }

      // Validar cada item completo
      for (const item of data.itensCompleto) {
        if (!item.categoriaId) {
          throw new ValidationError("Cada item deve ter uma categoria");
        }
        if (!item.descricao || item.descricao.trim().length < 3) {
          throw new ValidationError(
            "Descrição do item deve ter pelo menos 3 caracteres"
          );
        }
        if (item.quantidade <= 0) {
          throw new ValidationError("Quantidade deve ser maior que zero");
        }
      }

      // Calcular valores dos itens completos
      const itensCalculados = data.itensCompleto.map((item) => ({
        ...item,
        descricao: item.descricao.trim(),
        valorTotalMaoDeObra: item.quantidade * item.valorUnitarioMaoDeObra,
        valorTotalMaterial: item.quantidade * item.valorUnitarioMaterial,
        valorTotal:
          item.quantidade *
          (item.valorUnitarioMaoDeObra + item.valorUnitarioMaterial),
      }));

      // Só atualiza itens se realmente mudaram
      if (!isEqual(itensCalculados, orcamento.itensCompleto)) {
        const valorTotalMaoDeObra = itensCalculados.reduce(
          (acc, item) => acc + item.valorTotalMaoDeObra,
          0
        );
        const valorTotalMaterial = itensCalculados.reduce(
          (acc, item) => acc + item.valorTotalMaterial,
          0
        );
        const valorTotal = valorTotalMaoDeObra + valorTotalMaterial;

        updateData.itensCompleto = itensCalculados;
        updateData.valorTotalMaoDeObra = valorTotalMaoDeObra;
        updateData.valorTotalMaterial = valorTotalMaterial;
        updateData.valorTotal = valorTotal;
      }
    }

    // Campos opcionais do orçamento - só atualiza se mudou
    if (
      data.servicoId !== undefined &&
      data.servicoId !== orcamento.servicoId
    ) {
      updateData.servicoId = data.servicoId;
    }
    if (
      data.servicoDescricao !== undefined &&
      data.servicoDescricao !== orcamento.servicoDescricao
    ) {
      updateData.servicoDescricao = data.servicoDescricao;
    }
    if (
      data.limitacoesSelecionadas !== undefined &&
      !isEqual(data.limitacoesSelecionadas, orcamento.limitacoesSelecionadas)
    ) {
      updateData.limitacoesSelecionadas = data.limitacoesSelecionadas;
    }
    if (
      data.prazoExecucaoServicos !== undefined &&
      data.prazoExecucaoServicos !== orcamento.prazoExecucaoServicos
    ) {
      updateData.prazoExecucaoServicos = data.prazoExecucaoServicos;
    }
    // prazoVistoriaBombeiros - pode ser null para remover
    if (data.prazoVistoriaBombeiros !== undefined) {
      if (data.prazoVistoriaBombeiros !== orcamento.prazoVistoriaBombeiros) {
        updateData.prazoVistoriaBombeiros = data.prazoVistoriaBombeiros
          ? data.prazoVistoriaBombeiros
          : (FieldValue.delete() as any);
      }
    }

    // Condição de pagamento - só atualiza se mudou
    if (
      data.condicaoPagamento !== undefined &&
      data.condicaoPagamento !== orcamento.condicaoPagamento
    ) {
      updateData.condicaoPagamento = data.condicaoPagamento;
      // Limpar dados de parcelamento se a condição não for "parcelado"
      if (data.condicaoPagamento !== "parcelado") {
        updateData.parcelamentoTexto = "";
        updateData.parcelamentoDados = null;
      }
      // Limpar dados de desconto se a condição não for "a_vista"
      if (data.condicaoPagamento !== "a_vista") {
        updateData.descontoAVista = null;
      }
    }

    // Parcelamento - só atualiza se mudou
    const novoParcelamentoTexto = data.parcelamentoTexto?.trim() || "";
    if (
      data.parcelamentoTexto !== undefined &&
      novoParcelamentoTexto !== (orcamento.parcelamentoTexto || "")
    ) {
      updateData.parcelamentoTexto = novoParcelamentoTexto;
    }
    if (
      data.parcelamentoDados !== undefined &&
      !isEqual(data.parcelamentoDados, orcamento.parcelamentoDados)
    ) {
      updateData.parcelamentoDados = data.parcelamentoDados || null;
    }

    // Desconto à vista - só atualiza se mudou
    if ("descontoAVista" in data) {
      const novoDesconto =
        data.descontoAVista &&
        typeof data.descontoAVista === "object" &&
        data.descontoAVista.percentual > 0
          ? data.descontoAVista
          : null;
      if (!isEqual(novoDesconto, orcamento.descontoAVista)) {
        updateData.descontoAVista = novoDesconto;
      }
    }

    // Mostrar valores detalhados - só atualiza se mudou
    if (
      data.mostrarValoresDetalhados !== undefined &&
      data.mostrarValoresDetalhados !== orcamento.mostrarValoresDetalhados
    ) {
      updateData.mostrarValoresDetalhados = data.mostrarValoresDetalhados;
    }

    // Observações - só atualiza se mudou
    if (data.observacoes !== undefined) {
      const novaObs = data.observacoes?.trim() || "";
      if (novaObs !== (orcamento.observacoes || "")) {
        if (novaObs) {
          updateData.observacoes = novaObs;
        }
      }
    }

    if (
      data.dataValidade &&
      !isEqual(data.dataValidade, orcamento.dataValidade)
    ) {
      updateData.dataValidade = data.dataValidade;
    }

    // Campos consultor, contato, email e telefone - só atualiza se mudou
    if (data.consultor !== undefined) {
      const novoValor = data.consultor?.trim() || '';
      const valorAtual = orcamento.consultor || '';
      if (novoValor !== valorAtual) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateData.consultor = novoValor ? novoValor : (FieldValue.delete() as any);
      }
    }

    if (data.contato !== undefined) {
      const novoValor = data.contato?.trim() || '';
      const valorAtual = orcamento.contato || '';
      if (novoValor !== valorAtual) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateData.contato = novoValor ? novoValor : (FieldValue.delete() as any);
      }
    }

    if (data.email !== undefined) {
      const novoValor = data.email?.trim() || '';
      const valorAtual = orcamento.email || '';
      if (novoValor !== valorAtual) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateData.email = novoValor ? novoValor : (FieldValue.delete() as any);
      }
    }

    if (data.telefone !== undefined) {
      const novoValor = data.telefone?.trim() || '';
      const valorAtual = orcamento.telefone || '';
      if (novoValor !== valorAtual) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateData.telefone = novoValor ? novoValor : (FieldValue.delete() as any);
      }
    }

    if (data.enderecoServico !== undefined) {
      const novoValor = data.enderecoServico?.trim() || '';
      const valorAtual = orcamento.enderecoServico || '';
      if (novoValor !== valorAtual) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateData.enderecoServico = novoValor ? novoValor : (FieldValue.delete() as any);
      }
    }

    // Só incrementa a versão se houve alterações reais nos dados
    // Verifica se há alguma propriedade em updateData (além de versao que ainda não foi adicionada)
    const hasChanges = Object.keys(updateData).length > 0;

    if (hasChanges) {
      updateData.versao = (orcamento.versao || 0) + 1;
      return orcamentoRepository.update(id, updateData);
    }

    // Se não houve mudanças, retorna o orçamento sem atualizar
    return orcamento;
  },

  async atualizarStatus(
    id: string,
    status: OrcamentoStatus
  ): Promise<Orcamento> {
    const orcamento = await orcamentoRepository.findById(id);

    // Validar transições de status
    const transicoesValidas: Record<OrcamentoStatus, OrcamentoStatus[]> = {
      aberto: ["aceito", "recusado", "expirado"],
      aceito: ["aberto"],
      recusado: ["aberto"],
      expirado: ["aberto"],
    };

    if (!transicoesValidas[orcamento.status].includes(status)) {
      throw new ValidationError(
        `Não é possível mudar o status de "${orcamento.status}" para "${status}"`
      );
    }

    const dataAceite = status === "aceito" ? new Date() : undefined;
    const statusAnterior = orcamento.status;

    const orcamentoAtualizado = await orcamentoRepository.updateStatus(
      id,
      status,
      dataAceite
    );

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
    if (orcamento.status === "aceito") {
      throw new ValidationError("Não é possível excluir um orçamento aceito");
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
      throw new ValidationError(
        "Cliente do orçamento original não existe mais"
      );
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

    const novoOrcamento: Omit<Orcamento, "id" | "createdAt"> = {
      numero,
      versao: 0,
      tipo: "completo",
      clienteId: orcamentoOriginal.clienteId,
      clienteNome: cliente.razaoSocial,
      clienteCnpj: cliente.cnpj || "",
      clienteTipoPessoa: detectarTipoPessoa(cliente.cnpj || ""),
      status: "aberto",
      dataEmissao,
      dataValidade,
      valorTotal: orcamentoOriginal.valorTotal,
    };

    // Adicionar dados do cliente (Firestore não aceita undefined)
    if (cliente.endereco) novoOrcamento.clienteEndereco = cliente.endereco;
    if (cliente.cidade) novoOrcamento.clienteCidade = cliente.cidade;
    if (cliente.estado) novoOrcamento.clienteEstado = cliente.estado;
    if (cliente.cep) novoOrcamento.clienteCep = cliente.cep;
    if (cliente.telefone) novoOrcamento.clienteTelefone = cliente.telefone;
    if (cliente.email) novoOrcamento.clienteEmail = cliente.email;

    // Manter consultor, contato, email, telefone, enderecoServico e observações do original
    if (orcamentoOriginal.consultor)
      novoOrcamento.consultor = orcamentoOriginal.consultor;
    if (orcamentoOriginal.contato)
      novoOrcamento.contato = orcamentoOriginal.contato;
    if (orcamentoOriginal.email) novoOrcamento.email = orcamentoOriginal.email;
    if (orcamentoOriginal.telefone)
      novoOrcamento.telefone = orcamentoOriginal.telefone;
    if (orcamentoOriginal.enderecoServico)
      novoOrcamento.enderecoServico = orcamentoOriginal.enderecoServico;
    if (orcamentoOriginal.observacoes)
      novoOrcamento.observacoes = orcamentoOriginal.observacoes;

    // Campos do orçamento
    if (orcamentoOriginal.servicoId)
      novoOrcamento.servicoId = orcamentoOriginal.servicoId;
    if (orcamentoOriginal.servicoDescricao)
      novoOrcamento.servicoDescricao = orcamentoOriginal.servicoDescricao;
    if (orcamentoOriginal.itensCompleto)
      novoOrcamento.itensCompleto = orcamentoOriginal.itensCompleto;
    if (orcamentoOriginal.limitacoesSelecionadas)
      novoOrcamento.limitacoesSelecionadas =
        orcamentoOriginal.limitacoesSelecionadas;
    if (orcamentoOriginal.prazoExecucaoServicos)
      novoOrcamento.prazoExecucaoServicos =
        orcamentoOriginal.prazoExecucaoServicos;
    if (orcamentoOriginal.prazoVistoriaBombeiros)
      novoOrcamento.prazoVistoriaBombeiros =
        orcamentoOriginal.prazoVistoriaBombeiros;
    if (orcamentoOriginal.condicaoPagamento)
      novoOrcamento.condicaoPagamento = orcamentoOriginal.condicaoPagamento;
    if (orcamentoOriginal.parcelamentoTexto)
      novoOrcamento.parcelamentoTexto = orcamentoOriginal.parcelamentoTexto;
    if (orcamentoOriginal.parcelamentoDados)
      novoOrcamento.parcelamentoDados = orcamentoOriginal.parcelamentoDados;
    if (orcamentoOriginal.descontoAVista)
      novoOrcamento.descontoAVista = orcamentoOriginal.descontoAVista;
    if (orcamentoOriginal.mostrarValoresDetalhados !== undefined)
      novoOrcamento.mostrarValoresDetalhados =
        orcamentoOriginal.mostrarValoresDetalhados;
    if (orcamentoOriginal.valorTotalMaoDeObra)
      novoOrcamento.valorTotalMaoDeObra = orcamentoOriginal.valorTotalMaoDeObra;
    if (orcamentoOriginal.valorTotalMaterial)
      novoOrcamento.valorTotalMaterial = orcamentoOriginal.valorTotalMaterial;

    return orcamentoRepository.create(novoOrcamento);
  },

  async getEstatisticas() {
    return orcamentoRepository.getEstatisticas();
  },

  async verificarExpirados(): Promise<number> {
    const orcamentosAbertos = await orcamentoRepository.findByStatus("aberto");
    const hoje = new Date();
    let expirados = 0;

    for (const orcamento of orcamentosAbertos) {
      if (orcamento.dataValidade < hoje) {
        await orcamentoRepository.updateStatus(orcamento.id!, "expirado");
        expirados++;
      }
    }

    return expirados;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    // Buscar todos os orçamentos e clientes em paralelo
    const [orcamentos, clientes] = await Promise.all([
      orcamentoRepository.findAll(),
      clienteRepository.findAll(),
    ]);

    // Calcular estatísticas básicas
    let abertos = 0;
    let aceitos = 0;
    let recusados = 0;
    let expirados = 0;
    let valorTotal = 0;
    let valorAceitos = 0;

    for (const orc of orcamentos) {
      valorTotal += orc.valorTotal || 0;

      switch (orc.status) {
        case "aberto":
          abertos++;
          break;
        case "aceito":
          aceitos++;
          valorAceitos += orc.valorTotal || 0;
          break;
        case "recusado":
          recusados++;
          break;
        case "expirado":
          expirados++;
          break;
      }
    }

    // Calcular dados dos últimos 6 meses
    const now = new Date();
    const last6Months: { mes: string; ano: number; mesIndex: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        mes: MONTH_NAMES[date.getMonth()],
        ano: date.getFullYear(),
        mesIndex: date.getMonth(),
      });
    }

    const porMes: DashboardMesStats[] = last6Months.map(({ mes, ano, mesIndex }) => {
      const monthOrcamentos = orcamentos.filter((o) => {
        const date = o.dataEmissao instanceof Date ? o.dataEmissao : new Date(o.dataEmissao);
        return date.getMonth() === mesIndex && date.getFullYear() === ano;
      });

      const total = monthOrcamentos.length;
      const aceitosNoMes = monthOrcamentos.filter((o) => o.status === "aceito").length;
      const valor = monthOrcamentos.reduce((acc, o) => acc + (o.valorTotal || 0), 0);

      return {
        mes: `${mes}/${ano.toString().slice(-2)}`,
        ano,
        mesIndex,
        total,
        aceitos: aceitosNoMes,
        valor,
      };
    });

    return {
      total: orcamentos.length,
      abertos,
      aceitos,
      recusados,
      expirados,
      valorTotal,
      valorAceitos,
      totalClientes: clientes.length,
      porMes,
    };
  },
};
