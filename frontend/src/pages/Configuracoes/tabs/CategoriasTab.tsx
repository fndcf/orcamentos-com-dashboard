import { useState, useRef, useEffect, useCallback } from 'react';
import {
  useCategoriasItem,
  useCriarCategoriaItem,
  useAtualizarCategoriaItem,
  useToggleCategoriaItem,
  useExcluirCategoriaItem,
} from '../../../hooks/useCategoriasItem';
import {
  useInfiniteItensServicoPorCategoria,
  useCriarItemServico,
  useAtualizarItemServico,
  useToggleItemServico,
  useExcluirItemServico,
} from '../../../hooks/useItensServico';
import { Modal, Button, Input } from '../../../components/ui';
import { CategoriaItem, ItemServico } from '../../../types';
import { logger } from '../../../utils/logger';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import {
  Section,
  ItemsList,
  Item,
  ItemInfo,
  StatusBadge,
  ItemActions,
  ActionButton,
  EmptyState,
  FormGroup,
  Label,
  HelpText,
  ErrorAlert,
  TextArea,
  ModalButtons,
  ItensServicoContainer,
  ItensServicoHeader,
  ItemServicoRow,
  ItemServicoInfo,
  ItemServicoActions,
  SmallButton,
  ExpandButton,
  ItensSearchInput,
  ItensListContainer,
  ItensLoadingMore,
  ItensTotalCount,
} from '../styles';

export function CategoriasTab() {
  const { data: categorias } = useCategoriasItem();
  const criarCategoria = useCriarCategoriaItem();
  const atualizarCategoria = useAtualizarCategoriaItem();
  const toggleCategoria = useToggleCategoriaItem();
  const excluirCategoria = useExcluirCategoriaItem();

  // Estados para categorias
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<CategoriaItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CategoriaItem | null>(null);
  const [nome, setNome] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Estados para Itens de Serviço
  const [categoriaExpandida, setCategoriaExpandida] = useState<string | null>(null);
  const [itemServicoModalOpen, setItemServicoModalOpen] = useState(false);
  const [editandoItemServico, setEditandoItemServico] = useState<ItemServico | null>(null);
  const [itemServicoDescricao, setItemServicoDescricao] = useState('');
  const [itemServicoUnidade, setItemServicoUnidade] = useState('');
  const [itemServicoValorUnitario, setItemServicoValorUnitario] = useState<string>('');
  const [itemServicoValorMaoDeObraUnitario, setItemServicoValorMaoDeObraUnitario] = useState<string>('');
  const [itemServicoValorCusto, setItemServicoValorCusto] = useState<string>('');
  const [itemServicoValorMaoDeObraCusto, setItemServicoValorMaoDeObraCusto] = useState<string>('');
  const [confirmDeleteItemServico, setConfirmDeleteItemServico] = useState<ItemServico | null>(null);
  const [itemServicoError, setItemServicoError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Hooks de itens de serviço com paginação infinita
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingItensServico,
  } = useInfiniteItensServicoPorCategoria(categoriaExpandida || undefined, debouncedSearch, 10);

  // Flatten das páginas para lista de itens
  const itensServico = data?.pages.flatMap(page => page.itens) || [];
  const totalItens = data?.pages[0]?.total || 0;

  const criarItemServico = useCriarItemServico();
  const atualizarItemServico = useAtualizarItemServico();
  const toggleItemServico = useToggleItemServico();
  const excluirItemServico = useExcluirItemServico();

  // Debounce da busca (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Limpa busca ao mudar de categoria
  useEffect(() => {
    setSearchTerm('');
    setDebouncedSearch('');
  }, [categoriaExpandida]);

  // Scroll infinito no container de itens
  const handleScroll = useCallback(() => {
    if (!listContainerRef.current || !hasNextPage || isFetchingNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = listContainerRef.current;
    // Carrega mais quando estiver a 50px do final
    if (scrollHeight - scrollTop - clientHeight < 50) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Funções para Categorias
  const resetForm = () => {
    setNome('');
    setEditando(null);
    setModalError(null);
  };

  const handleNovoClick = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleEditarClick = (item: CategoriaItem) => {
    setEditando(item);
    setNome(item.nome);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSalvar = async () => {
    setModalError(null);

    if (!nome.trim() || nome.trim().length < 3) return;

    try {
      if (editando) {
        await atualizarCategoria.mutateAsync({
          id: editando.id!,
          data: { nome: nome.trim() },
        });
      } else {
        await criarCategoria.mutateAsync({ nome: nome.trim() });
      }
      handleCloseModal();
    } catch (error: any) {
      logger.error('Erro ao salvar categoria', { error });
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Erro ao salvar. Tente novamente.';
      setModalError(errorMessage);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleCategoria.mutateAsync(id);
    } catch (error) {
      logger.error('Erro ao alterar status da categoria', { error });
    }
  };

  const handleExcluir = async () => {
    if (!confirmDelete) return;

    try {
      await excluirCategoria.mutateAsync(confirmDelete.id!);
      setConfirmDelete(null);
    } catch (error) {
      logger.error('Erro ao excluir categoria', { error });
    }
  };

  // Funções para Itens de Serviço
  const handleNovoItemServico = (categoriaId: string) => {
    setEditandoItemServico(null);
    setItemServicoDescricao('');
    setItemServicoUnidade('');
    setItemServicoValorUnitario('');
    setItemServicoValorMaoDeObraUnitario('');
    setItemServicoValorCusto('');
    setItemServicoValorMaoDeObraCusto('');
    setCategoriaExpandida(categoriaId);
    setItemServicoModalOpen(true);
  };

  const handleEditarItemServico = (item: ItemServico) => {
    setEditandoItemServico(item);
    setItemServicoDescricao(item.descricao);
    setItemServicoUnidade(item.unidade);
    setItemServicoValorUnitario(item.valorUnitario?.toString() || '');
    setItemServicoValorMaoDeObraUnitario(item.valorMaoDeObraUnitario?.toString() || '');
    setItemServicoValorCusto(item.valorCusto?.toString() || '');
    setItemServicoValorMaoDeObraCusto(item.valorMaoDeObraCusto?.toString() || '');
    setItemServicoModalOpen(true);
  };

  const handleCloseItemServicoModal = () => {
    setItemServicoModalOpen(false);
    setEditandoItemServico(null);
    setItemServicoDescricao('');
    setItemServicoUnidade('');
    setItemServicoValorUnitario('');
    setItemServicoValorMaoDeObraUnitario('');
    setItemServicoValorCusto('');
    setItemServicoValorMaoDeObraCusto('');
    setItemServicoError(null);
  };

  const handleSalvarItemServico = async () => {
    if (!itemServicoDescricao.trim() || itemServicoDescricao.trim().length < 5) return;
    if (!itemServicoUnidade.trim()) return;

    setItemServicoError(null);

    const dadosItem = {
      descricao: itemServicoDescricao.trim(),
      unidade: itemServicoUnidade.trim().toUpperCase(),
      valorUnitario: itemServicoValorUnitario ? parseFloat(itemServicoValorUnitario) : undefined,
      valorMaoDeObraUnitario: itemServicoValorMaoDeObraUnitario ? parseFloat(itemServicoValorMaoDeObraUnitario) : undefined,
      valorCusto: itemServicoValorCusto ? parseFloat(itemServicoValorCusto) : undefined,
      valorMaoDeObraCusto: itemServicoValorMaoDeObraCusto ? parseFloat(itemServicoValorMaoDeObraCusto) : undefined,
    };

    try {
      if (editandoItemServico) {
        await atualizarItemServico.mutateAsync({
          id: editandoItemServico.id!,
          data: dadosItem,
        });
      } else if (categoriaExpandida) {
        await criarItemServico.mutateAsync({
          categoriaId: categoriaExpandida,
          ...dadosItem,
        });
      }
      handleCloseItemServicoModal();
    } catch (error: any) {
      logger.error('Erro ao salvar item de serviço', { error });
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Erro ao salvar. Tente novamente.';
      setItemServicoError(errorMessage);
    }
  };

  const handleToggleItemServico = async (id: string) => {
    try {
      await toggleItemServico.mutateAsync(id);
    } catch (error) {
      logger.error('Erro ao alterar status do item de serviço', { error });
    }
  };

  const handleExcluirItemServico = async () => {
    if (!confirmDeleteItemServico) return;

    try {
      await excluirItemServico.mutateAsync(confirmDeleteItemServico.id!);
      setConfirmDeleteItemServico(null);
    } catch (error) {
      logger.error('Erro ao excluir item de serviço', { error });
    }
  };

  const isSavingCategoria = criarCategoria.isLoading || atualizarCategoria.isLoading;
  const isSaveDisabled = !nome.trim() || nome.trim().length < 3 || isSavingCategoria;

  return (
    <>
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2>Categorias de Itens</h2>
            <p className="description">
              Cadastre as categorias para agrupar os itens do orçamento completo.
              Clique em "Ver Itens" para cadastrar descrições de serviços/materiais pré-definidos.
            </p>
          </div>
          <Button onClick={handleNovoClick}>+ Nova Categoria</Button>
        </div>

        {categorias && categorias.length > 0 ? (
          <ItemsList>
            {categorias.map((c, index) => (
              <div key={c.id}>
                <Item $ativo={c.ativo}>
                  <ItemInfo>
                    <div className="titulo">
                      {index + 1}. {c.nome}
                      <StatusBadge $ativo={c.ativo}>{c.ativo ? 'Ativa' : 'Inativa'}</StatusBadge>
                    </div>
                  </ItemInfo>
                  <ItemActions>
                    <ExpandButton
                      onClick={() => setCategoriaExpandida(categoriaExpandida === c.id ? null : c.id!)}
                    >
                      {categoriaExpandida === c.id ? 'Ocultar Itens' : 'Ver Itens'}
                    </ExpandButton>
                    <ActionButton $variant="edit" onClick={() => handleEditarClick(c)}>
                      Editar
                    </ActionButton>
                    <ActionButton $variant="toggle" onClick={() => handleToggle(c.id!)}>
                      {c.ativo ? 'Desativar' : 'Ativar'}
                    </ActionButton>
                    <ActionButton $variant="delete" onClick={() => setConfirmDelete(c)}>
                      Excluir
                    </ActionButton>
                  </ItemActions>
                </Item>

                {/* Itens de Serviço da Categoria */}
                {categoriaExpandida === c.id && (
                  <ItensServicoContainer>
                    <ItensServicoHeader>
                      <h4>Itens/Serviços Pré-definidos</h4>
                      <Button
                        onClick={() => handleNovoItemServico(c.id!)}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        + Novo Item
                      </Button>
                    </ItensServicoHeader>

                    <ItensSearchInput
                      type="text"
                      placeholder="Buscar item..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {loadingItensServico ? (
                      <ItensLoadingMore>Carregando...</ItensLoadingMore>
                    ) : itensServico && itensServico.length > 0 ? (
                      <>
                        <ItensListContainer
                          ref={listContainerRef}
                          onScroll={handleScroll}
                        >
                          {itensServico.map((item) => (
                            <ItemServicoRow key={item.id} $ativo={item.ativo}>
                              <ItemServicoInfo>
                                <div className="descricao">{item.descricao}</div>
                                <div className="unidade">Unidade: {item.unidade}</div>
                                {(item.valorUnitario !== undefined || item.valorMaoDeObraUnitario !== undefined) && (
                                  <div className="unidade">
                                    Venda: Mat. R$ {(item.valorUnitario || 0).toFixed(2)} | M.O. R$ {(item.valorMaoDeObraUnitario || 0).toFixed(2)}
                                  </div>
                                )}
                                {(item.valorCusto !== undefined || item.valorMaoDeObraCusto !== undefined) && (
                                  <div className="unidade" style={{ color: 'var(--text-tertiary)' }}>
                                    Custo: Mat. R$ {(item.valorCusto || 0).toFixed(2)} | M.O. R$ {(item.valorMaoDeObraCusto || 0).toFixed(2)}
                                  </div>
                                )}
                              </ItemServicoInfo>
                              <ItemServicoActions>
                                <SmallButton $variant="edit" onClick={() => handleEditarItemServico(item)}>
                                  Editar
                                </SmallButton>
                                <SmallButton $variant="toggle" onClick={() => handleToggleItemServico(item.id!)}>
                                  {item.ativo ? 'Desativar' : 'Ativar'}
                                </SmallButton>
                                <SmallButton $variant="delete" onClick={() => setConfirmDeleteItemServico(item)}>
                                  Excluir
                                </SmallButton>
                              </ItemServicoActions>
                            </ItemServicoRow>
                          ))}
                          {isFetchingNextPage && (
                            <ItensLoadingMore>Carregando mais...</ItensLoadingMore>
                          )}
                        </ItensListContainer>
                        {totalItens > 0 && (
                          <ItensTotalCount>
                            {itensServico.length} de {totalItens} itens
                            {hasNextPage && ' (role para ver mais)'}
                          </ItensTotalCount>
                        )}
                      </>
                    ) : (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                        {searchTerm ? (
                          <>Nenhum item encontrado para "{searchTerm}"</>
                        ) : (
                          <>
                            Nenhum item cadastrado nesta categoria.
                            <br />
                            <span style={{ fontSize: '0.8rem' }}>Clique em "+ Novo Item" para adicionar.</span>
                          </>
                        )}
                      </p>
                    )}
                  </ItensServicoContainer>
                )}
              </div>
            ))}
          </ItemsList>
        ) : (
          <EmptyState>
            <p>Nenhuma categoria cadastrada</p>
            <Button onClick={handleNovoClick}>Cadastrar Primeira Categoria</Button>
          </EmptyState>
        )}
      </Section>

      {/* Modal de Criar/Editar Categoria */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editando ? 'Editar Categoria' : 'Nova Categoria'}
        width="500px"
      >
        {modalError && <ErrorAlert>{modalError}</ErrorAlert>}

        <FormGroup>
          <Label>Nome da Categoria</Label>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Bomba de Incêndio, Sistema de Hidrantes"
          />
          <HelpText>Mínimo de 3 caracteres. Categoria para agrupar os itens do orçamento.</HelpText>
        </FormGroup>

        <ModalButtons>
          <Button $variant="ghost" onClick={handleCloseModal} disabled={isSavingCategoria}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={isSaveDisabled}>
            {isSavingCategoria ? 'Salvando...' : editando ? 'Salvar Alterações' : 'Cadastrar'}
          </Button>
        </ModalButtons>
      </Modal>

      {/* Modal de Confirmação de Exclusão de Categoria */}
      <ConfirmDeleteModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleExcluir}
        itemDescription={`a categoria "${confirmDelete?.nome}"`}
      />

      {/* Modal de Criar/Editar Item de Serviço */}
      <Modal
        isOpen={itemServicoModalOpen}
        onClose={handleCloseItemServicoModal}
        title={editandoItemServico ? 'Editar Item de Serviço' : 'Novo Item de Serviço'}
        width="650px"
      >
        {itemServicoError && <ErrorAlert>{itemServicoError}</ErrorAlert>}

        <FormGroup style={{ marginBottom: 16 }}>
          <Label>Descrição do Item/Serviço</Label>
          <TextArea
            value={itemServicoDescricao}
            onChange={(e) => setItemServicoDescricao(e.target.value)}
            placeholder="Ex: Fornecimento e instalação de bomba de incêndio centrífuga, vazão 500 L/min, altura manométrica 40 mca"
            rows={3}
          />
          <HelpText>Mínimo de 5 caracteres. Esta descrição aparecerá como opção ao criar orçamentos.</HelpText>
        </FormGroup>

        <FormGroup style={{ marginBottom: 16 }}>
          <Label>Unidade de Medida</Label>
          <Input
            value={itemServicoUnidade}
            onChange={(e) => setItemServicoUnidade(e.target.value)}
            placeholder="Ex: UN, M, M2, CJ, VB"
            style={{ maxWidth: 150 }}
          />
          <HelpText>Ex: UN (unidade), M (metro), M2 (metro quadrado), CJ (conjunto), VB (verba)</HelpText>
        </FormGroup>

        {/* Valores de Venda */}
        <div style={{ marginBottom: 16, padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
          <Label style={{ marginBottom: 12, display: 'block', fontWeight: 600 }}>Valores de Venda (Unitários)</Label>
          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            <FormGroup style={{ marginBottom: 0, flex: 1, minWidth: 0 }}>
              <Label style={{ fontSize: '0.85rem' }}>Material</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={itemServicoValorUnitario}
                onChange={(e) => setItemServicoValorUnitario(e.target.value)}
                placeholder="0,00"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </FormGroup>
            <FormGroup style={{ marginBottom: 0, flex: 1, minWidth: 0 }}>
              <Label style={{ fontSize: '0.85rem' }}>M. de Obra</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={itemServicoValorMaoDeObraUnitario}
                onChange={(e) => setItemServicoValorMaoDeObraUnitario(e.target.value)}
                placeholder="0,00"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </FormGroup>
          </div>
        </div>

        {/* Valores de Custo */}
        <div style={{ marginBottom: 16, padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
          <Label style={{ marginBottom: 12, display: 'block', fontWeight: 600, color: 'var(--text-secondary)' }}>Valores de Custo (Ref. Interna)</Label>
          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            <FormGroup style={{ marginBottom: 0, flex: 1, minWidth: 0 }}>
              <Label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Material</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={itemServicoValorCusto}
                onChange={(e) => setItemServicoValorCusto(e.target.value)}
                placeholder="0,00"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </FormGroup>
            <FormGroup style={{ marginBottom: 0, flex: 1, minWidth: 0 }}>
              <Label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>M. de Obra</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={itemServicoValorMaoDeObraCusto}
                onChange={(e) => setItemServicoValorMaoDeObraCusto(e.target.value)}
                placeholder="0,00"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </FormGroup>
          </div>
          <HelpText style={{ marginTop: 8 }}>Valores de custo não aparecem no orçamento.</HelpText>
        </div>

        <ModalButtons>
          <Button $variant="ghost" onClick={handleCloseItemServicoModal}>
            Cancelar
          </Button>
          <Button
            onClick={handleSalvarItemServico}
            disabled={!itemServicoDescricao.trim() || itemServicoDescricao.trim().length < 5 || !itemServicoUnidade.trim()}
          >
            {editandoItemServico ? 'Salvar Alterações' : 'Cadastrar'}
          </Button>
        </ModalButtons>
      </Modal>

      {/* Modal de Confirmação de Exclusão de Item de Serviço */}
      <ConfirmDeleteModal
        isOpen={!!confirmDeleteItemServico}
        onClose={() => setConfirmDeleteItemServico(null)}
        onConfirm={handleExcluirItemServico}
        itemDescription={`o item "${confirmDeleteItemServico?.descricao.substring(0, 50)}..."`}
      />
    </>
  );
}
