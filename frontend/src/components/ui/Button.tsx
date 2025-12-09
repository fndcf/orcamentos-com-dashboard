import styled, { css } from 'styled-components';
import React, { forwardRef } from 'react';

interface ButtonStyleProps {
  $variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  $size?: 'small' | 'medium' | 'large';
  $fullWidth?: boolean;
}

const variants = {
  primary: css`
    background: var(--primary);
    color: white;
    border: none;

    &:hover:not(:disabled) {
      background: var(--primary-dark);
    }
  `,
  secondary: css`
    background: var(--secondary);
    color: white;
    border: none;

    &:hover:not(:disabled) {
      background: var(--secondary-light);
    }
  `,
  danger: css`
    background: var(--error);
    color: white;
    border: none;

    &:hover:not(:disabled) {
      background: #d32f2f;
    }
  `,
  ghost: css`
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--border);

    &:hover:not(:disabled) {
      background: var(--background);
    }
  `,
};

const sizes = {
  small: css`
    padding: 6px 12px;
    font-size: 0.85rem;
  `,
  medium: css`
    padding: 10px 20px;
    font-size: 0.95rem;
  `,
  large: css`
    padding: 14px 28px;
    font-size: 1rem;
  `,
};

const StyledButton = styled.button<ButtonStyleProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${({ $variant = 'primary' }) => variants[$variant]}
  ${({ $size = 'medium' }) => sizes[$size]}
  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ type = 'button', ...props }, ref) => {
    return <StyledButton ref={ref} type={type} {...props} />;
  }
);

Button.displayName = 'Button';
