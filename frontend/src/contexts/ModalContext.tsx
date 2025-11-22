/**
 * Modal Context - Vardhman Mills Frontend
 * Manages modals, dialogs, and popup components
 */

'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

// Types
interface Modal {
  id: string;
  type: 'dialog' | 'alert' | 'confirm' | 'custom';
  title?: string;
  content?: ReactNode;
  component?: React.ComponentType<Record<string, unknown>>;
  props?: Record<string, unknown>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  backdrop?: boolean;
  zIndex?: number;
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ModalState {
  modals: Modal[];
  activeModal: Modal | null;
  loading: boolean;
  maxZIndex: number;
}

type ModalAction =
  | { type: 'OPEN_MODAL'; payload: Modal }
  | { type: 'CLOSE_MODAL'; payload: string }
  | { type: 'CLOSE_ALL' }
  | { type: 'SET_LOADING'; payload: boolean };

interface ModalContextType {
  state: ModalState;
  openModal: (modal: Omit<Modal, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAll: () => void;
  confirmModal: (title: string, content: string) => Promise<boolean>;
  alertModal: (title: string, content: string) => void;
}

// Initial state
const initialState: ModalState = {
  modals: [],
  activeModal: null,
  loading: false,
  maxZIndex: 1000,
};

// Reducer
const modalReducer = (state: ModalState, action: ModalAction): ModalState => {
  switch (action.type) {
    case 'OPEN_MODAL':
      return {
        ...state,
        modals: [...state.modals, action.payload],
        activeModal: action.payload,
        maxZIndex: state.maxZIndex + 1,
      };
    
    case 'CLOSE_MODAL':
      const filteredModals = state.modals.filter(modal => modal.id !== action.payload);
      return {
        ...state,
        modals: filteredModals,
        activeModal: filteredModals[filteredModals.length - 1] || null,
      };
    
    case 'CLOSE_ALL':
      return {
        ...state,
        modals: [],
        activeModal: null,
      };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    default:
      return state;
  }
};

// Context
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Provider
export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(modalReducer, initialState);
  
  const openModal = useCallback((modal: Omit<Modal, 'id'>): string => {
    const id = `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newModal: Modal = {
      ...modal,
      id,
      zIndex: state.maxZIndex + 1,
    };
    
    dispatch({ type: 'OPEN_MODAL', payload: newModal });
    return id;
  }, [state.maxZIndex]);
  
  const closeModal = useCallback((id: string): void => {
    const modal = state.modals.find(m => m.id === id);
    if (modal?.onClose) {
      modal.onClose();
    }
    dispatch({ type: 'CLOSE_MODAL', payload: id });
  }, [state.modals]);
  
  const closeAll = useCallback((): void => {
    dispatch({ type: 'CLOSE_ALL' });
  }, []);
  
  const confirmModal = useCallback((title: string, content: string): Promise<boolean> => {
    return new Promise((resolve) => {
      openModal({
        type: 'confirm',
        title,
        content,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }, [openModal]);
  
  const alertModal = useCallback((title: string, content: string): void => {
    openModal({
      type: 'alert',
      title,
      content,
    });
  }, [openModal]);
  
  return (
    <ModalContext.Provider value={{
      state,
      openModal,
      closeModal,
      closeAll,
      confirmModal,
      alertModal,
    }}>
      {children}
    </ModalContext.Provider>
  );
};

// Hook
export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export default ModalContext;
export type { Modal, ModalState };