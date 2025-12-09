import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, InputGroup, Label, TextArea, Select, InputRow, ErrorText } from '../../components/ui/Input';

describe('Input Components', () => {
  describe('Input', () => {
    it('deve renderizar input', () => {
      render(<Input placeholder="Digite algo" />);
      expect(screen.getByPlaceholderText('Digite algo')).toBeInTheDocument();
    });

    it('deve chamar onChange quando digitado', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'teste' } });

      expect(handleChange).toHaveBeenCalled();
    });

    it('deve estar desabilitado quando prop disabled', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('deve aceitar valor', () => {
      render(<Input value="valor teste" readOnly />);
      expect(screen.getByRole('textbox')).toHaveValue('valor teste');
    });
  });

  describe('InputGroup', () => {
    it('deve renderizar children', () => {
      render(
        <InputGroup>
          <span>Conteúdo</span>
        </InputGroup>
      );
      expect(screen.getByText('Conteúdo')).toBeInTheDocument();
    });
  });

  describe('Label', () => {
    it('deve renderizar label', () => {
      render(<Label>Nome do Campo</Label>);
      expect(screen.getByText('Nome do Campo')).toBeInTheDocument();
    });

    it('deve associar ao input via htmlFor', () => {
      render(<Label htmlFor="meu-input">Campo</Label>);
      expect(screen.getByText('Campo')).toHaveAttribute('for', 'meu-input');
    });
  });

  describe('TextArea', () => {
    it('deve renderizar textarea', () => {
      render(<TextArea placeholder="Digite sua mensagem" />);
      expect(screen.getByPlaceholderText('Digite sua mensagem')).toBeInTheDocument();
    });

    it('deve chamar onChange quando digitado', () => {
      const handleChange = vi.fn();
      render(<TextArea onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'mensagem' } });

      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Select', () => {
    it('deve renderizar select com opções', () => {
      render(
        <Select data-testid="select">
          <option value="">Selecione</option>
          <option value="1">Opção 1</option>
          <option value="2">Opção 2</option>
        </Select>
      );

      expect(screen.getByTestId('select')).toBeInTheDocument();
      expect(screen.getByText('Opção 1')).toBeInTheDocument();
    });

    it('deve chamar onChange ao selecionar', () => {
      const handleChange = vi.fn();
      render(
        <Select onChange={handleChange} data-testid="select">
          <option value="">Selecione</option>
          <option value="1">Opção 1</option>
        </Select>
      );

      fireEvent.change(screen.getByTestId('select'), { target: { value: '1' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('InputRow', () => {
    it('deve renderizar children em grid', () => {
      render(
        <InputRow>
          <Input placeholder="Campo 1" />
          <Input placeholder="Campo 2" />
        </InputRow>
      );

      expect(screen.getByPlaceholderText('Campo 1')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Campo 2')).toBeInTheDocument();
    });
  });

  describe('ErrorText', () => {
    it('deve renderizar texto de erro', () => {
      render(<ErrorText>Campo obrigatório</ErrorText>);
      expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    });
  });
});
