import { useEffect, useCallback, useRef, useState, useMemo } from 'react';

export type KeyCombination = string | string[];
export type KeyboardHandler = (event: KeyboardEvent) => void | boolean;

export interface KeyboardShortcut {
  keys: KeyCombination;
  handler: KeyboardHandler;
  description?: string;
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  capture?: boolean;
  element?: HTMLElement | null;
}

export interface KeyboardOptions {
  enabled?: boolean;
  capture?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  caseSensitive?: boolean;
  element?: HTMLElement | null;
}

export interface KeyboardState {
  pressedKeys: Set<string>;
  lastKeyPressed: string | null;
  isShiftPressed: boolean;
  isCtrlPressed: boolean;
  isAltPressed: boolean;
  isMetaPressed: boolean;
  combinations: string[];
}

export interface KeyboardStats {
  totalKeyPresses: number;
  shortcutTriggers: number;
  keyFrequency: Record<string, number>;
  combinationFrequency: Record<string, number>;
}

// Key mapping for better cross-platform compatibility
const KEY_ALIASES: Record<string, string[]> = {
  'cmd': ['Meta', 'MetaLeft', 'MetaRight'],
  'ctrl': ['Control', 'ControlLeft', 'ControlRight'],
  'alt': ['Alt', 'AltLeft', 'AltRight'],
  'shift': ['Shift', 'ShiftLeft', 'ShiftRight'],
  'space': [' ', 'Space'],
  'enter': ['Enter'],
  'tab': ['Tab'],
  'escape': ['Escape'],
  'backspace': ['Backspace'],
  'delete': ['Delete'],
  'home': ['Home'],
  'end': ['End'],
  'pageup': ['PageUp'],
  'pagedown': ['PageDown'],
  'arrowup': ['ArrowUp'],
  'arrowdown': ['ArrowDown'],
  'arrowleft': ['ArrowLeft'],
  'arrowright': ['ArrowRight'],
};

// Normalize key for comparison
const normalizeKey = (key: string, caseSensitive = false): string => {
  const normalized = caseSensitive ? key : key.toLowerCase();
  
  // Check aliases
  for (const [alias, keys] of Object.entries(KEY_ALIASES)) {
    if (keys.includes(key)) {
      return alias;
    }
  }
  
  return normalized;
};

// Parse key combination string
const parseKeyCombination = (combination: string, caseSensitive = false): string[] => {
  return combination
    .split('+')
    .map(key => normalizeKey(key.trim(), caseSensitive))
    .sort(); // Sort for consistent comparison
};

// Check if current pressed keys match the combination
const matchesCombination = (
  pressedKeys: Set<string>,
  combination: string[],
  caseSensitive = false
): boolean => {
  const normalizedPressed = Array.from(pressedKeys)
    .map(key => normalizeKey(key, caseSensitive))
    .sort();
  
  return (
    combination.length === normalizedPressed.length &&
    combination.every(key => normalizedPressed.includes(key))
  );
};

export const useKeyboard = (options: KeyboardOptions = {}) => {
  const {
    enabled = true,
    capture = false,
    preventDefault = false,
    stopPropagation = false,
    caseSensitive = false,
    element = null,
  } = options;

  const shortcutsRef = useRef<Map<string, KeyboardShortcut>>(new Map());
  const [state, setState] = useState<KeyboardState>({
    pressedKeys: new Set(),
    lastKeyPressed: null,
    isShiftPressed: false,
    isCtrlPressed: false,
    isAltPressed: false,
    isMetaPressed: false,
    combinations: [],
  });
  
  const [stats, setStats] = useState<KeyboardStats>({
    totalKeyPresses: 0,
    shortcutTriggers: 0,
    keyFrequency: {},
    combinationFrequency: {},
  });



  // Add keyboard shortcut
  const addShortcut = useCallback((shortcut: KeyboardShortcut): () => void => {
    const combinations = Array.isArray(shortcut.keys) 
      ? shortcut.keys 
      : [shortcut.keys];
    
    const id = combinations.join('|');
    shortcutsRef.current.set(id, shortcut);
    
    return () => {
      shortcutsRef.current.delete(id);
    };
  }, []);

  // Remove keyboard shortcut
  const removeShortcut = useCallback((keys: KeyCombination) => {
    const combinations = Array.isArray(keys) ? keys : [keys];
    const id = combinations.join('|');
    shortcutsRef.current.delete(id);
  }, []);

  // Clear all shortcuts
  const clearShortcuts = useCallback(() => {
    shortcutsRef.current.clear();
  }, []);

  // Get current shortcuts
  const getShortcuts = useCallback(() => {
    return Array.from(shortcutsRef.current.values());
  }, []);

  // Handle keydown event
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const key = event.key;
    const normalizedKey = normalizeKey(key, caseSensitive);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalKeyPresses: prev.totalKeyPresses + 1,
      keyFrequency: {
        ...prev.keyFrequency,
        [normalizedKey]: (prev.keyFrequency[normalizedKey] || 0) + 1,
      },
    }));

    setState(prev => {
      const newPressedKeys = new Set(prev.pressedKeys);
      newPressedKeys.add(key);
      
      const combinations = Array.from(newPressedKeys)
        .map(k => normalizeKey(k, caseSensitive))
        .sort();

      return {
        ...prev,
        pressedKeys: newPressedKeys,
        lastKeyPressed: key,
        isShiftPressed: event.shiftKey,
        isCtrlPressed: event.ctrlKey,
        isAltPressed: event.altKey,
        isMetaPressed: event.metaKey,
        combinations,
      };
    });

    // Check for matching shortcuts
    for (const [, shortcut] of Array.from(shortcutsRef.current.entries())) {
      if (shortcut.enabled === false) continue;
      
      const combinations = Array.isArray(shortcut.keys) 
        ? shortcut.keys 
        : [shortcut.keys];
      
      for (const combination of combinations) {
        const parsedCombination = parseKeyCombination(combination, caseSensitive);
        const currentPressed = new Set(
          Array.from(state.pressedKeys)
            .concat(key)
            .map(k => normalizeKey(k, caseSensitive))
        );
        
        if (matchesCombination(currentPressed, parsedCombination, caseSensitive)) {
          // Update stats
          setStats(prev => ({
            ...prev,
            shortcutTriggers: prev.shortcutTriggers + 1,
            combinationFrequency: {
              ...prev.combinationFrequency,
              [combination]: (prev.combinationFrequency[combination] || 0) + 1,
            },
          }));

          const shouldPreventDefault = shortcut.preventDefault ?? preventDefault;
          const shouldStopPropagation = shortcut.stopPropagation ?? stopPropagation;

          if (shouldPreventDefault) {
            event.preventDefault();
          }
          
          if (shouldStopPropagation) {
            event.stopPropagation();
          }

          try {
            const result = shortcut.handler(event);
            // If handler returns false, don't prevent default/stop propagation
            if (result === false) {
              // Already handled above based on shortcut config
            }
          } catch (error) {
            console.error('Error in keyboard shortcut handler:', error);
          }
          
          break; // Only trigger first matching shortcut
        }
      }
    }
  }, [enabled, caseSensitive, preventDefault, stopPropagation, state.pressedKeys]);

  // Handle keyup event
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const key = event.key;
    
    setState(prev => {
      const newPressedKeys = new Set(prev.pressedKeys);
      newPressedKeys.delete(key);
      
      const combinations = Array.from(newPressedKeys)
        .map(k => normalizeKey(k, caseSensitive))
        .sort();

      return {
        ...prev,
        pressedKeys: newPressedKeys,
        isShiftPressed: event.shiftKey,
        isCtrlPressed: event.ctrlKey,
        isAltPressed: event.altKey,
        isMetaPressed: event.metaKey,
        combinations,
      };
    });
  }, [enabled, caseSensitive]);

  // Handle focus events to reset state
  const handleFocus = useCallback(() => {
    setState(prev => ({
      ...prev,
      pressedKeys: new Set(),
      combinations: [],
    }));
  }, []);

  const handleBlur = useCallback(() => {
    setState(prev => ({
      ...prev,
      pressedKeys: new Set(),
      combinations: [],
      isShiftPressed: false,
      isCtrlPressed: false,
      isAltPressed: false,
      isMetaPressed: false,
    }));
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return;

    const targetElement = element || window;
    const options = { capture };

    targetElement.addEventListener('keydown', handleKeyDown as EventListener, options);
    targetElement.addEventListener('keyup', handleKeyUp as EventListener, options);
    
    // Handle focus/blur to reset state when window loses focus
    if (targetElement === window) {
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);
    }

    return () => {
      targetElement.removeEventListener('keydown', handleKeyDown as EventListener, options);
      targetElement.removeEventListener('keyup', handleKeyUp as EventListener, options);
      
      if (targetElement === window) {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
      }
    };
  }, [enabled, element, capture, handleKeyDown, handleKeyUp, handleFocus, handleBlur]);

  // Helper functions
  const isKeyPressed = useCallback((key: string): boolean => {
    const normalizedKey = normalizeKey(key, caseSensitive);
    return Array.from(state.pressedKeys).some(
      pressedKey => normalizeKey(pressedKey, caseSensitive) === normalizedKey
    );
  }, [state.pressedKeys, caseSensitive]);

  const areKeysPressed = useCallback((keys: string[]): boolean => {
    return keys.every(key => isKeyPressed(key));
  }, [isKeyPressed]);

  const isCombinationPressed = useCallback((combination: string): boolean => {
    const parsedCombination = parseKeyCombination(combination, caseSensitive);
    const currentPressed = new Set(
      Array.from(state.pressedKeys).map(key => normalizeKey(key, caseSensitive))
    );
    return matchesCombination(currentPressed, parsedCombination, caseSensitive);
  }, [state.pressedKeys, caseSensitive]);

  const memoizedReturn = useMemo(() => ({
    // State
    ...state,
    stats,
    
    // Actions
    addShortcut,
    removeShortcut,
    clearShortcuts,
    getShortcuts,
    
    // Helpers
    isKeyPressed,
    areKeysPressed,
    isCombinationPressed,
    
    // Utilities
    resetStats: () => setStats({
      totalKeyPresses: 0,
      shortcutTriggers: 0,
      keyFrequency: {},
      combinationFrequency: {},
    }),
  }), [
    state,
    stats,
    addShortcut,
    removeShortcut,
    clearShortcuts,
    getShortcuts,
    isKeyPressed,
    areKeysPressed,
    isCombinationPressed,
  ]);

  return memoizedReturn;
};

// Specialized hooks for common keyboard patterns

// Hook for single key press detection
export const useKeyPress = (
  targetKey: string,
  handler: KeyboardHandler,
  options: KeyboardOptions = {}
) => {
  const keyboard = useKeyboard(options);
  
  useEffect(() => {
    const cleanup = keyboard.addShortcut({
      keys: targetKey,
      handler,
      ...options,
    });
    
    return cleanup;
  }, [keyboard, targetKey, handler, options]);
  
  return {
    isPressed: keyboard.isKeyPressed(targetKey),
    ...keyboard,
  };
};

// Hook for key combination shortcuts
export const useKeyboardShortcut = (
  combination: KeyCombination,
  handler: KeyboardHandler,
  options: Omit<KeyboardShortcut, 'keys' | 'handler'> & KeyboardOptions = {}
) => {
  const keyboard = useKeyboard(options);
  
  useEffect(() => {
    const cleanup = keyboard.addShortcut({
      keys: combination,
      handler,
      ...options,
    });
    
    return cleanup;
  }, [keyboard, combination, handler, options]);
  
  return keyboard;
};

// Hook for multiple shortcuts
export const useKeyboardShortcuts = (
  shortcuts: Omit<KeyboardShortcut, 'enabled'>[],
  enabled = true,
  options: KeyboardOptions = {}
) => {
  const keyboard = useKeyboard(options);
  
  useEffect(() => {
    if (!enabled) return;
    
    const cleanupFunctions = shortcuts.map(shortcut =>
      keyboard.addShortcut({ ...shortcut, enabled })
    );
    
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [keyboard, shortcuts, enabled]);
  
  return keyboard;
};

// Hook for arrow key navigation
export const useArrowNavigation = (
  onUp?: KeyboardHandler,
  onDown?: KeyboardHandler,
  onLeft?: KeyboardHandler,
  onRight?: KeyboardHandler,
  options: KeyboardOptions = {}
) => {
  const shortcuts: KeyboardShortcut[] = [];
  
  if (onUp) shortcuts.push({ keys: 'arrowup', handler: onUp });
  if (onDown) shortcuts.push({ keys: 'arrowdown', handler: onDown });
  if (onLeft) shortcuts.push({ keys: 'arrowleft', handler: onLeft });
  if (onRight) shortcuts.push({ keys: 'arrowright', handler: onRight });
  
  return useKeyboardShortcuts(shortcuts, true, options);
};

// Hook for escape key handling
export const useEscapeKey = (
  handler: KeyboardHandler,
  options: KeyboardOptions = {}
) => {
  return useKeyPress('escape', handler, options);
};

// Hook for enter key handling
export const useEnterKey = (
  handler: KeyboardHandler,
  options: KeyboardOptions = {}
) => {
  return useKeyPress('enter', handler, options);
};

export default useKeyboard;