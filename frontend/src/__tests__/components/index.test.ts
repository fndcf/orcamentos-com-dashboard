import { describe, it, expect } from 'vitest';
import * as UIComponents from '../../components/ui';

describe('UI Components Index', () => {
  it('deve exportar Button', () => {
    expect(UIComponents.Button).toBeDefined();
  });

  it('deve exportar componentes de Input', () => {
    expect(UIComponents.Input).toBeDefined();
    expect(UIComponents.InputGroup).toBeDefined();
    expect(UIComponents.Label).toBeDefined();
    expect(UIComponents.TextArea).toBeDefined();
    expect(UIComponents.Select).toBeDefined();
    expect(UIComponents.InputRow).toBeDefined();
    expect(UIComponents.ErrorText).toBeDefined();
  });

  it('deve exportar Modal', () => {
    expect(UIComponents.Modal).toBeDefined();
  });

  it('deve exportar componentes de Table', () => {
    expect(UIComponents.Table).toBeDefined();
    expect(UIComponents.TableContainer).toBeDefined();
    expect(UIComponents.Thead).toBeDefined();
    expect(UIComponents.Tbody).toBeDefined();
    expect(UIComponents.ActionButtons).toBeDefined();
    expect(UIComponents.ActionButton).toBeDefined();
    expect(UIComponents.EmptyState).toBeDefined();
  });

  it('deve exportar componentes de Card', () => {
    expect(UIComponents.Card).toBeDefined();
    expect(UIComponents.CardHeader).toBeDefined();
    expect(UIComponents.PageHeader).toBeDefined();
    expect(UIComponents.SearchBar).toBeDefined();
  });

  it('deve exportar componentes de Loading', () => {
    expect(UIComponents.Loading).toBeDefined();
    expect(UIComponents.LoadingOverlay).toBeDefined();
  });
});
