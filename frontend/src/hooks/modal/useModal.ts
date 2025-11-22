import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';

export interface ModalState {
  isOpen: boolean;
  data: Record<string, unknown> | null;
  type: string | null;
  title?: string;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable: boolean;
  persistent: boolean;
  backdrop: boolean;
  centered: boolean;
  scrollable: boolean;
  animation: 'fade' | 'slide' | 'zoom' | 'none';
  zIndex: number;
  openedAt?: Date;
  focusTrap: boolean;
  returnFocus: boolean;
  preventBodyScroll: boolean;
}

export interface ModalConfig {
  defaultSize?: ModalState['size'];
  defaultAnimation?: ModalState['animation'];
  defaultZIndex?: number;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  preventBodyScroll?: boolean;
  stackable?: boolean;
  maxStack?: number;
}

export interface ModalMethods {
  open: (type: string, data?: Record<string, unknown>, options?: Partial<ModalState>) => void;
  close: () => void;
  toggle: (type?: string) => void;
  updateData: (data: Record<string, unknown>) => void;
  setTitle: (title: string) => void;
  setSize: (size: ModalState['size']) => void;
  isType: (type: string) => boolean;
  hasData: (key?: string) => boolean;
  getData: <T = unknown>(key?: string) => T | null;
  reset: () => void;
}

export interface ModalStack {
  modals: Array<ModalState & { id: string }>;
  activeModal: (ModalState & { id: string }) | null;
  count: number;
}

const defaultModalState: ModalState = {
  isOpen: false,
  data: null,
  type: null,
  title: undefined,
  size: 'md',
  closable: true,
  persistent: false,
  backdrop: true,
  centered: false,
  scrollable: false,
  animation: 'fade',
  zIndex: 1050,
  focusTrap: true,
  returnFocus: true,
  preventBodyScroll: true,
};

export const useModal = (config: ModalConfig = {}) => {
  const {
    defaultSize = 'md',
    defaultAnimation = 'fade',
    defaultZIndex = 1050,
    closeOnEscape = true,
    closeOnBackdrop = true,
    autoFocus = true,
    restoreFocus = true,
    preventBodyScroll = true,
    stackable = false,
    maxStack = 3,
  } = config;

  const [state, setState] = useState<ModalState>({
    ...defaultModalState,
    size: defaultSize,
    animation: defaultAnimation,
    zIndex: defaultZIndex,
    focusTrap: autoFocus,
    returnFocus: restoreFocus,
    preventBodyScroll,
  });

  const [stack, setStack] = useState<ModalStack>({
    modals: [],
    activeModal: null,
    count: 0,
  });

  const previousFocusRef = useRef<HTMLElement | null>(null);
  const modalIdRef = useRef<string>('');

  // Body scroll management
  const manageBodyScroll = useCallback((prevent: boolean) => {
    if (typeof document === 'undefined') return;

    if (prevent) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.dataset.scrollY = scrollY.toString();
    } else {
      const scrollY = document.body.dataset.scrollY || '0';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY, 10));
      delete document.body.dataset.scrollY;
    }
  }, []);

  // Focus management
  const manageFocus = useCallback((trap: boolean, returnFocus: boolean) => {
    if (typeof document === 'undefined') return;

    if (trap) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus first focusable element in modal
      const focusableElements = document.querySelectorAll(
        '[data-modal-id="' + modalIdRef.current + '"] [tabindex]:not([tabindex="-1"]), ' +
        '[data-modal-id="' + modalIdRef.current + '"] button:not(:disabled), ' +
        '[data-modal-id="' + modalIdRef.current + '"] input:not(:disabled), ' +
        '[data-modal-id="' + modalIdRef.current + '"] select:not(:disabled), ' +
        '[data-modal-id="' + modalIdRef.current + '"] textarea:not(:disabled), ' +
        '[data-modal-id="' + modalIdRef.current + '"] a[href]'
      );
      
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    } else if (returnFocus && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  // Open modal
  const open = useCallback((
    type: string, 
    data: Record<string, unknown> = {}, 
    options: Partial<ModalState> = {}
  ) => {
    const modalId = Date.now().toString();
    modalIdRef.current = modalId;

    const newModalState: ModalState = {
      ...state,
      isOpen: true,
      type,
      data: { ...data },
      openedAt: new Date(),
      ...options,
    };

    if (stackable) {
      setStack(prevStack => {
        const newModal = { ...newModalState, id: modalId };
        const newModals = [...prevStack.modals];

        // Remove modals if exceeding max stack
        if (newModals.length >= maxStack) {
          const removeCount = newModals.length - maxStack + 1;
          newModals.splice(0, removeCount);
        }

        newModals.push(newModal);

        return {
          modals: newModals,
          activeModal: newModal,
          count: newModals.length,
        };
      });
    }

    setState(newModalState);

    // Manage body scroll
    if (newModalState.preventBodyScroll) {
      manageBodyScroll(true);
    }

    // Manage focus
    if (newModalState.focusTrap) {
      // Delay focus to allow modal to render
      setTimeout(() => manageFocus(true, false), 100);
    }

    toast.success(`${type} modal opened`);
  }, [state, stackable, maxStack, manageBodyScroll, manageFocus]);

  // Close modal
  const close = useCallback(() => {
    if (stackable) {
      setStack(prevStack => {
        const newModals = [...prevStack.modals];
        newModals.pop(); // Remove the top modal

        const newActiveModal = newModals.length > 0 ? newModals[newModals.length - 1] : null;

        if (newActiveModal) {
          setState(newActiveModal);
          modalIdRef.current = newActiveModal.id;
        } else {
          setState({ ...defaultModalState, preventBodyScroll });
          modalIdRef.current = '';
        }

        return {
          modals: newModals,
          activeModal: newActiveModal,
          count: newModals.length,
        };
      });
    } else {
      setState(prevState => ({
        ...prevState,
        isOpen: false,
        data: null,
        type: null,
        title: undefined,
        openedAt: undefined,
      }));
    }

    // Manage body scroll - only restore if no modals are open
    if (!stackable || stack.count <= 1) {
      if (state.preventBodyScroll) {
        manageBodyScroll(false);
      }

      // Manage focus
      if (state.returnFocus) {
        manageFocus(false, true);
      }
    }

    toast.success('Modal closed');
  }, [stackable, stack.count, state.preventBodyScroll, state.returnFocus, manageBodyScroll, manageFocus, preventBodyScroll]);

  // Toggle modal
  const toggle = useCallback((type?: string) => {
    if (state.isOpen && (!type || state.type === type)) {
      close();
    } else if (type) {
      open(type);
    }
  }, [state.isOpen, state.type, close, open]);

  // Update modal data
  const updateData = useCallback((newData: Record<string, unknown>) => {
    setState(prevState => ({
      ...prevState,
      data: { ...prevState.data, ...newData },
    }));

    if (stackable && stack.activeModal) {
      setStack(prevStack => ({
        ...prevStack,
        activeModal: {
          ...prevStack.activeModal!,
          data: { ...prevStack.activeModal!.data, ...newData },
        },
        modals: prevStack.modals.map(modal =>
          modal.id === stack.activeModal!.id
            ? { ...modal, data: { ...modal.data, ...newData } }
            : modal
        ),
      }));
    }
  }, [stackable, stack.activeModal]);

  // Set modal title
  const setTitle = useCallback((title: string) => {
    setState(prevState => ({ ...prevState, title }));

    if (stackable && stack.activeModal) {
      setStack(prevStack => ({
        ...prevStack,
        activeModal: { ...prevStack.activeModal!, title },
        modals: prevStack.modals.map(modal =>
          modal.id === stack.activeModal!.id ? { ...modal, title } : modal
        ),
      }));
    }
  }, [stackable, stack.activeModal]);

  // Set modal size
  const setSize = useCallback((size: ModalState['size']) => {
    setState(prevState => ({ ...prevState, size }));

    if (stackable && stack.activeModal) {
      setStack(prevStack => ({
        ...prevStack,
        activeModal: { ...prevStack.activeModal!, size },
        modals: prevStack.modals.map(modal =>
          modal.id === stack.activeModal!.id ? { ...modal, size } : modal
        ),
      }));
    }
  }, [stackable, stack.activeModal]);

  // Check modal type
  const isType = useCallback((type: string) => {
    return state.type === type;
  }, [state.type]);

  // Check if modal has data
  const hasData = useCallback((key?: string) => {
    if (!state.data) return false;
    if (!key) return Object.keys(state.data).length > 0;
    return key in state.data;
  }, [state.data]);

  // Get modal data
  const getData = useCallback(<T = unknown>(key?: string): T | null => {
    if (!state.data) return null;
    if (!key) return state.data as T;
    return (state.data[key] as T) || null;
  }, [state.data]);

  // Reset modal state
  const reset = useCallback(() => {
    setState({ ...defaultModalState, preventBodyScroll });
    setStack({ modals: [], activeModal: null, count: 0 });
    modalIdRef.current = '';

    if (state.preventBodyScroll) {
      manageBodyScroll(false);
    }

    if (state.returnFocus) {
      manageFocus(false, true);
    }
  }, [preventBodyScroll, state.preventBodyScroll, state.returnFocus, manageBodyScroll, manageFocus]);

  // Keyboard event handlers
  useEffect(() => {
    if (!state.isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state.closable && !state.persistent) {
        event.preventDefault();
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [state.isOpen, state.closable, state.persistent, closeOnEscape, close]);

  // Focus trap management
  useEffect(() => {
    if (!state.isOpen || !state.focusTrap) return;

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = document.querySelectorAll(
        '[data-modal-id="' + modalIdRef.current + '"] [tabindex]:not([tabindex="-1"]), ' +
        '[data-modal-id="' + modalIdRef.current + '"] button:not(:disabled), ' +
        '[data-modal-id="' + modalIdRef.current + '"] input:not(:disabled), ' +
        '[data-modal-id="' + modalIdRef.current + '"] select:not(:disabled), ' +
        '[data-modal-id="' + modalIdRef.current + '"] textarea:not(:disabled), ' +
        '[data-modal-id="' + modalIdRef.current + '"] a[href]'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [state.isOpen, state.focusTrap]);

  // Backdrop click handler
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (
      closeOnBackdrop && 
      state.closable && 
      !state.persistent &&
      event.target === event.currentTarget
    ) {
      close();
    }
  }, [closeOnBackdrop, state.closable, state.persistent, close]);

  // Modal methods
  const methods: ModalMethods = useMemo(() => ({
    open,
    close,
    toggle,
    updateData,
    setTitle,
    setSize,
    isType,
    hasData,
    getData,
    reset,
  }), [open, close, toggle, updateData, setTitle, setSize, isType, hasData, getData, reset]);

  // Computed values
  const computed = useMemo(() => ({
    isOpening: state.isOpen && !state.openedAt,
    timeOpen: state.openedAt ? Date.now() - state.openedAt.getTime() : 0,
    hasTitle: Boolean(state.title),
    isEmpty: !state.data || Object.keys(state.data).length === 0,
    canClose: state.closable && !state.persistent,
    modalId: modalIdRef.current,
    zIndexStyle: { zIndex: state.zIndex },
    sizeClass: `modal-${state.size}`,
    animationClass: `modal-${state.animation}`,
  }), [state]);

  return {
    // State
    ...state,
    
    // Stack (if stackable)
    stack: stackable ? stack : null,
    
    // Methods
    ...methods,
    
    // Event handlers
    handleBackdropClick,
    
    // Computed values
    ...computed,
    
    // Configuration
    config: {
      closeOnEscape,
      closeOnBackdrop,
      autoFocus,
      restoreFocus,
      preventBodyScroll,
      stackable,
      maxStack,
    },
  };
};

export default useModal;