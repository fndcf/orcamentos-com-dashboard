import { useRef, useEffect, useState } from "react";
import {
  OrcamentoItem,
  CategoriaItem,
  ItemServico,
} from "../../../types";
import { useItensServicoAtivosPorCategoria } from "../../../hooks/useItensServico";
import { formatCurrency } from "../../../utils/constants";
import { Button, Input, InputGroup, Label, Select, ErrorText } from "../../ui";
import {
  ItensSection,
  SectionTitle,
  ItemCompletoContainer,
  ItemCompletoRow1,
  ItemCompletoRow2,
  RemoveItemButton,
  TotalSection,
  DescricaoAutocompleteContainer,
  DescricaoInputWrapper,
  DescricaoDropdownButton,
  DescricaoDropdown,
  DescricaoOption,
  DescricaoEmptyMessage,
} from "./styles";

interface ItensSimplesProps {
  itens: OrcamentoItem[];
  categorias: CategoriaItem[] | undefined;
  errors: Record<string, string>;
  onItemChange: (
    index: number,
    field: keyof OrcamentoItem,
    value: string | number
  ) => void;
  onItemMultiChange?: (
    index: number,
    changes: Partial<OrcamentoItem>
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

export function ItensSimples({
  itens,
  categorias,
  errors,
  onItemChange,
  onItemMultiChange,
  onAddItem,
  onRemoveItem,
}: ItensSimplesProps) {
  const [descricaoDropdownOpen, setDescricaoDropdownOpen] = useState<
    number | null
  >(null);
  const [categoriaParaBuscarItens, setCategoriaParaBuscarItens] = useState<
    string | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Busca itens pré-definidos da categoria selecionada
  const { data: itensPredefinidos } = useItensServicoAtivosPorCategoria(
    categoriaParaBuscarItens || undefined
  );

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDescricaoDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenDescricaoDropdown = (index: number, categoriaId: string) => {
    if (categoriaId) {
      setCategoriaParaBuscarItens(categoriaId);
      setDescricaoDropdownOpen(descricaoDropdownOpen === index ? null : index);
    }
  };

  // Calcula o valor unitário total do item pré-definido
  // Se tiver ambos (material e mão de obra), soma os dois
  // Se tiver apenas um, usa esse valor
  const calcularValorUnitarioItem = (item: ItemServico): number => {
    const valorMaterial = item.valorUnitario || 0;
    const valorMaoDeObra = item.valorMaoDeObraUnitario || 0;
    return valorMaterial + valorMaoDeObra;
  };

  const handleSelectItemPredefinido = (index: number, item: ItemServico) => {
    const valorUnitarioCalculado = calcularValorUnitarioItem(item);

    // Usar onItemMultiChange se disponível para atualizar múltiplos campos de uma vez
    if (onItemMultiChange) {
      onItemMultiChange(index, {
        descricao: item.descricao,
        unidade: item.unidade,
        valorUnitario: valorUnitarioCalculado,
      });
    } else {
      // Fallback para compatibilidade
      onItemChange(index, "descricao", item.descricao);
      onItemChange(index, "unidade", item.unidade);
      onItemChange(index, "valorUnitario", valorUnitarioCalculado);
    }
    setDescricaoDropdownOpen(null);
  };

  const calcularTotal = () => {
    return itens.reduce((acc, item) => acc + (item.valorTotal || 0), 0);
  };

  return (
    <ItensSection id="itensSection">
      <SectionTitle>
        Itens do Orçamento
        <Button type="button" $size="small" onClick={onAddItem}>
          + Adicionar Item
        </Button>
      </SectionTitle>

      {errors.itens && <ErrorText>{errors.itens}</ErrorText>}

      {itens.map((item, index) => (
        <ItemCompletoContainer key={index} data-item-index={index}>
          <RemoveItemButton
            type="button"
            onClick={() => onRemoveItem(index)}
            disabled={itens.length === 1}
            title="Remover item"
          >
            ×
          </RemoveItemButton>

          {/* Linha 1: Categoria, Descrição */}
          <ItemCompletoRow1 style={{ gridTemplateColumns: '180px 1fr' }}>
            <InputGroup>
              <Label>Categoria</Label>
              <Select
                value={item.categoriaId || ""}
                onChange={(e) =>
                  onItemChange(index, "categoriaId", e.target.value)
                }
              >
                <option value="">Selecione (opcional)</option>
                {categorias?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </Select>
            </InputGroup>

            <InputGroup>
              <Label>Descrição</Label>
              <DescricaoAutocompleteContainer
                ref={descricaoDropdownOpen === index ? dropdownRef : null}
              >
                <DescricaoInputWrapper>
                  <Input
                    placeholder="Descrição do item/serviço"
                    value={item.descricao}
                    onChange={(e) =>
                      onItemChange(index, "descricao", e.target.value)
                    }
                    style={{ flex: 1 }}
                  />
                  <DescricaoDropdownButton
                    type="button"
                    onClick={() =>
                      handleOpenDescricaoDropdown(index, item.categoriaId || "")
                    }
                    title={
                      item.categoriaId
                        ? "Ver itens pré-definidos"
                        : "Selecione uma categoria primeiro"
                    }
                    disabled={!item.categoriaId}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </DescricaoDropdownButton>
                </DescricaoInputWrapper>

                {descricaoDropdownOpen === index && item.categoriaId && (
                  <DescricaoDropdown>
                    {itensPredefinidos && itensPredefinidos.length > 0 ? (
                      itensPredefinidos.map((itemPred) => (
                        <DescricaoOption
                          key={itemPred.id}
                          onClick={() =>
                            handleSelectItemPredefinido(index, itemPred)
                          }
                        >
                          <div className="descricao">{itemPred.descricao}</div>
                          <div className="unidade">
                            Unidade: {itemPred.unidade}
                            {calcularValorUnitarioItem(itemPred) > 0 && (
                              <span style={{ marginLeft: 8, color: 'var(--primary)' }}>
                                | Valor: {formatCurrency(calcularValorUnitarioItem(itemPred))}
                              </span>
                            )}
                          </div>
                        </DescricaoOption>
                      ))
                    ) : (
                      <DescricaoEmptyMessage>
                        Nenhum item pré-definido nesta categoria.
                        <br />
                        <small>
                          Configure em Configurações &gt; Categorias
                        </small>
                      </DescricaoEmptyMessage>
                    )}
                  </DescricaoDropdown>
                )}
              </DescricaoAutocompleteContainer>
              {errors[`item_${index}_descricao`] && (
                <ErrorText>{errors[`item_${index}_descricao`]}</ErrorText>
              )}
            </InputGroup>
          </ItemCompletoRow1>

          {/* Linha 2: Qtd, Unidade, Valor Unit., Total */}
          <ItemCompletoRow2 style={{ gridTemplateColumns: '80px 100px 1fr 1fr' }}>
            <InputGroup>
              <Label>Qtd</Label>
              <Input
                type="number"
                min="1"
                value={item.quantidade}
                onChange={(e) =>
                  onItemChange(
                    index,
                    "quantidade",
                    parseFloat(e.target.value) || 0
                  )
                }
              />
              {errors[`item_${index}_quantidade`] && (
                <ErrorText>{errors[`item_${index}_quantidade`]}</ErrorText>
              )}
            </InputGroup>

            <InputGroup>
              <Label>Unidade</Label>
              <Input
                placeholder="Serv."
                value={item.unidade}
                onChange={(e) => onItemChange(index, "unidade", e.target.value)}
              />
            </InputGroup>

            <InputGroup>
              <Label>Valor Unit.</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.valorUnitario}
                onChange={(e) =>
                  onItemChange(
                    index,
                    "valorUnitario",
                    parseFloat(e.target.value) || 0
                  )
                }
              />
              {errors[`item_${index}_valor`] && (
                <ErrorText>{errors[`item_${index}_valor`]}</ErrorText>
              )}
            </InputGroup>

            <InputGroup>
              <Label>Total</Label>
              <Input
                value={formatCurrency(item.quantidade * item.valorUnitario)}
                disabled
              />
            </InputGroup>
          </ItemCompletoRow2>
        </ItemCompletoContainer>
      ))}

      <TotalSection>
        <span className="total-label">Total do Orçamento:</span>
        <span className="total-value">{formatCurrency(calcularTotal())}</span>
      </TotalSection>
    </ItensSection>
  );
}
