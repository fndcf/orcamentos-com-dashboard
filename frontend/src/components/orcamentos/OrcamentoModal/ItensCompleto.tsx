import { useRef, useEffect, useState } from "react";
import {
  OrcamentoItemCompleto,
  CategoriaItem,
  EtapaTipo,
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
  TotaisCompleto,
  DescricaoAutocompleteContainer,
  DescricaoInputWrapper,
  DescricaoDropdownButton,
  DescricaoDropdown,
  DescricaoOption,
  DescricaoEmptyMessage,
} from "./styles";

interface ItensCompletoProps {
  itens: OrcamentoItemCompleto[];
  categorias: CategoriaItem[] | undefined;
  errors: Record<string, string>;
  onItemChange: (
    index: number,
    field: keyof OrcamentoItemCompleto,
    value: string | number
  ) => void;
  onItemMultiChange?: (
    index: number,
    changes: Partial<OrcamentoItemCompleto>
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

export function ItensCompleto({
  itens,
  categorias,
  errors,
  onItemChange,
  onItemMultiChange,
  onAddItem,
  onRemoveItem,
}: ItensCompletoProps) {
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

  const handleSelectItemPredefinido = (index: number, item: ItemServico) => {
    // Usar onItemMultiChange se disponível para atualizar múltiplos campos de uma vez
    if (onItemMultiChange) {
      onItemMultiChange(index, {
        descricao: item.descricao,
        unidade: item.unidade,
      });
    } else {
      // Fallback para compatibilidade
      onItemChange(index, "descricao", item.descricao);
      onItemChange(index, "unidade", item.unidade);
    }
    setDescricaoDropdownOpen(null);
  };

  const calcularTotais = () => {
    const totalMaoDeObra = itens.reduce(
      (acc, item) => acc + (item.valorTotalMaoDeObra || 0),
      0
    );
    const totalMaterial = itens.reduce(
      (acc, item) => acc + (item.valorTotalMaterial || 0),
      0
    );
    const total = totalMaoDeObra + totalMaterial;
    return { totalMaoDeObra, totalMaterial, total };
  };

  const totais = calcularTotais();

  return (
    <ItensSection id="itensCompletoSection">
      <SectionTitle>
        Itens do Orçamento (com Mão de Obra e Material)
        <Button type="button" $size="small" onClick={onAddItem}>
          + Adicionar Item
        </Button>
      </SectionTitle>

      {errors.itensCompleto && <ErrorText>{errors.itensCompleto}</ErrorText>}

      {itens.map((item, index) => (
        <ItemCompletoContainer key={index} data-itemc-index={index}>
          <RemoveItemButton
            type="button"
            onClick={() => onRemoveItem(index)}
            disabled={itens.length === 1}
            title="Remover item"
          >
            ×
          </RemoveItemButton>

          {/* Linha 1: Etapa, Categoria, Descrição */}
          <ItemCompletoRow1>
            <InputGroup>
              <Label>Etapa</Label>
              <Select
                value={item.etapa}
                onChange={(e) =>
                  onItemChange(index, "etapa", e.target.value as EtapaTipo)
                }
              >
                <option value="residencial">Residencial</option>
                <option value="comercial">Comercial</option>
              </Select>
            </InputGroup>

            <InputGroup>
              <Label>Categoria</Label>
              <Select
                value={item.categoriaId}
                onChange={(e) =>
                  onItemChange(index, "categoriaId", e.target.value)
                }
              >
                <option value="">Selecione</option>
                {categorias?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </Select>
              {errors[`itemc_${index}_categoria`] && (
                <ErrorText>{errors[`itemc_${index}_categoria`]}</ErrorText>
              )}
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
                      handleOpenDescricaoDropdown(index, item.categoriaId)
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
              {errors[`itemc_${index}_descricao`] && (
                <ErrorText>{errors[`itemc_${index}_descricao`]}</ErrorText>
              )}
            </InputGroup>
          </ItemCompletoRow1>

          {/* Linha 2: Qtd, Unidade, M.O. Unit, Material Unit, Total M.O., Total Mat. */}
          <ItemCompletoRow2>
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
              {errors[`itemc_${index}_quantidade`] && (
                <ErrorText>{errors[`itemc_${index}_quantidade`]}</ErrorText>
              )}
            </InputGroup>

            <InputGroup>
              <Label>Unidade</Label>
              <Input
                placeholder="un"
                value={item.unidade}
                onChange={(e) => onItemChange(index, "unidade", e.target.value)}
              />
            </InputGroup>

            <InputGroup>
              <Label>M.O. Unit.</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.valorUnitarioMaoDeObra}
                onChange={(e) =>
                  onItemChange(
                    index,
                    "valorUnitarioMaoDeObra",
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </InputGroup>

            <InputGroup>
              <Label>Mat. Unit.</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.valorUnitarioMaterial}
                onChange={(e) =>
                  onItemChange(
                    index,
                    "valorUnitarioMaterial",
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </InputGroup>

            <InputGroup>
              <Label>Total M.O.</Label>
              <Input
                value={formatCurrency(item.valorTotalMaoDeObra || 0)}
                disabled
              />
            </InputGroup>

            <InputGroup>
              <Label>Total Mat.</Label>
              <Input
                value={formatCurrency(item.valorTotalMaterial || 0)}
                disabled
              />
            </InputGroup>
          </ItemCompletoRow2>
        </ItemCompletoContainer>
      ))}

      <TotaisCompleto>
        <div className="total-item">
          <div className="label">Total Mão de Obra</div>
          <div className="value">{formatCurrency(totais.totalMaoDeObra)}</div>
        </div>
        <div className="total-item">
          <div className="label">Total Material</div>
          <div className="value">{formatCurrency(totais.totalMaterial)}</div>
        </div>
        <div className="total-item">
          <div className="label">Total Geral</div>
          <div className="value destaque">{formatCurrency(totais.total)}</div>
        </div>
      </TotaisCompleto>
    </ItensSection>
  );
}
