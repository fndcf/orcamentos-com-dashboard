import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Table,
  TableContainer,
  Thead,
  Tbody,
  ActionButtons,
  ActionButton,
  EmptyState,
  DesktopOnly,
  MobileOnly,
  MobileCardList,
  MobileCard,
  MobileCardHeader,
  MobileCardTitle,
  MobileCardBody,
  MobileCardField,
  MobileCardActions,
} from '../../components/ui/Table';

describe('Table Components', () => {
  describe('Table', () => {
    it('deve renderizar tabela', () => {
      render(
        <Table>
          <tbody>
            <tr>
              <td>Conteúdo</td>
            </tr>
          </tbody>
        </Table>
      );
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('TableContainer', () => {
    it('deve renderizar container da tabela', () => {
      render(
        <TableContainer data-testid="container">
          <Table>
            <tbody>
              <tr>
                <td>Teste</td>
              </tr>
            </tbody>
          </Table>
        </TableContainer>
      );
      expect(screen.getByTestId('container')).toBeInTheDocument();
    });
  });

  describe('Thead', () => {
    it('deve renderizar cabeçalho da tabela', () => {
      render(
        <Table>
          <Thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
            </tr>
          </Thead>
        </Table>
      );
      expect(screen.getByText('Nome')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });

  describe('Tbody', () => {
    it('deve renderizar corpo da tabela', () => {
      render(
        <Table>
          <Tbody>
            <tr>
              <td>João</td>
              <td>joao@email.com</td>
            </tr>
          </Tbody>
        </Table>
      );
      expect(screen.getByText('João')).toBeInTheDocument();
      expect(screen.getByText('joao@email.com')).toBeInTheDocument();
    });

    it('deve renderizar múltiplas linhas', () => {
      render(
        <Table>
          <Tbody>
            <tr>
              <td>João</td>
            </tr>
            <tr>
              <td>Maria</td>
            </tr>
          </Tbody>
        </Table>
      );
      expect(screen.getByText('João')).toBeInTheDocument();
      expect(screen.getByText('Maria')).toBeInTheDocument();
    });
  });

  describe('ActionButtons', () => {
    it('deve renderizar container de botões', () => {
      render(
        <ActionButtons>
          <button>Editar</button>
          <button>Excluir</button>
        </ActionButtons>
      );
      expect(screen.getByText('Editar')).toBeInTheDocument();
      expect(screen.getByText('Excluir')).toBeInTheDocument();
    });
  });

  describe('ActionButton', () => {
    it('deve renderizar botão de ação edit', () => {
      const handleClick = vi.fn();
      render(
        <ActionButton $variant="edit" onClick={handleClick}>
          Editar
        </ActionButton>
      );

      const button = screen.getByText('Editar');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalled();
    });

    it('deve renderizar botão de ação delete', () => {
      const handleClick = vi.fn();
      render(
        <ActionButton $variant="delete" onClick={handleClick}>
          Excluir
        </ActionButton>
      );

      const button = screen.getByText('Excluir');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalled();
    });

    it('deve renderizar botão de ação view', () => {
      render(<ActionButton $variant="view">Visualizar</ActionButton>);
      expect(screen.getByText('Visualizar')).toBeInTheDocument();
    });

    it('deve renderizar botão sem variante (default)', () => {
      render(<ActionButton>Ação</ActionButton>);
      expect(screen.getByText('Ação')).toBeInTheDocument();
    });

    it('deve renderizar botão de ação pdf', () => {
      render(<ActionButton $variant="pdf">PDF</ActionButton>);
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });

    it('deve renderizar botão de ação status', () => {
      render(<ActionButton $variant="status">Status</ActionButton>);
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('deve renderizar botão de ação duplicate', () => {
      render(<ActionButton $variant="duplicate">Duplicar</ActionButton>);
      expect(screen.getByText('Duplicar')).toBeInTheDocument();
    });

    it('deve desabilitar botão quando disabled é true', () => {
      render(<ActionButton disabled>Desabilitado</ActionButton>);
      expect(screen.getByText('Desabilitado')).toBeDisabled();
    });
  });

  describe('EmptyState', () => {
    it('deve renderizar estado vazio', () => {
      render(
        <EmptyState>
          <p>Nenhum item encontrado</p>
        </EmptyState>
      );
      expect(screen.getByText('Nenhum item encontrado')).toBeInTheDocument();
    });

    it('deve renderizar título e descrição', () => {
      render(
        <EmptyState>
          <h3>Lista vazia</h3>
          <p>Adicione itens para começar</p>
        </EmptyState>
      );
      expect(screen.getByText('Lista vazia')).toBeInTheDocument();
      expect(screen.getByText('Adicione itens para começar')).toBeInTheDocument();
    });
  });

  describe('Responsive Components', () => {
    describe('DesktopOnly', () => {
      it('deve renderizar conteúdo', () => {
        render(
          <DesktopOnly data-testid="desktop">
            Conteúdo Desktop
          </DesktopOnly>
        );
        expect(screen.getByTestId('desktop')).toBeInTheDocument();
      });
    });

    describe('MobileOnly', () => {
      it('deve renderizar conteúdo', () => {
        render(
          <MobileOnly data-testid="mobile">
            Conteúdo Mobile
          </MobileOnly>
        );
        expect(screen.getByTestId('mobile')).toBeInTheDocument();
      });
    });

    describe('MobileCardList', () => {
      it('deve renderizar lista de cards', () => {
        render(
          <MobileCardList data-testid="card-list">
            <MobileCard>Card 1</MobileCard>
            <MobileCard>Card 2</MobileCard>
          </MobileCardList>
        );
        expect(screen.getByTestId('card-list')).toBeInTheDocument();
        expect(screen.getByText('Card 1')).toBeInTheDocument();
        expect(screen.getByText('Card 2')).toBeInTheDocument();
      });
    });

    describe('MobileCard', () => {
      it('deve renderizar card mobile', () => {
        render(
          <MobileCard data-testid="card">
            Conteúdo do Card
          </MobileCard>
        );
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });
    });

    describe('MobileCardHeader', () => {
      it('deve renderizar header do card', () => {
        render(
          <MobileCardHeader data-testid="header">
            <span>Header</span>
          </MobileCardHeader>
        );
        expect(screen.getByTestId('header')).toBeInTheDocument();
      });
    });

    describe('MobileCardTitle', () => {
      it('deve renderizar título do card', () => {
        render(
          <MobileCardTitle>
            <span className="primary">Título</span>
            <span className="secondary">Subtítulo</span>
          </MobileCardTitle>
        );
        expect(screen.getByText('Título')).toBeInTheDocument();
        expect(screen.getByText('Subtítulo')).toBeInTheDocument();
      });
    });

    describe('MobileCardBody', () => {
      it('deve renderizar corpo do card', () => {
        render(
          <MobileCardBody data-testid="body">
            <MobileCardField>
              <span className="label">Campo</span>
              <span className="value">Valor</span>
            </MobileCardField>
          </MobileCardBody>
        );
        expect(screen.getByTestId('body')).toBeInTheDocument();
      });
    });

    describe('MobileCardField', () => {
      it('deve renderizar campo do card', () => {
        render(
          <MobileCardField>
            <span className="label">Label</span>
            <span className="value">Value</span>
          </MobileCardField>
        );
        expect(screen.getByText('Label')).toBeInTheDocument();
        expect(screen.getByText('Value')).toBeInTheDocument();
      });

      it('deve suportar classe full-width', () => {
        render(
          <MobileCardField className="full-width" data-testid="field">
            <span>Campo largo</span>
          </MobileCardField>
        );
        expect(screen.getByTestId('field')).toHaveClass('full-width');
      });
    });

    describe('MobileCardActions', () => {
      it('deve renderizar ações do card', () => {
        render(
          <MobileCardActions>
            <button>Ação 1</button>
            <button>Ação 2</button>
          </MobileCardActions>
        );
        expect(screen.getByText('Ação 1')).toBeInTheDocument();
        expect(screen.getByText('Ação 2')).toBeInTheDocument();
      });
    });
  });
});
