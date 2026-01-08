import { useState, useEffect, useMemo, useRef } from "react";
import {
  Limitacao,
  Servico,
  ConfiguracoesGerais,
  ParcelamentoDados,
  DescontoAVistaDados,
} from "../../../types";
import {
  Input,
  InputGroup,
  Label,
  Select,
  ErrorText,
  InputRow,
} from "../../ui";
import {
  CompletoSection,
  LimitacoesGrid,
  LimitacaoCheckbox,
  CondicaoPagamentoSection,
  CondicaoOption,
  ParcelamentoContainer,
  DescontoContainer,
  EntradaSelector,
  EntradaOption,
  ParcelamentoResumo,
  ParcelamentoDetalhe,
} from "./styles";

// Função para truncar texto longo em selects
const truncateText = (text: string, maxLength: number = 80): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

interface ServicoSectionProps {
  servicoId: string;
  servicos: Servico[] | undefined;
  error?: string;
  onServicoChange: (id: string) => void;
}

export function ServicoSection({
  servicoId,
  servicos,
  error,
  onServicoChange,
}: ServicoSectionProps) {
  return (
    <CompletoSection id="servicoSelect">
      <h4>Serviço</h4>
      <InputGroup>
        <Label>Selecione o Serviço *</Label>
        <Select
          value={servicoId}
          onChange={(e) => onServicoChange(e.target.value)}
          title={servicos?.find((s) => s.id === servicoId)?.descricao || ""}
        >
          <option value="">Selecione um serviço</option>
          {servicos?.map((servico) => (
            <option
              key={servico.id}
              value={servico.id}
              title={servico.descricao}
            >
              {truncateText(servico.descricao)}
            </option>
          ))}
        </Select>
        {error && <ErrorText>{error}</ErrorText>}
      </InputGroup>
    </CompletoSection>
  );
}

interface LimitacoesSectionProps {
  limitacoes: Limitacao[] | undefined;
  selecionadas: string[];
  onToggle: (id: string) => void;
  onToggleAll?: (ids: string[]) => void;
}

export function LimitacoesSection({
  limitacoes,
  selecionadas,
  onToggle,
  onToggleAll,
}: LimitacoesSectionProps) {
  const todosIds = limitacoes?.map((l) => l.id!) || [];
  const todosSelecionados =
    todosIds.length > 0 && todosIds.every((id) => selecionadas.includes(id));
  const algunsSelecionados = selecionadas.length > 0 && !todosSelecionados;

  const handleToggleAll = () => {
    if (onToggleAll) {
      if (todosSelecionados) {
        // Desseleciona todos
        onToggleAll([]);
      } else {
        // Seleciona todos
        onToggleAll(todosIds);
      }
    }
  };

  return (
    <CompletoSection>
      <h4
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Limitações do Escopo e Observações</span>
        {limitacoes && limitacoes.length > 0 && onToggleAll && (
          <button
            type="button"
            onClick={handleToggleAll}
            style={{
              background: "none",
              border: "1px solid var(--primary)",
              color: "var(--primary)",
              padding: "4px 12px",
              borderRadius: "4px",
              fontSize: "0.8rem",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {todosSelecionados
              ? "Desmarcar Todos"
              : algunsSelecionados
              ? "Selecionar Todos"
              : "Selecionar Todos"}
          </button>
        )}
      </h4>
      {limitacoes && limitacoes.length > 0 ? (
        <LimitacoesGrid>
          {limitacoes.map((limitacao) => (
            <LimitacaoCheckbox key={limitacao.id}>
              <input
                type="checkbox"
                checked={selecionadas.includes(limitacao.id!)}
                onChange={() => onToggle(limitacao.id!)}
              />
              <span>{limitacao.texto}</span>
            </LimitacaoCheckbox>
          ))}
        </LimitacoesGrid>
      ) : (
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Nenhuma limitação cadastrada. Configure em Configurações &gt;
          Limitações.
        </p>
      )}
    </CompletoSection>
  );
}

interface PrazosSectionProps {
  prazoExecucao: number;
  prazoVistoria: number | null;
  onPrazoExecucaoChange: (valor: number) => void;
  onPrazoVistoriaChange: (valor: number | null) => void;
}

export function PrazosSection({
  prazoExecucao,
  prazoVistoria,
  onPrazoExecucaoChange,
  onPrazoVistoriaChange,
}: PrazosSectionProps) {
  return (
    <CompletoSection>
      <h4>Prazos</h4>
      <InputRow>
        <InputGroup>
          <Label>Prazo de Execução dos Serviços (dias úteis)</Label>
          <Input
            type="number"
            min="1"
            value={prazoExecucao}
            onChange={(e) =>
              onPrazoExecucaoChange(parseInt(e.target.value) || 1)
            }
            style={{ maxWidth: "150px" }}
          />
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.8rem",
              marginTop: "4px",
            }}
          >
            Podendo ser intercalados
          </p>
        </InputGroup>
        <InputGroup>
          <Label>Prazo para Vistoria do Corpo de Bombeiros (dias)</Label>
          <Input
            type="number"
            min="1"
            value={prazoVistoria ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              onPrazoVistoriaChange(value === "" ? null : parseInt(value) || null);
            }}
            style={{ maxWidth: "150px" }}
            placeholder="Opcional"
          />
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.8rem",
              marginTop: "4px",
            }}
          >
            Após gerado o protocolo (deixe vazio para não exibir)
          </p>
        </InputGroup>
      </InputRow>
    </CompletoSection>
  );
}

// Opções de entrada disponíveis
const ENTRADA_OPTIONS = [10, 15, 20, 25, 30, 35, 40, 45, 50];

// Função para formatar moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Interface para informações de parcela calculada
interface ParcelaInfo {
  numero: number;
  valorParcela: number;
  temJuros: boolean;
  taxaJuros: number;
  valorTotal: number;
  disabled: boolean;
  motivoDisabled?: string;
}

interface CondicaoPagamentoSectionProps {
  condicao: "a_vista" | "a_combinar" | "parcelado";
  parcelamentoTexto: string;
  parcelamentoDados?: ParcelamentoDados;
  descontoAVista?: DescontoAVistaDados;
  onCondicaoChange: (condicao: "a_vista" | "a_combinar" | "parcelado") => void;
  onParcelamentoTextoChange: (texto: string) => void;
  onParcelamentoDadosChange: (dados: ParcelamentoDados | undefined) => void;
  onDescontoAVistaChange: (dados: DescontoAVistaDados | undefined) => void;
  valorTotal: number;
  configuracoes?: ConfiguracoesGerais;
}

export function CondicaoPagamentoFormSection({
  condicao,
  parcelamentoTexto,
  parcelamentoDados,
  descontoAVista,
  onCondicaoChange,
  onParcelamentoTextoChange,
  onParcelamentoDadosChange,
  onDescontoAVistaChange,
  valorTotal,
  configuracoes,
}: CondicaoPagamentoSectionProps) {
  // Ref para controlar se já foi inicializado com os dados do pai
  const isInitialized = useRef(false);

  // Inicializa com o valor salvo ou 20% como padrão
  const [entradaPercent, setEntradaPercent] = useState<number>(
    parcelamentoDados?.entradaPercent ?? 20
  );

  // Estado para as parcelas selecionadas (quais aparecem no PDF)
  // Por padrão, nenhuma selecionada significa mostrar 1x e 2x apenas
  const [parcelasSelecionadas, setParcelasSelecionadas] = useState<number[]>(
    parcelamentoDados?.parcelasSelecionadas ?? []
  );

  // Estado para o percentual de desconto à vista - controlado localmente
  // Usamos uma ref para armazenar o último valor recebido do pai para detectar mudanças externas
  const lastExternalPercentual = useRef<number | undefined>(descontoAVista?.percentual);
  const [descontoPercent, setDescontoPercent] = useState<number>(
    descontoAVista?.percentual ?? 0
  );

  // Atualiza o estado quando parcelamentoDados mudar (ex: ao abrir modal de edição)
  // Só sincroniza uma vez na inicialização, depois o estado local é controlado pelo usuário
  useEffect(() => {
    const externalEntrada = parcelamentoDados?.entradaPercent;
    const externalParcelas = parcelamentoDados?.parcelasSelecionadas;
    if (!isInitialized.current && externalEntrada !== undefined) {
      isInitialized.current = true;
      setEntradaPercent(externalEntrada);
      if (externalParcelas !== undefined) {
        setParcelasSelecionadas(externalParcelas);
      }
    }
  }, [parcelamentoDados?.entradaPercent, parcelamentoDados?.parcelasSelecionadas]);

  // Sincroniza o descontoPercent quando descontoAVista muda externamente (edição/duplicação)
  // Só atualiza se o valor vier do pai (detectado pela mudança no percentual externo)
  useEffect(() => {
    const externalPercentual = descontoAVista?.percentual;
    // Só atualiza se o valor externo mudou (não por causa de nossa própria atualização)
    if (lastExternalPercentual.current !== externalPercentual) {
      lastExternalPercentual.current = externalPercentual;
      setDescontoPercent(externalPercentual ?? 0);
    }
  }, [descontoAVista?.percentual]);

  // Configurações de parcelamento
  const maxParcelas = configuracoes?.parcelamentoMaxParcelas ?? 6;
  const valorMinimoParcela = configuracoes?.parcelamentoValorMinimo ?? 1000;
  const jurosAPartirDe = configuracoes?.parcelamentoJurosAPartirDe ?? 3;
  const taxaJuros = configuracoes?.parcelamentoTaxaJuros ?? 2.5;

  // Calcular valor da entrada
  const valorEntrada = useMemo(() => {
    return (valorTotal * entradaPercent) / 100;
  }, [valorTotal, entradaPercent]);

  // Calcular valor restante após entrada
  const valorRestante = useMemo(() => {
    return valorTotal - valorEntrada;
  }, [valorTotal, valorEntrada]);

  // Calcular informações de cada parcela (de 2x até maxParcelas)
  const parcelasInfo = useMemo((): ParcelaInfo[] => {
    const parcelas: ParcelaInfo[] = [];

    for (let i = 1; i <= maxParcelas; i++) {
      const temJuros = i >= jurosAPartirDe;
      const taxaAplicada = temJuros ? taxaJuros : 0;

      // Calcular valor com juros (se aplicável)
      let valorComJuros = valorRestante;
      if (temJuros) {
        // Juros simples por parcela após o limite
        const parcelasComJuros = i - jurosAPartirDe + 1;
        valorComJuros =
          valorRestante * (1 + (taxaAplicada / 100) * parcelasComJuros);
      }

      const valorParcela = valorComJuros / i;
      const disabled = valorParcela < valorMinimoParcela;

      parcelas.push({
        numero: i,
        valorParcela,
        temJuros,
        taxaJuros: taxaAplicada,
        valorTotal: valorComJuros,
        disabled,
        motivoDisabled: disabled
          ? `Valor mínimo: ${formatCurrency(valorMinimoParcela)}`
          : undefined,
      });
    }

    return parcelas;
  }, [
    valorRestante,
    maxParcelas,
    jurosAPartirDe,
    taxaJuros,
    valorMinimoParcela,
  ]);

  // Calcular valor do desconto à vista
  const valorDesconto = useMemo(() => {
    return (valorTotal * descontoPercent) / 100;
  }, [valorTotal, descontoPercent]);

  // Calcular valor final com desconto
  const valorFinalComDesconto = useMemo(() => {
    return valorTotal - valorDesconto;
  }, [valorTotal, valorDesconto]);

  // Gerar dados de desconto à vista
  // Usamos uma ref para evitar chamar onDescontoAVistaChange desnecessariamente
  // e causar loops de atualização
  const lastDescontoSent = useRef<string | null>(null);

  useEffect(() => {
    // Criar uma chave única para o estado atual
    const currentKey = condicao === "a_vista" && descontoPercent > 0
      ? `${descontoPercent}-${valorDesconto}-${valorFinalComDesconto}`
      : "none";

    // Só atualiza se o valor mudou
    if (lastDescontoSent.current !== currentKey) {
      lastDescontoSent.current = currentKey;

      if (condicao === "a_vista" && descontoPercent > 0) {
        // Atualiza a ref para evitar que o useEffect de sincronização
        // pense que o valor veio de fora e tente resetar
        lastExternalPercentual.current = descontoPercent;
        onDescontoAVistaChange({
          percentual: descontoPercent,
          valorDesconto,
          valorFinal: valorFinalComDesconto,
        });
      } else {
        // Atualiza a ref para undefined quando não há desconto
        lastExternalPercentual.current = undefined;
        onDescontoAVistaChange(undefined);
      }
    }
  }, [condicao, descontoPercent, valorDesconto, valorFinalComDesconto, onDescontoAVistaChange]);

  // Função para alternar seleção de parcela
  const toggleParcelaSelecionada = (numero: number) => {
    setParcelasSelecionadas((prev) => {
      if (prev.includes(numero)) {
        return prev.filter((n) => n !== numero);
      } else {
        return [...prev, numero].sort((a, b) => a - b);
      }
    });
  };

  // Gerar texto e dados de parcelamento para o PDF (entrada + info sobre parcelas)
  useEffect(() => {
    if (condicao === "parcelado") {
      // Gerar texto com entrada e informações sobre as parcelas disponíveis
      const parcelasDisponiveis = parcelasInfo.filter((p) => !p.disabled);

      let texto = `Entrada de ${entradaPercent}% (${formatCurrency(
        valorEntrada
      )})`;

      if (parcelasDisponiveis.length > 0) {
        const maxParcelasDisp =
          parcelasDisponiveis[parcelasDisponiveis.length - 1].numero;
        texto += ` + restante em até ${maxParcelasDisp}x`;

        // Verificar se há parcelas com juros
        const parcelasComJuros = parcelasDisponiveis.filter((p) => p.temJuros);
        if (parcelasComJuros.length > 0) {
          texto += ` (juros de ${taxaJuros}% a.p. a partir de ${jurosAPartirDe}x)`;
        }
      } else {
        texto += ` + restante em parcela única para 30 dias`;
      }

      onParcelamentoTextoChange(texto);

      // Gerar dados estruturados para o PDF
      // Incluir todas as parcelas para permitir seleção manual das que estão abaixo do mínimo
      const parcelamentoDados: ParcelamentoDados = {
        entradaPercent,
        valorEntrada,
        valorRestante,
        // Envia todas as parcelas, mas o PDF filtrará baseado em parcelasSelecionadas ou parcelasDisponiveis
        opcoes: parcelasInfo.map((p) => ({
          numeroParcelas: p.numero,
          valorParcela: p.valorParcela,
          valorTotal: valorEntrada + p.valorTotal,
          temJuros: p.temJuros,
          taxaJuros: p.taxaJuros,
          abaixoDoMinimo: p.disabled, // Marca quais estão abaixo do mínimo
        })),
        parcelasSelecionadas: parcelasSelecionadas.length > 0 ? parcelasSelecionadas : undefined,
      };
      onParcelamentoDadosChange(parcelamentoDados);
    } else {
      // Se não for parcelado, limpar os dados
      onParcelamentoDadosChange(undefined);
    }
  }, [
    condicao,
    entradaPercent,
    valorEntrada,
    valorRestante,
    parcelasInfo,
    parcelasSelecionadas,
    taxaJuros,
    jurosAPartirDe,
    onParcelamentoTextoChange,
    onParcelamentoDadosChange,
  ]);

  return (
    <CompletoSection>
      <h4> Preços e Condições de Pagamento</h4>
      <CondicaoPagamentoSection>
        <CondicaoOption $selected={condicao === "a_vista"}>
          <input
            type="radio"
            name="condicaoPagamento"
            checked={condicao === "a_vista"}
            onChange={() => onCondicaoChange("a_vista")}
          />
          <span>À vista</span>
        </CondicaoOption>

        {condicao === "a_vista" && (
          <DescontoContainer>
            <div className="label">Desconto para pagamento à vista (opcional)</div>
            <div className="input-row">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={descontoPercent || ""}
                placeholder="0"
                onChange={(e) => {
                  const valor = parseFloat(e.target.value) || 0;
                  const novoPercentual = Math.min(100, Math.max(0, valor));
                  setDescontoPercent(novoPercentual);

                  // Atualiza o estado pai diretamente para garantir que o valor esteja disponível no submit
                  if (novoPercentual > 0) {
                    const novoDesconto = (valorTotal * novoPercentual) / 100;
                    const novoValorFinal = valorTotal - novoDesconto;
                    // Atualiza as refs para evitar que o useEffect tente atualizar novamente
                    lastExternalPercentual.current = novoPercentual;
                    lastDescontoSent.current = `${novoPercentual}-${novoDesconto}-${novoValorFinal}`;
                    onDescontoAVistaChange({
                      percentual: novoPercentual,
                      valorDesconto: novoDesconto,
                      valorFinal: novoValorFinal,
                    });
                  } else {
                    lastExternalPercentual.current = undefined;
                    lastDescontoSent.current = "none";
                    onDescontoAVistaChange(undefined);
                  }
                }}
              />
              <span>% de desconto</span>
            </div>
            {descontoPercent > 0 && (
              <div className="desconto-resumo">
                <div className="desconto-detalhe">
                  <span className="label">Valor original:</span>
                  <span className="valor">{formatCurrency(valorTotal)}</span>
                </div>
                <div className="desconto-detalhe">
                  <span className="label">Desconto ({descontoPercent}%):</span>
                  <span className="valor">- {formatCurrency(valorDesconto)}</span>
                </div>
                <div className="desconto-detalhe">
                  <span className="label">Valor final à vista:</span>
                  <span className="valor">{formatCurrency(valorFinalComDesconto)}</span>
                </div>
              </div>
            )}
          </DescontoContainer>
        )}

        <CondicaoOption $selected={condicao === "a_combinar"}>
          <input
            type="radio"
            name="condicaoPagamento"
            checked={condicao === "a_combinar"}
            onChange={() => onCondicaoChange("a_combinar")}
          />
          <span>A combinar</span>
        </CondicaoOption>
        <CondicaoOption $selected={condicao === "parcelado"}>
          <input
            type="radio"
            name="condicaoPagamento"
            checked={condicao === "parcelado"}
            onChange={() => onCondicaoChange("parcelado")}
          />
          <span>Parcelado</span>
        </CondicaoOption>

        {condicao === "parcelado" && (
          <ParcelamentoContainer>
            {/* Seletor de Entrada */}
            <EntradaSelector>
              <div className="label">Entrada</div>
              <div className="options">
                {ENTRADA_OPTIONS.map((percent) => (
                  <EntradaOption
                    key={percent}
                    type="button"
                    $selected={entradaPercent === percent}
                    onClick={() => setEntradaPercent(percent)}
                  >
                    {percent}%
                  </EntradaOption>
                ))}
              </div>
            </EntradaSelector>

            {/* Resumo com todas as opções de parcelamento */}
            <ParcelamentoResumo>
              <div className="titulo">
                Opções de Parcelamento (aparecerão no PDF)
              </div>
              <div className="detalhes">
                <ParcelamentoDetalhe>
                  <span className="label">Entrada ({entradaPercent}%)</span>
                  <span className="valor">{formatCurrency(valorEntrada)}</span>
                </ParcelamentoDetalhe>
                <ParcelamentoDetalhe style={{ marginTop: 8, marginBottom: 4 }}>
                  <span className="label" style={{ fontWeight: 500 }}>
                    Restante de {formatCurrency(valorRestante)} em:
                  </span>
                </ParcelamentoDetalhe>
                {parcelasInfo.map((parcela) => (
                  <ParcelamentoDetalhe
                    key={parcela.numero}
                    className={parcela.disabled ? "disabled" : ""}
                    style={{
                      opacity: parcela.disabled ? 0.6 : 1,
                      paddingLeft: 16,
                      cursor: "pointer",
                    }}
                    title={parcela.motivoDisabled}
                    onClick={() => toggleParcelaSelecionada(parcela.numero)}
                  >
                    <span className="label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={parcelasSelecionadas.includes(parcela.numero)}
                        onChange={() => toggleParcelaSelecionada(parcela.numero)}
                        style={{
                          width: 16,
                          height: 16,
                          accentColor: "var(--primary)",
                          cursor: "pointer",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {parcela.numero}x de{" "}
                      {formatCurrency(parcela.valorParcela)}
                      {parcela.temJuros && (
                        <span
                          style={{
                            color: "var(--warning)",
                            marginLeft: 8,
                            fontSize: "0.8rem",
                          }}
                        >
                          (+{parcela.taxaJuros}% juros)
                        </span>
                      )}
                      {parcela.disabled && (
                        <span
                          style={{
                            color: "var(--error)",
                            marginLeft: 8,
                            fontSize: "0.75rem",
                          }}
                        >
                          (abaixo do mínimo)
                        </span>
                      )}
                    </span>
                    <span className="valor">
                      Total: {formatCurrency(valorEntrada + parcela.valorTotal)}
                    </span>
                  </ParcelamentoDetalhe>
                ))}
              </div>
            </ParcelamentoResumo>

            {/* Campo de texto (oculto mas mantido para compatibilidade) */}
            <input type="hidden" value={parcelamentoTexto} />
          </ParcelamentoContainer>
        )}
      </CondicaoPagamentoSection>
    </CompletoSection>
  );
}
