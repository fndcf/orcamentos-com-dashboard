import { useState, useEffect, useRef } from "react";
import {
  Orcamento,
  OrcamentoItem,
  OrcamentoItemCompleto,
  OrcamentoTipo,
  Cliente,
  OrcamentoSaveData,
} from "../../../types";
import { useClientes } from "../../../hooks/useClientes";
import { useServicosAtivos } from "../../../hooks/useServicos";
import { useCategoriasItemAtivas } from "../../../hooks/useCategoriasItem";
import { useLimitacoesAtivas } from "../../../hooks/useLimitacoes";
import {
  Modal,
  Button,
  Input,
  InputGroup,
  Label,
  TextArea,
  Select,
  ErrorText,
  InputRow,
} from "../../ui";
import { NovoClienteForm } from "./NovoClienteForm";
import { ItensSimples } from "./ItensSimples";
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
  TipoOrcamentoSelector,
  TipoOption,
  TipoLocked,
  ButtonGroup,
} from "./styles";

interface OrcamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: OrcamentoSaveData) => Promise<void>;
  orcamento?: Orcamento | null;
  duplicarDe?: Orcamento | null;
  loading?: boolean;
}

const emptyItem: OrcamentoItem = {
  descricao: "",
  quantidade: 1,
  unidade: "Serv.",
  valorUnitario: 0,
  valorTotal: 0,
};

const emptyItemCompleto: OrcamentoItemCompleto = {
  etapa: "residencial",
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
  const { data: clientes, refetch: refetchClientes } = useClientes();
  const { data: servicosAtivos } = useServicosAtivos();
  const { data: categoriasAtivas } = useCategoriasItemAtivas();
  const { data: limitacoesAtivas } = useLimitacoesAtivas();

  // Estado do tipo de orçamento
  const [tipoOrcamento, setTipoOrcamento] = useState<OrcamentoTipo>("simples");

  const [clienteId, setClienteId] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(
    null
  );

  // Estados para orçamento simples
  const [itens, setItens] = useState<OrcamentoItem[]>([{ ...emptyItem }]);

  // Estados para orçamento completo
  const [servicoId, setServicoId] = useState("");
  const [itensCompleto, setItensCompleto] = useState<OrcamentoItemCompleto[]>([
    { ...emptyItemCompleto },
  ]);
  const [limitacoesSelecionadas, setLimitacoesSelecionadas] = useState<
    string[]
  >([]);
  const [prazoExecucaoServicos, setPrazoExecucaoServicos] = useState(20);
  const [prazoVistoriaBombeiros, setPrazoVistoriaBombeiros] = useState(30);
  const [condicaoPagamento, setCondicaoPagamento] = useState<
    "a_combinar" | "parcelado"
  >("a_combinar");
  const [parcelamentoTexto, setParcelamentoTexto] = useState("");

  // Estados comuns
  const [observacoes, setObservacoes] = useState("");
  const [consultor, setConsultor] = useState("");
  const [contato, setContato] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado para novo cliente inline
  const [mostrarNovoCliente, setMostrarNovoCliente] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  // Verifica se é edição (não pode mudar tipo)
  const isEdicao = !!orcamento && !duplicarDe;

  useEffect(() => {
    if (isOpen) {
      if (orcamento) {
        // Editando orçamento existente
        setTipoOrcamento(orcamento.tipo || "simples");
        setClienteId(orcamento.clienteId);
        setObservacoes(orcamento.observacoes || "");
        setConsultor(orcamento.consultor || "");
        setContato(orcamento.contato || "");

        // Campos específicos por tipo
        if (orcamento.tipo === "completo") {
          setServicoId(orcamento.servicoId || "");
          setItensCompleto(
            orcamento.itensCompleto?.length
              ? orcamento.itensCompleto
              : [{ ...emptyItemCompleto }]
          );
          // Converter textos das limitações de volta para IDs (para compatibilidade com checkboxes)
          const limitacoesIds = (orcamento.limitacoesSelecionadas || [])
            .map(
              (texto) => limitacoesAtivas?.find((l) => l.texto === texto)?.id
            )
            .filter((id): id is string => !!id);
          setLimitacoesSelecionadas(
            limitacoesIds.length > 0
              ? limitacoesIds
              : orcamento.limitacoesSelecionadas || []
          );
          setPrazoExecucaoServicos(orcamento.prazoExecucaoServicos || 20);
          setPrazoVistoriaBombeiros(orcamento.prazoVistoriaBombeiros || 30);
          setCondicaoPagamento(orcamento.condicaoPagamento || "a_combinar");
          setParcelamentoTexto(orcamento.parcelamentoTexto || "");
          setItens([{ ...emptyItem }]); // reset simples
        } else {
          setItens(
            orcamento.itens.length > 0 ? orcamento.itens : [{ ...emptyItem }]
          );
          // reset completo
          setServicoId("");
          setItensCompleto([{ ...emptyItemCompleto }]);
          setLimitacoesSelecionadas([]);
          setPrazoExecucaoServicos(20);
          setPrazoVistoriaBombeiros(30);
          setCondicaoPagamento("a_combinar");
          setParcelamentoTexto("");
        }

        // Buscar cliente selecionado
        const cliente = clientes?.find((c) => c.id === orcamento.clienteId);
        setClienteSelecionado(cliente || null);
        setMostrarNovoCliente(false);
      } else if (duplicarDe) {
        // Duplicando orçamento - pré-preenche mas permite alterar cliente
        setTipoOrcamento(duplicarDe.tipo || "simples");
        setClienteId(duplicarDe.clienteId);
        setObservacoes(duplicarDe.observacoes || "");
        setConsultor(duplicarDe.consultor || "");
        setContato(duplicarDe.contato || "");

        // Campos específicos por tipo
        if (duplicarDe.tipo === "completo") {
          setServicoId(duplicarDe.servicoId || "");
          setItensCompleto(
            duplicarDe.itensCompleto?.length
              ? [...duplicarDe.itensCompleto]
              : [{ ...emptyItemCompleto }]
          );
          // Converter textos das limitações de volta para IDs (para compatibilidade com checkboxes)
          const limitacoesIds = (duplicarDe.limitacoesSelecionadas || [])
            .map(
              (texto) => limitacoesAtivas?.find((l) => l.texto === texto)?.id
            )
            .filter((id): id is string => !!id);
          setLimitacoesSelecionadas(
            limitacoesIds.length > 0
              ? limitacoesIds
              : duplicarDe.limitacoesSelecionadas || []
          );
          setPrazoExecucaoServicos(duplicarDe.prazoExecucaoServicos || 20);
          setPrazoVistoriaBombeiros(duplicarDe.prazoVistoriaBombeiros || 30);
          setCondicaoPagamento(duplicarDe.condicaoPagamento || "a_combinar");
          setParcelamentoTexto(duplicarDe.parcelamentoTexto || "");
          setItens([{ ...emptyItem }]);
        } else {
          setItens(
            duplicarDe.itens.length > 0
              ? [...duplicarDe.itens]
              : [{ ...emptyItem }]
          );
          setServicoId("");
          setItensCompleto([{ ...emptyItemCompleto }]);
          setLimitacoesSelecionadas([]);
          setPrazoExecucaoServicos(20);
          setPrazoVistoriaBombeiros(30);
          setCondicaoPagamento("a_combinar");
          setParcelamentoTexto("");
        }

        // Buscar cliente selecionado
        const cliente = clientes?.find((c) => c.id === duplicarDe.clienteId);
        setClienteSelecionado(cliente || null);
        setMostrarNovoCliente(false);
      } else {
        // Novo orçamento
        setTipoOrcamento("simples");
        setClienteId("");
        setClienteSelecionado(null);
        setItens([{ ...emptyItem }]);
        setServicoId("");
        setItensCompleto([{ ...emptyItemCompleto }]);
        setLimitacoesSelecionadas([]);
        setPrazoExecucaoServicos(20);
        setPrazoVistoriaBombeiros(30);
        setCondicaoPagamento("a_combinar");
        setParcelamentoTexto("");
        setObservacoes("");
        setConsultor("");
        setContato("");
        setMostrarNovoCliente(false);
      }
      setErrors({});
    }
  }, [isOpen, orcamento, duplicarDe, clientes, limitacoesAtivas]);

  const handleClienteChange = (id: string) => {
    setClienteId(id);
    const cliente = clientes?.find((c) => c.id === id);
    setClienteSelecionado(cliente || null);
    if (id) {
      setMostrarNovoCliente(false);
    }
  };

  const handleToggleNovoCliente = () => {
    setMostrarNovoCliente(!mostrarNovoCliente);
    if (!mostrarNovoCliente) {
      setClienteId("");
      setClienteSelecionado(null);
    }
  };

  const handleClienteCriado = async (novoCliente: Cliente) => {
    await refetchClientes();
    setClienteId(novoCliente.id!);
    setClienteSelecionado(novoCliente);
    setMostrarNovoCliente(false);
  };

  // Handlers para itens simples
  const handleItemChange = (
    index: number,
    field: keyof OrcamentoItem,
    value: string | number
  ) => {
    const newItens = [...itens];
    newItens[index] = {
      ...newItens[index],
      [field]: value,
    };

    // Recalcular valor total do item
    if (field === "quantidade" || field === "valorUnitario") {
      newItens[index].valorTotal =
        (newItens[index].quantidade || 0) *
        (newItens[index].valorUnitario || 0);
    }

    setItens(newItens);
  };

  const addItem = () => {
    setItens([...itens, { ...emptyItem }]);
  };

  const removeItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index));
    }
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

  const scrollToFirstError = (errorKeys: string[]) => {
    if (errorKeys.length === 0 || !formRef.current) return;

    // Mapeia as chaves de erro para seletores de elementos
    const errorToSelector: Record<string, string> = {
      cliente: '[id="clienteSelect"]',
      servico: '[id="servicoSelect"]',
      itens: '[id="itensSection"]',
      itensCompleto: '[id="itensCompletoSection"]',
    };

    // Tenta encontrar o primeiro elemento com erro
    for (const key of errorKeys) {
      let selector = errorToSelector[key];

      // Para erros de itens específicos
      if (!selector && key.startsWith("item_")) {
        const match = key.match(/item_(\d+)/);
        if (match) {
          selector = `[data-item-index="${match[1]}"]`;
        }
      }
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

    if (tipoOrcamento === "simples") {
      const itensValidos = itens.filter((item) => item.descricao.trim());
      if (itensValidos.length === 0) {
        newErrors.itens = "Adicione pelo menos um item com descrição";
      }

      for (let i = 0; i < itens.length; i++) {
        const item = itens[i];
        if (item.descricao.trim()) {
          if (item.descricao.trim().length < 3) {
            newErrors[`item_${i}_descricao`] = "Mínimo 3 caracteres";
          }
          if (item.quantidade <= 0) {
            newErrors[`item_${i}_quantidade`] = "Maior que 0";
          }
          if (item.valorUnitario < 0) {
            newErrors[`item_${i}_valor`] = "Não pode ser negativo";
          }
        }
      }
    } else {
      // Validação para orçamento completo
      if (!servicoId) {
        newErrors.servico = "Selecione um serviço";
      }

      const itensValidos = itensCompleto.filter((item) =>
        item.descricao.trim()
      );
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

    if (tipoOrcamento === "simples") {
      // Filtrar itens vazios para orçamento simples
      const itensValidos = itens
        .filter((item) => item.descricao.trim())
        .map((item) => ({
          ...item,
          unidade: item.unidade?.trim() || "Serv.",
          valorTotal: item.quantidade * item.valorUnitario,
        }));

      await onSave({
        tipo: "simples",
        clienteId,
        itens: itensValidos,
        observacoes: observacoes.trim() || undefined,
        consultor: consultor.trim() || undefined,
        contato: contato.trim() || undefined,
      });
    } else {
      // Filtrar itens vazios para orçamento completo e adicionar categoriaNome
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

      const servicoSelecionado = servicosAtivos?.find(
        (s) => s.id === servicoId
      );

      // Converter IDs das limitações para textos
      const limitacoesTextos = limitacoesSelecionadas
        .map((id) => limitacoesAtivas?.find((l) => l.id === id)?.texto)
        .filter((texto): texto is string => !!texto);

      await onSave({
        tipo: "completo",
        clienteId,
        servicoId,
        servicoDescricao: servicoSelecionado?.descricao,
        itensCompleto: itensValidosCompleto,
        limitacoesSelecionadas:
          limitacoesTextos.length > 0 ? limitacoesTextos : undefined,
        prazoExecucaoServicos,
        prazoVistoriaBombeiros,
        condicaoPagamento,
        parcelamentoTexto:
          condicaoPagamento === "parcelado"
            ? parcelamentoTexto.trim()
            : undefined,
        observacoes: observacoes.trim() || undefined,
        consultor: consultor.trim() || undefined,
        contato: contato.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        orcamento
          ? `Editar Orçamento #${orcamento.numero}`
          : duplicarDe
          ? `Duplicar Orçamento #${duplicarDe.numero}`
          : "Novo Orçamento"
      }
      size={tipoOrcamento === "completo" ? "xlarge" : "large"}
    >
      <Form ref={formRef} onSubmit={handleSubmit}>
        {/* Seleção de Cliente */}
        <InputGroup id="clienteSelect">
          <Label>Cliente *</Label>
          <ClienteSelect>
            <Select
              value={clienteId}
              onChange={(e) => handleClienteChange(e.target.value)}
              style={{ flex: 1 }}
              disabled={(!!orcamento && !duplicarDe) || mostrarNovoCliente}
            >
              <option value="">Selecione um cliente</option>
              {clientes?.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.razaoSocial}
                </option>
              ))}
            </Select>
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

        {/* Seletor de Tipo de Orçamento */}
        <InputGroup>
          <Label>Tipo de Orçamento *</Label>
          {isEdicao ? (
            <TipoLocked>
              Tipo:{" "}
              <strong>
                {tipoOrcamento === "simples"
                  ? "Orçamento Simples"
                  : "Orçamento Completo"}
              </strong>
              <span style={{ marginLeft: "8px", fontSize: "0.8rem" }}>
                (não pode ser alterado)
              </span>
            </TipoLocked>
          ) : (
            <TipoOrcamentoSelector>
              <TipoOption $selected={tipoOrcamento === "simples"}>
                <input
                  type="radio"
                  name="tipoOrcamento"
                  value="simples"
                  checked={tipoOrcamento === "simples"}
                  onChange={() => setTipoOrcamento("simples")}
                />
                <div className="tipo-info">
                  <div className="tipo-titulo">Orçamento Simples</div>
                  <div className="tipo-desc">
                    Lista de itens com valor unitário e total
                  </div>
                </div>
              </TipoOption>
              <TipoOption $selected={tipoOrcamento === "completo"}>
                <input
                  type="radio"
                  name="tipoOrcamento"
                  value="completo"
                  checked={tipoOrcamento === "completo"}
                  onChange={() => setTipoOrcamento("completo")}
                />
                <div className="tipo-info">
                  <div className="tipo-titulo">Orçamento Completo</div>
                  <div className="tipo-desc">
                    Itens categorizados com Mão de Obra e Material
                  </div>
                </div>
              </TipoOption>
            </TipoOrcamentoSelector>
          )}
        </InputGroup>

        {/* Formulário de Novo Cliente Inline */}
        {mostrarNovoCliente && (
          <NovoClienteForm
            onClienteCriado={handleClienteCriado}
            onCancelar={handleToggleNovoCliente}
          />
        )}

        {/* FORMULÁRIO PARA ORÇAMENTO SIMPLES */}
        {tipoOrcamento === "simples" && (
          <ItensSimples
            itens={itens}
            errors={errors}
            onItemChange={handleItemChange}
            onAddItem={addItem}
            onRemoveItem={removeItem}
          />
        )}

        {/* FORMULÁRIO PARA ORÇAMENTO COMPLETO */}
        {tipoOrcamento === "completo" && (
          <>
            <ServicoSection
              servicoId={servicoId}
              servicos={servicosAtivos}
              error={errors.servico}
              onServicoChange={setServicoId}
            />

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
            />

            <PrazosSection
              prazoExecucao={prazoExecucaoServicos}
              prazoVistoria={prazoVistoriaBombeiros}
              onPrazoExecucaoChange={setPrazoExecucaoServicos}
              onPrazoVistoriaChange={setPrazoVistoriaBombeiros}
            />

            <CondicaoPagamentoFormSection
              condicao={condicaoPagamento}
              parcelamentoTexto={parcelamentoTexto}
              onCondicaoChange={setCondicaoPagamento}
              onParcelamentoTextoChange={setParcelamentoTexto}
            />
          </>
        )}

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

        {tipoOrcamento === "simples" && (
          <InputGroup>
            <Label>Observações</Label>
            <TextArea
              placeholder="Observações adicionais, condições de pagamento, prazo de entrega..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </InputGroup>
        )}

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
