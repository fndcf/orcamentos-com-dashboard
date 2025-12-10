import { useState, useEffect, useMemo } from "react";
import {
  Limitacao,
  Servico,
  ConfiguracoesGerais,
  ParcelamentoDados,
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
  prazoVistoria: number;
  onPrazoExecucaoChange: (valor: number) => void;
  onPrazoVistoriaChange: (valor: number) => void;
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
            value={prazoVistoria}
            onChange={(e) =>
              onPrazoVistoriaChange(parseInt(e.target.value) || 1)
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
            Após gerado o protocolo
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
  condicao: "a_combinar" | "parcelado";
  parcelamentoTexto: string;
  onCondicaoChange: (condicao: "a_combinar" | "parcelado") => void;
  onParcelamentoTextoChange: (texto: string) => void;
  onParcelamentoDadosChange: (dados: ParcelamentoDados | undefined) => void;
  valorTotal: number;
  configuracoes?: ConfiguracoesGerais;
}

export function CondicaoPagamentoFormSection({
  condicao,
  parcelamentoTexto,
  onCondicaoChange,
  onParcelamentoTextoChange,
  onParcelamentoDadosChange,
  valorTotal,
  configuracoes,
}: CondicaoPagamentoSectionProps) {
  const [entradaPercent, setEntradaPercent] = useState<number>(20);

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

    for (let i = 2; i <= maxParcelas; i++) {
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
      const parcelamentoDados: ParcelamentoDados = {
        entradaPercent,
        valorEntrada,
        valorRestante,
        opcoes: parcelasDisponiveis.map((p) => ({
          numeroParcelas: p.numero,
          valorParcela: p.valorParcela,
          valorTotal: valorEntrada + p.valorTotal,
          temJuros: p.temJuros,
          taxaJuros: p.taxaJuros,
        })),
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
    taxaJuros,
    jurosAPartirDe,
    onParcelamentoTextoChange,
    onParcelamentoDadosChange,
  ]);

  return (
    <CompletoSection>
      <h4> Preços e Condições de Pagamento</h4>
      <CondicaoPagamentoSection>
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
                      opacity: parcela.disabled ? 0.5 : 1,
                      paddingLeft: 16,
                    }}
                    title={parcela.motivoDisabled}
                  >
                    <span className="label">
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
