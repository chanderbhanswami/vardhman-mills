import { useEffect, useRef, RefObject } from 'react';

export type ClickOutsideHandler = (event: Event) => void;

export interface UseClickOutsideOptions {
  enabled?: boolean;
  events?: string[];
  ignoreElements?: (HTMLElement | RefObject<HTMLElement>)[];
}

export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  handler: ClickOutsideHandler,
  options: UseClickOutsideOptions = {}
): RefObject<T | null> => {
  const {
    enabled = true,
    events = ['mousedown', 'touchstart'],
    ignoreElements = [],
  } = options;

  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: Event) => {
      const target = event.target as HTMLElement;
      
      if (!target || !ref.current) return;

      // Check if click is inside the ref element
      if (ref.current.contains(target)) return;

      // Check if click is inside any ignored elements
      const isInsideIgnoredElement = ignoreElements.some(element => {
        if (!element) return false;
        
        // Handle RefObject
        if ('current' in element) {
          return element.current?.contains(target);
        }
        
        // Handle HTMLElement
        return element.contains(target);
      });

      if (isInsideIgnoredElement) return;

      // Call the handler
      handler(event);
    };

    // Add event listeners for all specified events
    events.forEach(eventName => {
      document.addEventListener(eventName, handleClickOutside as EventListener, { passive: true });
    });

    // Cleanup
    return () => {
      events.forEach(eventName => {
        document.removeEventListener(eventName, handleClickOutside as EventListener);
      });
    };
  }, [handler, enabled, events, ignoreElements]);

  return ref;
};

// Multiple refs version
export const useClickOutsideMultiple = (
  refs: RefObject<HTMLElement>[],
  handler: ClickOutsideHandler,
  options: UseClickOutsideOptions = {}
): void => {
  const {
    enabled = true,
    events = ['mousedown', 'touchstart'],
    ignoreElements = [],
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: Event) => {
      const target = event.target as HTMLElement;
      
      if (!target) return;

      // Check if click is inside any of the ref elements
      const isInsideAnyRef = refs.some(ref => {
        return ref.current?.contains(target);
      });

      if (isInsideAnyRef) return;

      // Check if click is inside any ignored elements
      const isInsideIgnoredElement = ignoreElements.some(element => {
        if (!element) return false;
        
        if ('current' in element) {
          return element.current?.contains(target);
        }
        
        return element.contains(target);
      });

      if (isInsideIgnoredElement) return;

      handler(event);
    };

    events.forEach(eventName => {
      document.addEventListener(eventName, handleClickOutside as EventListener, { passive: true });
    });

    return () => {
      events.forEach(eventName => {
        document.removeEventListener(eventName, handleClickOutside as EventListener);
      });
    };
  }, [refs, handler, enabled, events, ignoreElements]);
};

export default useClickOutside;