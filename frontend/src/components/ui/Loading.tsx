import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
`;

const Spinner = styled.div<{ $size?: number }>`
  width: ${({ $size }) => $size || 40}px;
  height: ${({ $size }) => $size || 40}px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

interface LoadingProps {
  size?: number;
}

export function Loading({ size }: LoadingProps) {
  return (
    <SpinnerContainer data-testid="loading">
      <Spinner $size={size} />
    </SpinnerContainer>
  );
}

export const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;
