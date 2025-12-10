import { ReactNode, useEffect } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 10px;
    padding-top: 20px;
  }
`;

const ModalContainer = styled.div<{ $width?: string }>`
  background: var(--surface);
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: ${({ $width }) => $width || '500px'};
  margin: auto 0;
  flex-shrink: 0;

  @media (max-width: 768px) {
    max-width: 100%;
    border-radius: 8px;
    margin: 0;
  }
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-primary);
  }

  @media (max-width: 768px) {
    padding: 16px;

    h2 {
      font-size: 1.1rem;
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  line-height: 1;

  &:hover {
    color: var(--text-primary);
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  @media (max-width: 768px) {
    padding: 12px 16px;
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

const sizeWidths = {
  small: '400px',
  medium: '500px',
  large: '800px',
  xlarge: '1100px',
};

export function Modal({ isOpen, onClose, title, children, footer, width, size }: ModalProps) {
  const modalWidth = width || (size ? sizeWidths[size] : sizeWidths.medium);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer $width={modalWidth} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>{title}</h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContainer>
    </Overlay>
  );
}
