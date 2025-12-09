import { useState } from 'react';
import {
  useCategoriasItem,
  useCriarCategoriaItem,
  useAtualizarCategoriaItem,
  useToggleCategoriaItem,
  useExcluirCategoriaItem,
} from '../../../hooks/useCategoriasItem';
import {
  useItensServicoPorCategoria,
  useCriarItemServico,
  useAtualizarItemServico,
  useToggleItemServico,
  useExcluirItemServico,
} from '../../../hooks/useItensServico';
import { Modal, Button, Input } from '../../../components/ui';
import { CategoriaItem, ItemServico } from '../../../types';
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
  const [confirmDeleteItemServico, setConfirmDeleteItemServico] = useState<ItemServico | null>(null);
  const [itemServicoError, setItemServicoError] = useState<string | null>(null);

  // Hooks de itens de serviço
  const { data: itensServico, isLoading: loadingItensServico } = useItensServicoPorCategoria(categoriaExpandida || undefined);
  const criarItemServico = useCriarItemServico();
  const atualizarItemServico = useAtualizarItemServico();
  const toggleItemServico = useToggleItemServico();
  const excluirItemServico = useExcluirItemServico();

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
      console.error('Erro ao salvar:', error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Erro ao salvar. Tente novamente.';
      setModalError(errorMessage);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleCategoria.mutateAsync(id);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const handleExcluir = async () => {
    if (!confirmDelete) return;

    try {
      await excluirCategoria.mutateAsync(confirmDelete.id!);
      setConfirmDelete(null);
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  // Funções para Itens de Serviço
  const handleNovoItemServico = (categoriaId: string) => {
    setEditandoItemServico(null);
    setItemServicoDescricao('');
    setItemServicoUnidade('');
    setCategoriaExpandida(categoriaId);
    setItemServicoModalOpen(true);
  };

  const handleEditarItemServico = (item: ItemServico) => {
    setEditandoItemServico(item);
    setItemServicoDescricao(item.descricao);
    setItemServicoUnidade(item.unidade);
    setItemServicoModalOpen(true);
  };

  const handleCloseItemServicoModal = () => {
    setItemServicoModalOpen(false);
    setEditandoItemServico(null);
    setItemServicoDescricao('');
    setItemServicoUnidade('');
    setItemServicoError(null);
  };

  const handleSalvarItemServico = async () => {
    if (!itemServicoDescricao.trim() || itemServicoDescricao.trim().length < 5) return;
    if (!itemServicoUnidade.trim()) return;

    setItemServicoError(null);

    try {
      if (editandoItemServico) {
        await atualizarItemServico.mutateAsync({
          id: editandoItemServico.id!,
          data: {
            descricao: itemServicoDescricao.trim(),
            unidade: itemServicoUnidade.trim().toUpperCase(),
          },
        });
      } else if (categoriaExpandida) {
        await criarItemServico.mutateAsync({
          categoriaId: categoriaExpandida,
          descricao: itemServicoDescricao.trim(),
          unidade: itemServicoUnidade.trim().toUpperCase(),
        });
      }
      handleCloseItemServicoModal();
    } catch (error: any) {
      console.error('Erro ao salvar item de servico:', error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Erro ao salvar. Tente novamente.';
      setItemServicoError(errorMessage);
    }
  };

  const handleToggleItemServico = async (id: string) => {
    try {
      await toggleItemServico.mutateAsync(id);
    } catch (error) {
      console.error('Erro ao alterar status do item:', error);
    }
  };

  const handleExcluirItemServico = async () => {
    if (!confirmDeleteItemServico) return;

    try {
      await excluirItemServico.mutateAsync(confirmDeleteItemServico.id!);
      setConfirmDeleteItemServico(null);
    } catch (error) {
      console.error('Erro ao excluir item de servico:', error);
    }
  };

  const isSaveDisabled = !nome.trim() || nome.trim().length < 3;

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
            {categorias.map((c) => (
              <div key={c.id}>
                <Item $ativo={c.ativo}>
                  <ItemInfo>
                    <div className="titulo">
                      {c.ordem}. {c.nome}
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

                    {loadingItensServico ? (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Carregando...</p>
                    ) : itensServico && itensServico.length > 0 ? (
                      itensServico.map((item) => (
                        <ItemServicoRow key={item.id} $ativo={item.ativo}>
                          <ItemServicoInfo>
                            <div className="descricao">{item.descricao}</div>
                            <div className="unidade">Unidade: {item.unidade}</div>
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
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                        Nenhum item cadastrado nesta categoria.
                        <br />
                        <span style={{ fontSize: '0.8rem' }}>Clique em "+ Novo Item" para adicionar.</span>
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
          <Button $variant="ghost" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={isSaveDisabled}>
            {editando ? 'Salvar Alterações' : 'Cadastrar'}
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
        width="550px"
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

        <FormGroup>
          <Label>Unidade de Medida</Label>
          <Input
            value={itemServicoUnidade}
            onChange={(e) => setItemServicoUnidade(e.target.value)}
            placeholder="Ex: UN, M, M2, CJ, VB"
            style={{ maxWidth: 150 }}
          />
          <HelpText>Ex: UN (unidade), M (metro), M2 (metro quadrado), CJ (conjunto), VB (verba)</HelpText>
        </FormGroup>

        <ModalButtons>
          <Button $variant="ghost" onClick={handleCloseItemServicoModal}>
            Cancelar
          </Button>
          <Button
            onClick={handleSalvarItemServico}
            disabled={!itemServicoDescricao.trim() || itemServicoDescricao.trim().length < 5 || !itemServicoUnidade.trim()}
          >
            {editandoItemServico ? 'Salvar Alteracoes' : 'Cadastrar'}
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
