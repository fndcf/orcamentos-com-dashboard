import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, PageHeader, SearchBar } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

describe('Card Components', () => {
  describe('Card', () => {
    it('deve renderizar card com conteúdo', () => {
      render(
        <Card>
          <p>Conteúdo do card</p>
        </Card>
      );
      expect(screen.getByText('Conteúdo do card')).toBeInTheDocument();
    });

    it('deve renderizar múltiplos elementos', () => {
      render(
        <Card>
          <h2>Título</h2>
          <p>Descrição</p>
        </Card>
      );
      expect(screen.getByText('Título')).toBeInTheDocument();
      expect(screen.getByText('Descrição')).toBeInTheDocument();
    });
  });

  describe('CardHeader', () => {
    it('deve renderizar cabeçalho do card', () => {
      render(
        <CardHeader>
          <h2>Meu Título</h2>
        </CardHeader>
      );
      expect(screen.getByText('Meu Título')).toBeInTheDocument();
    });

    it('deve renderizar título e ação', () => {
      render(
        <CardHeader>
          <h2>Lista</h2>
          <button>Adicionar</button>
        </CardHeader>
      );
      expect(screen.getByText('Lista')).toBeInTheDocument();
      expect(screen.getByText('Adicionar')).toBeInTheDocument();
    });
  });

  describe('PageHeader', () => {
    it('deve renderizar cabeçalho da página', () => {
      render(
        <PageHeader>
          <h1>Página Principal</h1>
        </PageHeader>
      );
      expect(screen.getByText('Página Principal')).toBeInTheDocument();
    });

    it('deve renderizar título e botão de ação', () => {
      render(
        <PageHeader>
          <h1>Clientes</h1>
          <button>+ Novo Cliente</button>
        </PageHeader>
      );
      expect(screen.getByText('Clientes')).toBeInTheDocument();
      expect(screen.getByText('+ Novo Cliente')).toBeInTheDocument();
    });
  });

  describe('SearchBar', () => {
    it('deve renderizar barra de busca', () => {
      render(
        <SearchBar>
          <Input placeholder="Buscar..." />
        </SearchBar>
      );
      expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
    });

    it('deve renderizar input e botão', () => {
      render(
        <SearchBar>
          <Input placeholder="Pesquisar" />
          <button>Buscar</button>
        </SearchBar>
      );
      expect(screen.getByPlaceholderText('Pesquisar')).toBeInTheDocument();
      expect(screen.getByText('Buscar')).toBeInTheDocument();
    });
  });
});
