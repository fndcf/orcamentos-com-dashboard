import { useState, useEffect, useRef, useMemo } from "react";
import {
  Orcamento,
  OrcamentoItemCompleto,
  Cliente,
  OrcamentoSaveData,
  ParcelamentoDados,
} from "../../../types";
import { useClientes } from "../../../hooks/useClientes";
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
  Select,
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
  const { data: clientes, refetch: refetchClientes } = useClientes();
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
  const [prazoVistoriaBombeiros, setPrazoVistoriaBombeiros] = useState(30);
  const [condicaoPagamento, setCondicaoPagamento] = useState<
    "a_vista" | "a_combinar" | "parcelado"
  >("a_combinar");
  const [parcelamentoTexto, setParcelamentoTexto] = useState("");
  const [parcelamentoDados, setParcelamentoDados] = useState<
    ParcelamentoDados | undefined
  >(undefined);
  const [mostrarValoresDetalhados, setMostrarValoresDetalhados] =
    useState(true);

  // Estados comuns
  const [observacoes, setObservacoes] = useState("");
  const [consultor, setConsultor] = useState("");
  const [contato, setContato] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado para novo cliente inline
  const [mostrarNovoCliente, setMostrarNovoCliente] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (orcamento) {
        // Editando orçamento existente
        setClienteId(orcamento.clienteId);
        setObservacoes(orcamento.observacoes || "");
        setConsultor(orcamento.consultor || "");
        setContato(orcamento.contato || "");

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
        setPrazoVistoriaBombeiros(orcamento.prazoVistoriaBombeiros || 30);
        setCondicaoPagamento(orcamento.condicaoPagamento || "a_combinar");
        setParcelamentoTexto(orcamento.parcelamentoTexto || "");
        setParcelamentoDados(orcamento.parcelamentoDados);
        setMostrarValoresDetalhados(
          orcamento.mostrarValoresDetalhados !== false
        );

        // Buscar cliente selecionado
        const cliente = clientes?.find((c) => c.id === orcamento.clienteId);
        setClienteSelecionado(cliente || null);
        setMostrarNovoCliente(false);
      } else if (duplicarDe) {
        // Duplicando orçamento - pré-preenche mas permite alterar cliente
        setClienteId(duplicarDe.clienteId);
        setObservacoes(duplicarDe.observacoes || "");
        setConsultor(duplicarDe.consultor || "");
        setContato(duplicarDe.contato || "");

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
        setPrazoVistoriaBombeiros(duplicarDe.prazoVistoriaBombeiros || 30);
        setCondicaoPagamento(duplicarDe.condicaoPagamento || "a_combinar");
        setParcelamentoTexto(duplicarDe.parcelamentoTexto || "");
        setParcelamentoDados(duplicarDe.parcelamentoDados);
        setMostrarValoresDetalhados(
          duplicarDe.mostrarValoresDetalhados !== false
        );

        // Buscar cliente selecionado
        const cliente = clientes?.find((c) => c.id === duplicarDe.clienteId);
        setClienteSelecionado(cliente || null);
        setMostrarNovoCliente(false);
      } else {
        // Novo orçamento
        setClienteId("");
        setClienteSelecionado(null);
        setServicoId("");
        setItensCompleto([{ ...emptyItemCompleto }]);
        setLimitacoesSelecionadas([]);
        setPrazoExecucaoServicos(20);
        setPrazoVistoriaBombeiros(30);
        setCondicaoPagamento("a_combinar");
        setParcelamentoTexto("");
        setParcelamentoDados(undefined);
        setMostrarValoresDetalhados(true);
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
      parcelamentoDados:
        condicaoPagamento === "parcelado" ? parcelamentoDados : undefined,
      mostrarValoresDetalhados,
      observacoes: observacoes.trim() || undefined,
      // Envia string vazia para permitir limpar os campos ao editar
      consultor: consultor.trim(),
      contato: contato.trim(),
    });

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
      size="xlarge"
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
          onCondicaoChange={setCondicaoPagamento}
          onParcelamentoTextoChange={setParcelamentoTexto}
          onParcelamentoDadosChange={setParcelamentoDados}
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
