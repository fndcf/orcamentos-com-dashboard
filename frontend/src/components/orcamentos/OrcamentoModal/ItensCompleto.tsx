import { useRef, useEffect, useState, useCallback } from "react";
import {
  OrcamentoItemCompleto,
  CategoriaItem,
  EtapaTipo,
  ItemServico,
} from "../../../types";
import { useInfiniteItensServicoAtivos } from "../../../hooks/useItensServico";
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
  DescricaoSearchInput,
  DescricaoLoadingMore,
  DescricaoTotal,
  AddItemButtonContainer,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownListRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Categoria do item com dropdown aberto
  const categoriaAtiva = descricaoDropdownOpen !== null
    ? itens[descricaoDropdownOpen]?.categoriaId
    : undefined;

  // Hook de paginação infinita
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteItensServicoAtivos(categoriaAtiva, debouncedSearch, 10);

  // Todos os itens carregados (flatten das páginas)
  const itensPredefinidos = data?.pages.flatMap(page => page.itens) || [];
  const totalItens = data?.pages[0]?.total || 0;

  // Debounce da busca (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Limpa busca ao fechar dropdown
  useEffect(() => {
    if (descricaoDropdownOpen === null) {
      setSearchTerm("");
      setDebouncedSearch("");
    }
  }, [descricaoDropdownOpen]);

  // Foca no input de busca quando abre o dropdown
  useEffect(() => {
    if (descricaoDropdownOpen !== null && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [descricaoDropdownOpen]);

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

  // Scroll infinito no dropdown
  const handleScroll = useCallback(() => {
    if (!dropdownListRef.current || !hasNextPage || isFetchingNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = dropdownListRef.current;
    // Carrega mais quando estiver a 50px do final
    if (scrollHeight - scrollTop - clientHeight < 50) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleOpenDescricaoDropdown = (index: number, categoriaId: string) => {
    if (categoriaId) {
      setDescricaoDropdownOpen(descricaoDropdownOpen === index ? null : index);
    }
  };

  const handleSelectItemPredefinido = (index: number, item: ItemServico) => {
    // Usar onItemMultiChange se disponível para atualizar múltiplos campos de uma vez
    if (onItemMultiChange) {
      onItemMultiChange(index, {
        descricao: item.descricao,
        unidade: item.unidade,
        valorUnitarioMaterial: item.valorUnitario || 0,
        valorUnitarioMaoDeObra: item.valorMaoDeObraUnitario || 0,
      });
    } else {
      // Fallback para compatibilidade
      onItemChange(index, "descricao", item.descricao);
      onItemChange(index, "unidade", item.unidade);
      onItemChange(index, "valorUnitarioMaterial", item.valorUnitario || 0);
      onItemChange(
        index,
        "valorUnitarioMaoDeObra",
        item.valorMaoDeObraUnitario || 0
      );
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
                <option value="comercial">Comercial</option>
                <option value="residencial">Residencial</option>
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
                    <DescricaoSearchInput
                      ref={searchInputRef}
                      type="text"
                      placeholder="Buscar item..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div
                      ref={dropdownListRef}
                      onScroll={handleScroll}
                      style={{ maxHeight: '250px', overflowY: 'auto' }}
                    >
                      {isLoading ? (
                        <DescricaoLoadingMore>Carregando...</DescricaoLoadingMore>
                      ) : itensPredefinidos.length > 0 ? (
                        <>
                          {itensPredefinidos.map((itemPred) => (
                            <DescricaoOption
                              key={itemPred.id}
                              onClick={() =>
                                handleSelectItemPredefinido(index, itemPred)
                              }
                            >
                              <div className="descricao">{itemPred.descricao}</div>
                              <div className="unidade">
                                Unidade: {itemPred.unidade}
                                {(itemPred.valorUnitario ||
                                  itemPred.valorMaoDeObraUnitario) && (
                                  <span
                                    style={{
                                      marginLeft: 8,
                                      color: "var(--primary)",
                                    }}
                                  >
                                    | Mat:{" "}
                                    {formatCurrency(itemPred.valorUnitario || 0)} |
                                    M.O:{" "}
                                    {formatCurrency(
                                      itemPred.valorMaoDeObraUnitario || 0
                                    )}
                                  </span>
                                )}
                              </div>
                            </DescricaoOption>
                          ))}
                          {isFetchingNextPage && (
                            <DescricaoLoadingMore>Carregando mais...</DescricaoLoadingMore>
                          )}
                        </>
                      ) : (
                        <DescricaoEmptyMessage>
                          {searchTerm ? (
                            <>Nenhum item encontrado para "{searchTerm}"</>
                          ) : (
                            <>
                              Nenhum item pré-definido nesta categoria.
                              <br />
                              <small>
                                Configure em Configurações &gt; Categorias
                              </small>
                            </>
                          )}
                        </DescricaoEmptyMessage>
                      )}
                    </div>
                    {totalItens > 0 && (
                      <DescricaoTotal>
                        {itensPredefinidos.length} de {totalItens} itens
                        {hasNextPage && " (role para ver mais)"}
                      </DescricaoTotal>
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
      <AddItemButtonContainer>
        <Button type="button" $size="small" onClick={onAddItem}>
          + Adicionar Item
        </Button>
      </AddItemButtonContainer>
    </ItensSection>
  );
}
