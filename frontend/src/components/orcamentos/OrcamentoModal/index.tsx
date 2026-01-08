import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Orcamento,
  OrcamentoItemCompleto,
  Cliente,
  OrcamentoSaveData,
  ParcelamentoDados,
  DescontoAVistaDados,
} from "../../../types";
import { formatOrcamentoNumero } from "../../../utils/constants";
import { useClientesInfiniteScroll, useCliente } from "../../../hooks/useClientes";
import { useServicosAtivos } from "../../../hooks/useServicos";
import { useCategoriasItemAtivas } from "../../../hooks/useCategoriasItem";
import { useLimitacoesAtivas } from "../../../hooks/useLimitacoes";
import { useConfiguracoesGerais } from "../../../hooks/useConfiguracoesGerais";
import {
  Modal,
  Button,
  Input,
  InputGroup,
  Label,
  TextArea,
  ErrorText,
  InputRow,
} from "../../ui";
import { NovoClienteForm } from "./NovoClienteForm";
import { ItensCompleto } from "./ItensCompleto";
import {
  ServicoSection,
  LimitacoesSection,
  PrazosSection,
  CondicaoPagamentoFormSection,
} from "./OrcamentoCompletoSections";
import {
  Form,
  ClienteSelect,
  ClienteInfo,
  ToggleButton,
  ButtonGroup,
  CompletoSection,
  CheckboxOption,
  ClienteSearchContainer,
  ClienteSearchInput,
  ClienteSearchDropdownButton,
  ClienteSearchDropdown,
  ClienteSearchOption,
  ClienteSearchEmpty,
  ClienteSearchLoading,
  ClienteSearchTotal,
} from "./styles";

interface OrcamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: OrcamentoSaveData) => Promise<void>;
  orcamento?: Orcamento | null;
  duplicarDe?: Orcamento | null;
  loading?: boolean;
}

const emptyItemCompleto: OrcamentoItemCompleto = {
  etapa: "comercial",
  categoriaId: "",
  categoriaNome: "",
  descricao: "",
  unidade: "un",
  quantidade: 1,
  valorUnitarioMaoDeObra: 0,
  valorUnitarioMaterial: 0,
  valorTotalMaoDeObra: 0,
  valorTotalMaterial: 0,
  valorTotal: 0,
};

export function OrcamentoModal({
  isOpen,
  onClose,
  onSave,
  orcamento,
  duplicarDe,
  loading,
}: OrcamentoModalProps) {
  const { data: servicosAtivos } = useServicosAtivos();
  const { data: categoriasAtivas } = useCategoriasItemAtivas();
  const { data: limitacoesAtivas } = useLimitacoesAtivas();
  const { data: configuracoes } = useConfiguracoesGerais();

  const [clienteId, setClienteId] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(
    null
  );

  // Estados do orçamento
  const [servicoId, setServicoId] = useState("");
  const [itensCompleto, setItensCompleto] = useState<OrcamentoItemCompleto[]>([
    { ...emptyItemCompleto },
  ]);
  const [limitacoesSelecionadas, setLimitacoesSelecionadas] = useState<
    string[]
  >([]);
  const [prazoExecucaoServicos, setPrazoExecucaoServicos] = useState(20);
  const [prazoVistoriaBombeiros, setPrazoVistoriaBombeiros] = useState<number | null>(null);
  const [condicaoPagamento, setCondicaoPagamento] = useState<
    "a_vista" | "a_combinar" | "parcelado"
  >("a_combinar");
  const [parcelamentoTexto, setParcelamentoTexto] = useState("");
  const [parcelamentoDados, setParcelamentoDados] = useState<
    ParcelamentoDados | undefined
  >(undefined);
  const [descontoAVista, setDescontoAVista] = useState<
    DescontoAVistaDados | undefined
  >(undefined);
  const [mostrarValoresDetalhados, setMostrarValoresDetalhados] =
    useState(true);

  // Estados comuns
  const [observacoes, setObservacoes] = useState("");
  const [consultor, setConsultor] = useState("");
  const [contato, setContato] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [enderecoServico, setEnderecoServico] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado para novo cliente inline
  const [mostrarNovoCliente, setMostrarNovoCliente] = useState(false);

  // Estados para busca de cliente com debounce
  const [clienteSearchText, setClienteSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [clienteDropdownOpen, setClienteDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const clienteSearchRef = useRef<HTMLDivElement>(null);
  const clienteInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const isInitializedRef = useRef(false);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(clienteSearchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [clienteSearchText]);

  // Infinite scroll para clientes
  const {
    data: clientesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingClientes,
  } = useClientesInfiniteScroll(debouncedSearch || undefined, 20);

  // Busca cliente específico para edição/duplicação
  const clienteIdParaBuscar = (orcamento?.clienteId || duplicarDe?.clienteId) && !clienteSelecionado
    ? (orcamento?.clienteId || duplicarDe?.clienteId)
    : "";
  const { data: clienteExistente } = useCliente(clienteIdParaBuscar || "");

  // Flatten das páginas de clientes
  const clientesFiltrados = useMemo(() => {
    if (!clientesData?.pages) return [];
    return clientesData.pages.flatMap(page => page.items);
  }, [clientesData]);

  // Total de clientes disponíveis
  const totalClientes = clientesData?.pages?.[0]?.total || 0;

  // Handler para scroll infinito no dropdown
  const handleDropdownScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Carregar mais quando estiver a 100px do final
    if (scrollHeight - scrollTop - clientHeight < 100 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        clienteSearchRef.current &&
        !clienteSearchRef.current.contains(event.target as Node)
      ) {
        setClienteDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Quando cliente existente é carregado (para edição/duplicação)
  useEffect(() => {
    if (clienteExistente && !clienteSelecionado && isOpen) {
      setClienteSelecionado(clienteExistente);
      setClienteSearchText(clienteExistente.razaoSocial);
    }
  }, [clienteExistente, clienteSelecionado, isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Se já foi inicializado enquanto o modal está aberto, não resetar
      // Isso evita que o cliente selecionado seja perdido quando a lista de clientes é atualizada
      if (isInitializedRef.current) {
        return;
      }
      isInitializedRef.current = true;

      if (orcamento) {
        // Editando orçamento existente
        setClienteId(orcamento.clienteId);
        setObservacoes(orcamento.observacoes || "");
        setConsultor(orcamento.consultor || "");
        setContato(orcamento.contato || "");
        setEmail(orcamento.email || "");
        setTelefone(orcamento.telefone || "");
        setEnderecoServico(orcamento.enderecoServico || "");

        setServicoId(orcamento.servicoId || "");
        setItensCompleto(
          orcamento.itensCompleto?.length
            ? orcamento.itensCompleto
            : [{ ...emptyItemCompleto }]
        );
        // Converter textos das limitações de volta para IDs (para compatibilidade com checkboxes)
        const limitacoesIds = (orcamento.limitacoesSelecionadas || [])
          .map((texto) => limitacoesAtivas?.find((l) => l.texto === texto)?.id)
          .filter((id): id is string => !!id);
        setLimitacoesSelecionadas(
          limitacoesIds.length > 0
            ? limitacoesIds
            : orcamento.limitacoesSelecionadas || []
        );
        setPrazoExecucaoServicos(orcamento.prazoExecucaoServicos || 20);
        setPrazoVistoriaBombeiros(orcamento.prazoVistoriaBombeiros ?? null);
        setCondicaoPagamento(orcamento.condicaoPagamento || "a_combinar");
        setParcelamentoTexto(orcamento.parcelamentoTexto || "");
        setParcelamentoDados(orcamento.parcelamentoDados ?? undefined);
        setDescontoAVista(orcamento.descontoAVista ?? undefined);
        setMostrarValoresDetalhados(
          orcamento.mostrarValoresDetalhados !== false
        );

        // Cliente será carregado pelo useCliente hook
        setMostrarNovoCliente(false);
      } else if (duplicarDe) {
        // Duplicando orçamento - pré-preenche mas permite alterar cliente
        setClienteId(duplicarDe.clienteId);
        setObservacoes(duplicarDe.observacoes || "");
        setConsultor(duplicarDe.consultor || "");
        setContato(duplicarDe.contato || "");
        setEmail(duplicarDe.email || "");
        setTelefone(duplicarDe.telefone || "");
        setEnderecoServico(duplicarDe.enderecoServico || "");

        setServicoId(duplicarDe.servicoId || "");
        setItensCompleto(
          duplicarDe.itensCompleto?.length
            ? [...duplicarDe.itensCompleto]
            : [{ ...emptyItemCompleto }]
        );
        // Converter textos das limitações de volta para IDs (para compatibilidade com checkboxes)
        const limitacoesIds = (duplicarDe.limitacoesSelecionadas || [])
          .map((texto) => limitacoesAtivas?.find((l) => l.texto === texto)?.id)
          .filter((id): id is string => !!id);
        setLimitacoesSelecionadas(
          limitacoesIds.length > 0
            ? limitacoesIds
            : duplicarDe.limitacoesSelecionadas || []
        );
        setPrazoExecucaoServicos(duplicarDe.prazoExecucaoServicos || 20);
        setPrazoVistoriaBombeiros(duplicarDe.prazoVistoriaBombeiros ?? null);
        setCondicaoPagamento(duplicarDe.condicaoPagamento || "a_combinar");
        setParcelamentoTexto(duplicarDe.parcelamentoTexto || "");
        setParcelamentoDados(duplicarDe.parcelamentoDados ?? undefined);
        setDescontoAVista(duplicarDe.descontoAVista ?? undefined);
        setMostrarValoresDetalhados(
          duplicarDe.mostrarValoresDetalhados !== false
        );

        // Cliente será carregado pelo useCliente hook
        setMostrarNovoCliente(false);
      } else {
        // Novo orçamento
        setClienteId("");
        setClienteSelecionado(null);
        setClienteSearchText("");
        setDebouncedSearch("");
        setServicoId("");
        setItensCompleto([{ ...emptyItemCompleto }]);
        setLimitacoesSelecionadas([]);
        setPrazoExecucaoServicos(20);
        setPrazoVistoriaBombeiros(null);
        setCondicaoPagamento("a_combinar");
        setParcelamentoTexto("");
        setParcelamentoDados(undefined);
        setDescontoAVista(undefined);
        setMostrarValoresDetalhados(true);
        setObservacoes("");
        setConsultor("");
        setContato("");
        setEmail("");
        setTelefone("");
        setEnderecoServico("");
        setMostrarNovoCliente(false);
      }
      setErrors({});
      setClienteDropdownOpen(false);
      setHighlightedIndex(-1);
    } else {
      // Quando o modal fecha, resetar a flag para a próxima abertura
      isInitializedRef.current = false;
    }
  }, [isOpen, orcamento, duplicarDe, limitacoesAtivas]);

  const handleClienteSelect = (cliente: Cliente) => {
    setClienteId(cliente.id!);
    setClienteSelecionado(cliente);
    setClienteSearchText(cliente.razaoSocial);
    setClienteDropdownOpen(false);
    setHighlightedIndex(-1);
    setMostrarNovoCliente(false);
  };

  const handleClienteSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setClienteSearchText(value);
    setClienteDropdownOpen(true);
    setHighlightedIndex(-1);
    // Se limpar o campo, limpar a seleção
    if (!value.trim()) {
      setClienteId("");
      setClienteSelecionado(null);
    }
  };

  const handleClienteSearchFocus = () => {
    if (!mostrarNovoCliente && !(orcamento && !duplicarDe)) {
      setClienteDropdownOpen(true);
    }
  };

  const handleClienteSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!clienteDropdownOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < clientesFiltrados.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      const cliente = clientesFiltrados[highlightedIndex];
      if (cliente) {
        handleClienteSelect(cliente);
      }
    } else if (e.key === "Escape") {
      setClienteDropdownOpen(false);
    }
  };

  const handleToggleNovoCliente = () => {
    setMostrarNovoCliente(!mostrarNovoCliente);
    if (!mostrarNovoCliente) {
      setClienteId("");
      setClienteSelecionado(null);
      setClienteSearchText("");
      setClienteDropdownOpen(false);
    }
  };

  const handleClienteCriado = (novoCliente: Cliente) => {
    // O useCriarCliente já invalida a query de clientes, então não precisamos refetch
    // Apenas setamos os estados com o cliente recém-criado
    setClienteId(novoCliente.id!);
    setClienteSelecionado(novoCliente);
    setClienteSearchText(novoCliente.razaoSocial);
    setMostrarNovoCliente(false);
    setClienteDropdownOpen(false);
  };

  // Handlers para itens completos
  const handleItemCompletoChange = (
    index: number,
    field: keyof OrcamentoItemCompleto,
    value: string | number
  ) => {
    const newItens = [...itensCompleto];
    newItens[index] = {
      ...newItens[index],
      [field]: value,
    };

    // Se mudar categoria, atualizar o nome da categoria
    if (field === "categoriaId") {
      const categoria = categoriasAtivas?.find((c) => c.id === value);
      newItens[index].categoriaNome = categoria?.nome || "";
    }

    // Recalcular valores totais
    if (
      [
        "quantidade",
        "valorUnitarioMaoDeObra",
        "valorUnitarioMaterial",
      ].includes(field)
    ) {
      const qty = newItens[index].quantidade || 0;
      const maoDeObra = newItens[index].valorUnitarioMaoDeObra || 0;
      const material = newItens[index].valorUnitarioMaterial || 0;
      newItens[index].valorTotalMaoDeObra = qty * maoDeObra;
      newItens[index].valorTotalMaterial = qty * material;
      newItens[index].valorTotal =
        newItens[index].valorTotalMaoDeObra +
        newItens[index].valorTotalMaterial;
    }

    setItensCompleto(newItens);
  };

  // Handler para atualizar múltiplos campos de um item de uma vez (evita estado stale)
  const handleItemCompletoMultiChange = (
    index: number,
    changes: Partial<OrcamentoItemCompleto>
  ) => {
    const newItens = [...itensCompleto];
    newItens[index] = {
      ...newItens[index],
      ...changes,
    };

    // Se mudar categoria, atualizar o nome da categoria
    if (changes.categoriaId !== undefined) {
      const categoria = categoriasAtivas?.find(
        (c) => c.id === changes.categoriaId
      );
      newItens[index].categoriaNome = categoria?.nome || "";
    }

    // Recalcular valores totais se necessário
    if (
      changes.quantidade !== undefined ||
      changes.valorUnitarioMaoDeObra !== undefined ||
      changes.valorUnitarioMaterial !== undefined
    ) {
      const qty = newItens[index].quantidade || 0;
      const maoDeObra = newItens[index].valorUnitarioMaoDeObra || 0;
      const material = newItens[index].valorUnitarioMaterial || 0;
      newItens[index].valorTotalMaoDeObra = qty * maoDeObra;
      newItens[index].valorTotalMaterial = qty * material;
      newItens[index].valorTotal =
        newItens[index].valorTotalMaoDeObra +
        newItens[index].valorTotalMaterial;
    }

    setItensCompleto(newItens);
  };

  const addItemCompleto = () => {
    setItensCompleto([...itensCompleto, { ...emptyItemCompleto }]);
  };

  const removeItemCompleto = (index: number) => {
    if (itensCompleto.length > 1) {
      setItensCompleto(itensCompleto.filter((_, i) => i !== index));
    }
  };

  const handleLimitacaoToggle = (id: string) => {
    setLimitacoesSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const handleLimitacoesToggleAll = (ids: string[]) => {
    setLimitacoesSelecionadas(ids);
  };

  // Calcular valor total do orçamento
  const valorTotalOrcamento = useMemo(() => {
    return itensCompleto.reduce(
      (total, item) => total + (item.valorTotal || 0),
      0
    );
  }, [itensCompleto]);

  const scrollToFirstError = (errorKeys: string[]) => {
    if (errorKeys.length === 0 || !formRef.current) return;

    // Mapeia as chaves de erro para seletores de elementos
    const errorToSelector: Record<string, string> = {
      cliente: '[id="clienteSelect"]',
      servico: '[id="servicoSelect"]',
      itensCompleto: '[id="itensCompletoSection"]',
    };

    // Tenta encontrar o primeiro elemento com erro
    for (const key of errorKeys) {
      let selector = errorToSelector[key];

      // Para erros de itens específicos
      if (!selector && key.startsWith("itemc_")) {
        const match = key.match(/itemc_(\d+)/);
        if (match) {
          selector = `[data-itemc-index="${match[1]}"]`;
        }
      }

      if (selector) {
        const element = formRef.current.querySelector(selector);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
      }
    }

    // Fallback: scroll para o topo do formulário
    formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!clienteId) {
      newErrors.cliente = "Selecione um cliente ou cadastre um novo";
    }

    if (!servicoId) {
      newErrors.servico = "Selecione um serviço";
    }

    const itensValidos = itensCompleto.filter((item) => item.descricao.trim());
    if (itensValidos.length === 0) {
      newErrors.itensCompleto = "Adicione pelo menos um item com descrição";
    }

    for (let i = 0; i < itensCompleto.length; i++) {
      const item = itensCompleto[i];
      if (item.descricao.trim()) {
        if (!item.categoriaId) {
          newErrors[`itemc_${i}_categoria`] = "Selecione uma categoria";
        }
        if (item.descricao.trim().length < 3) {
          newErrors[`itemc_${i}_descricao`] = "Mínimo 3 caracteres";
        }
        if (item.quantidade <= 0) {
          newErrors[`itemc_${i}_quantidade`] = "Maior que 0";
        }
      }
    }

    setErrors(newErrors);

    // Scroll até o primeiro erro
    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      setTimeout(() => scrollToFirstError(errorKeys), 100);
    }

    return errorKeys.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Filtrar itens vazios e adicionar categoriaNome
    const itensValidosCompleto = itensCompleto
      .filter((item) => item.descricao.trim())
      .map((item) => {
        const categoria = categoriasAtivas?.find(
          (c) => c.id === item.categoriaId
        );
        return {
          ...item,
          categoriaNome: categoria?.nome || item.categoriaNome || "",
          unidade: item.unidade?.trim() || "un",
        };
      });

    const servicoSelecionado = servicosAtivos?.find((s) => s.id === servicoId);

    // Converter IDs das limitações para textos
    const limitacoesTextos = limitacoesSelecionadas
      .map((id) => limitacoesAtivas?.find((l) => l.id === id)?.texto)
      .filter((texto): texto is string => !!texto);

    // Determinar o valor do desconto para enviar
    // Se condicao é a_vista e tem desconto, envia o objeto
    // Se não é a_vista ou não tem desconto, envia null (não undefined)
    // Isso garante que o backend receba a propriedade e possa atualizar corretamente
    const descontoParaEnviar = condicaoPagamento === "a_vista" && descontoAVista?.percentual && descontoAVista.percentual > 0
      ? descontoAVista
      : null;

    await onSave({
      tipo: "completo",
      clienteId,
      servicoId,
      servicoDescricao: servicoSelecionado?.descricao,
      itensCompleto: itensValidosCompleto,
      limitacoesSelecionadas:
        limitacoesTextos.length > 0 ? limitacoesTextos : undefined,
      prazoExecucaoServicos,
      prazoVistoriaBombeiros: prazoVistoriaBombeiros, // Envia null explicitamente para limpar o campo
      condicaoPagamento,
      parcelamentoTexto:
        condicaoPagamento === "parcelado"
          ? parcelamentoTexto.trim()
          : undefined,
      parcelamentoDados:
        condicaoPagamento === "parcelado" ? parcelamentoDados : undefined,
      // Envia null explicitamente para garantir que o backend processe
      descontoAVista: descontoParaEnviar,
      mostrarValoresDetalhados,
      observacoes: observacoes.trim() || undefined,
      // Envia string vazia para permitir limpar os campos ao editar
      consultor: consultor.trim(),
      contato: contato.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      enderecoServico: enderecoServico.trim(),
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        orcamento
          ? `Editar Orçamento ${formatOrcamentoNumero(orcamento.numero, orcamento.dataEmissao, orcamento.versao)}`
          : duplicarDe
          ? `Duplicar Orçamento ${formatOrcamentoNumero(duplicarDe.numero, duplicarDe.dataEmissao, duplicarDe.versao)}`
          : "Novo Orçamento"
      }
      size="xlarge"
    >
      <Form ref={formRef} onSubmit={handleSubmit}>
        {/* Seleção de Cliente */}
        <InputGroup id="clienteSelect">
          <Label>Cliente *</Label>
          <ClienteSelect>
            <ClienteSearchContainer ref={clienteSearchRef}>
              <ClienteSearchInput
                ref={clienteInputRef}
                type="text"
                placeholder="Digite para buscar um cliente..."
                value={clienteSearchText}
                onChange={handleClienteSearchChange}
                onFocus={handleClienteSearchFocus}
                onKeyDown={handleClienteSearchKeyDown}
                $disabled={(!!orcamento && !duplicarDe) || mostrarNovoCliente}
                disabled={(!!orcamento && !duplicarDe) || mostrarNovoCliente}
              />
              <ClienteSearchDropdownButton
                type="button"
                onClick={() => {
                  if (!(!!orcamento && !duplicarDe) && !mostrarNovoCliente) {
                    setClienteDropdownOpen(!clienteDropdownOpen);
                  }
                }}
                $disabled={(!!orcamento && !duplicarDe) || mostrarNovoCliente}
                disabled={(!!orcamento && !duplicarDe) || mostrarNovoCliente}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    transform: clienteDropdownOpen ? "rotate(180deg)" : "none",
                  }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </ClienteSearchDropdownButton>

              {clienteDropdownOpen && !mostrarNovoCliente && (
                <ClienteSearchDropdown
                  ref={dropdownRef}
                  onScroll={handleDropdownScroll}
                >
                  {isLoadingClientes ? (
                    <ClienteSearchLoading $initial>Carregando...</ClienteSearchLoading>
                  ) : clientesFiltrados.length > 0 ? (
                    <>
                      {clientesFiltrados.map((cliente, index) => (
                        <ClienteSearchOption
                          key={cliente.id}
                          $highlighted={index === highlightedIndex}
                          onClick={() => handleClienteSelect(cliente)}
                        >
                          <div className="nome">{cliente.razaoSocial}</div>
                          <div className="info">
                            {cliente.cnpj}
                            {cliente.cidade && ` • ${cliente.cidade}`}
                            {cliente.estado && `/${cliente.estado}`}
                          </div>
                        </ClienteSearchOption>
                      ))}
                      {isFetchingNextPage && (
                        <ClienteSearchLoading>Carregando mais...</ClienteSearchLoading>
                      )}
                      {totalClientes > 0 && (
                        <ClienteSearchTotal>
                          {clientesFiltrados.length} de {totalClientes} clientes
                        </ClienteSearchTotal>
                      )}
                    </>
                  ) : (
                    <ClienteSearchEmpty>
                      Nenhum cliente encontrado
                    </ClienteSearchEmpty>
                  )}
                </ClienteSearchDropdown>
              )}
            </ClienteSearchContainer>
            {(!orcamento || duplicarDe) && (
              <ToggleButton
                type="button"
                $active={mostrarNovoCliente}
                onClick={handleToggleNovoCliente}
              >
                {mostrarNovoCliente ? "Cancelar" : "+ Novo Cliente"}
              </ToggleButton>
            )}
          </ClienteSelect>
          {errors.cliente && <ErrorText>{errors.cliente}</ErrorText>}
        </InputGroup>

        {clienteSelecionado && !mostrarNovoCliente && (
          <ClienteInfo>
            <strong>{clienteSelecionado.razaoSocial}</strong>
            {clienteSelecionado.nomeFantasia &&
              ` (${clienteSelecionado.nomeFantasia})`}
            <br />
            CNPJ/CPF: {clienteSelecionado.cnpj}
            {(clienteSelecionado.cidade || clienteSelecionado.estado) && (
              <>
                <br />
                {clienteSelecionado.cidade}
                {clienteSelecionado.cidade && clienteSelecionado.estado && "/"}
                {clienteSelecionado.estado}
              </>
            )}
          </ClienteInfo>
        )}

        {/* Formulário de Novo Cliente Inline */}
        {mostrarNovoCliente && (
          <NovoClienteForm
            onClienteCriado={handleClienteCriado}
            onCancelar={handleToggleNovoCliente}
          />
        )}

        <ServicoSection
          servicoId={servicoId}
          servicos={servicosAtivos}
          error={errors.servico}
          onServicoChange={setServicoId}
        />

        {/* Checkbox para mostrar valores detalhados no PDF */}
        <CompletoSection>
          <CheckboxOption>
            <input
              type="checkbox"
              checked={mostrarValoresDetalhados}
              onChange={(e) => setMostrarValoresDetalhados(e.target.checked)}
            />
            <span>
              Mostrar valores detalhados (Mão de Obra e Material) na proposta
            </span>
          </CheckboxOption>
        </CompletoSection>

        <ItensCompleto
          itens={itensCompleto}
          categorias={categoriasAtivas}
          errors={errors}
          onItemChange={handleItemCompletoChange}
          onItemMultiChange={handleItemCompletoMultiChange}
          onAddItem={addItemCompleto}
          onRemoveItem={removeItemCompleto}
        />

        <LimitacoesSection
          limitacoes={limitacoesAtivas}
          selecionadas={limitacoesSelecionadas}
          onToggle={handleLimitacaoToggle}
          onToggleAll={handleLimitacoesToggleAll}
        />

        {/* Campo de observações adicionais */}
        <CompletoSection>
          <h4>Observações Adicionais</h4>
          <InputGroup>
            <TextArea
              placeholder="Digite observações adicionais que não estão nos itens acima..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </InputGroup>
        </CompletoSection>

        <PrazosSection
          prazoExecucao={prazoExecucaoServicos}
          prazoVistoria={prazoVistoriaBombeiros}
          onPrazoExecucaoChange={setPrazoExecucaoServicos}
          onPrazoVistoriaChange={setPrazoVistoriaBombeiros}
        />

        <CondicaoPagamentoFormSection
          condicao={condicaoPagamento}
          parcelamentoTexto={parcelamentoTexto}
          parcelamentoDados={parcelamentoDados}
          descontoAVista={descontoAVista}
          onCondicaoChange={setCondicaoPagamento}
          onParcelamentoTextoChange={setParcelamentoTexto}
          onParcelamentoDadosChange={setParcelamentoDados}
          onDescontoAVistaChange={setDescontoAVista}
          valorTotal={valorTotalOrcamento}
          configuracoes={configuracoes}
        />

        <InputRow>
          <InputGroup>
            <Label>Consultor</Label>
            <Input
              placeholder="Nome do consultor"
              value={consultor}
              onChange={(e) => setConsultor(e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <Label>Contato</Label>
            <Input
              placeholder="Nome do contato no cliente"
              value={contato}
              onChange={(e) => setContato(e.target.value)}
            />
          </InputGroup>
        </InputRow>

        <InputRow>
          <InputGroup>
            <Label>E-mail</Label>
            <Input
              type="email"
              placeholder="E-mail para contato (prioridade sobre cadastro do cliente)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <Label>Telefone</Label>
            <Input
              placeholder="Telefone para contato (prioridade sobre cadastro do cliente)"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </InputGroup>
        </InputRow>

        <InputRow>
          <InputGroup style={{ flex: 1 }}>
            <Label>Endereço do Serviço</Label>
            <Input
              placeholder="Endereço onde o serviço será executado"
              value={enderecoServico}
              onChange={(e) => setEnderecoServico(e.target.value)}
            />
          </InputGroup>
        </InputRow>

        <ButtonGroup>
          <Button type="button" $variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || mostrarNovoCliente}>
            {loading
              ? "Salvando..."
              : orcamento
              ? "Atualizar"
              : duplicarDe
              ? "Criar Cópia"
              : "Criar Orçamento"}
          </Button>
        </ButtonGroup>
      </Form>
    </Modal>
  );
}
