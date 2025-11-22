'use client';

import React, { useState, useRef, useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import {
  CommandLineIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  HashtagIcon,
  DocumentIcon,
  FolderIcon,
  UserIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

// Command palette variants
const commandPaletteVariants = cva(
  'fixed inset-0 z-50 flex items-start justify-center',
  {
    variants: {
      position: {
        center: 'items-center',
        top: 'pt-16',
        'top-center': 'items-start pt-24',
      },
    },
    defaultVariants: {
      position: 'top-center',
    },
  }
);

// Types
export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  keywords?: string[];
  category?: string;
  shortcut?: string[];
  action?: () => void | Promise<void>;
  href?: string;
  disabled?: boolean;
  priority?: number;
  metadata?: Record<string, unknown>;
}

export interface CommandGroup {
  id: string;
  title: string;
  items: CommandItem[];
  priority?: number;
}

export interface CommandPaletteProps extends VariantProps<typeof commandPaletteVariants> {
  isOpen: boolean;
  onClose: () => void;
  commands?: CommandItem[];
  groups?: CommandGroup[];
  onCommandSelect?: (command: CommandItem) => void;
  placeholder?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  showRecentCommands?: boolean;
  showShortcuts?: boolean;
  maxResults?: number;
  searchThreshold?: number;
  className?: string;
  overlayClassName?: string;
  panelClassName?: string;
}

export interface QuickActionsProps {
  actions: Array<{
    id: string;
    title: string;
    icon?: React.ReactNode;
    shortcut?: string[];
    action: () => void;
    category?: string;
  }>;
  className?: string;
}

export interface CommandSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

export interface RecentCommandsProps {
  commands: CommandItem[];
  onCommandSelect: (command: CommandItem) => void;
  maxItems?: number;
  className?: string;
}

// Context
interface CommandPaletteContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  recentCommands: CommandItem[];
  addRecentCommand: (command: CommandItem) => void;
  clearRecentCommands: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | null>(null);

export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error('Command palette components must be used within CommandPaletteProvider');
  }
  return context;
};

// Provider
export const CommandPaletteProvider: React.FC<{
  children: React.ReactNode;
  maxRecentCommands?: number;
}> = ({ children, maxRecentCommands = 10 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentCommands, setRecentCommands] = useState<CommandItem[]>([]);

  // Load recent commands from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('command-palette-recent');
      if (stored) {
        setRecentCommands(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load recent commands:', error);
    }
  }, []);

  const addRecentCommand = useCallback((command: CommandItem) => {
    setRecentCommands((prev) => {
      const filtered = prev.filter(cmd => cmd.id !== command.id);
      const updated = [command, ...filtered].slice(0, maxRecentCommands);
      
      try {
        localStorage.setItem('command-palette-recent', JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save recent commands:', error);
      }
      
      return updated;
    });
  }, [maxRecentCommands]);

  const clearRecentCommands = useCallback(() => {
    setRecentCommands([]);
    try {
      localStorage.removeItem('command-palette-recent');
    } catch (error) {
      console.warn('Failed to clear recent commands:', error);
    }
  }, []);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const contextValue: CommandPaletteContextType = {
    isOpen,
    setIsOpen,
    recentCommands,
    addRecentCommand,
    clearRecentCommands,
  };

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
    </CommandPaletteContext.Provider>
  );
};

// Utility functions
const fuzzySearch = (items: CommandItem[], query: string, threshold: number = 0.3): CommandItem[] => {
  if (!query.trim()) return items;

  const searchTerms = query.toLowerCase().split(' ').filter(Boolean);
  
  return items
    .map(item => {
      let score = 0;
      const searchableText = `${item.title} ${item.subtitle || ''} ${item.description || ''} ${(item.keywords || []).join(' ')}`.toLowerCase();
      
      // Exact matches get highest priority
      if (searchableText.includes(query.toLowerCase())) {
        score += 2;
      }
      
      // Check individual terms
      searchTerms.forEach(term => {
        if (searchableText.includes(term)) {
          score += 1;
        }
        
        // Bonus for title matches
        if (item.title.toLowerCase().includes(term)) {
          score += 0.5;
        }
      });
      
      return { item, score };
    })
    .filter(({ score }) => score > threshold)
    .sort((a, b) => {
      // Sort by score first, then by priority, then alphabetically
      if (b.score !== a.score) return b.score - a.score;
      if ((b.item.priority || 0) !== (a.item.priority || 0)) return (b.item.priority || 0) - (a.item.priority || 0);
      return a.item.title.localeCompare(b.item.title);
    })
    .map(({ item }) => item);
};

const groupCommands = (commands: CommandItem[]): CommandGroup[] => {
  const grouped = commands.reduce((acc, command) => {
    const category = command.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(command);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  return Object.entries(grouped).map(([title, items]) => ({
    id: title.toLowerCase().replace(/\s+/g, '-'),
    title,
    items,
  }));
};

// Command Search component
export const CommandSearch: React.FC<CommandSearchProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type a command or search...',
  className,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className={cn('relative flex items-center border-b border-border', className)}>
      <MagnifyingGlassIcon className="absolute left-4 h-5 w-5 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-4 bg-transparent text-lg outline-none"
        autoFocus
      />
    </div>
  );
};

// Command Item component
const CommandItemComponent: React.FC<{
  command: CommandItem;
  isSelected: boolean;
  onSelect: (command: CommandItem) => void;
}> = ({ command, isSelected, onSelect }) => {
  const handleClick = () => {
    onSelect(command);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSelect(command);
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{
        backgroundColor: isSelected ? 'hsl(var(--accent))' : 'transparent',
      }}
      transition={{ duration: 0.1 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 cursor-pointer',
        command.disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={!command.disabled ? handleClick : undefined}
      onKeyDown={!command.disabled ? handleKeyDown : undefined}
      tabIndex={!command.disabled ? 0 : -1}
      role="option"
      aria-selected={isSelected}
      aria-disabled={command.disabled}
    >
      {/* Icon */}
      {command.icon && (
        <div className="flex-shrink-0 w-5 h-5 text-muted-foreground">
          {command.icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-medium truncate">{command.title}</div>
          {command.subtitle && (
            <div className="text-sm text-muted-foreground truncate">
              {command.subtitle}
            </div>
          )}
        </div>
        {command.description && (
          <div className="text-sm text-muted-foreground truncate mt-1">
            {command.description}
          </div>
        )}
      </div>

      {/* Shortcut */}
      {command.shortcut && command.shortcut.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {command.shortcut.map((key, index) => (
            <React.Fragment key={key}>
              {index > 0 && <span>+</span>}
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">
                {key}
              </kbd>
            </React.Fragment>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Recent Commands component
export const RecentCommands: React.FC<RecentCommandsProps> = ({
  commands,
  onCommandSelect,
  maxItems = 5,
  className,
}) => {
  if (commands.length === 0) return null;

  const displayCommands = commands.slice(0, maxItems);

  return (
    <div className={className}>
      <div className="flex items-center justify-between px-4 py-2 text-sm text-muted-foreground border-b border-border">
        <span>Recent</span>
        <ClockIcon className="h-4 w-4" />
      </div>
      {displayCommands.map((command) => (
        <CommandItemComponent
          key={`recent-${command.id}`}
          command={command}
          isSelected={false}
          onSelect={onCommandSelect}
        />
      ))}
    </div>
  );
};

// Quick Actions component
export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  className,
}) => {
  const { setIsOpen, addRecentCommand } = useCommandPalette();

  const handleActionClick = (action: typeof actions[0]) => {
    const command: CommandItem = {
      id: action.id,
      title: action.title,
      icon: action.icon,
      shortcut: action.shortcut,
      category: action.category || 'Quick Actions',
    };
    
    addRecentCommand(command);
    action.action();
    setIsOpen(false);
  };

  return (
    <div className={cn('grid grid-cols-2 gap-2 p-4', className)}>
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => handleActionClick(action)}
          className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
        >
          {action.icon && (
            <div className="w-4 h-4 text-muted-foreground">
              {action.icon}
            </div>
          )}
          <span className="text-sm font-medium truncate">{action.title}</span>
          {action.shortcut && (
            <div className="ml-auto text-xs text-muted-foreground">
              {action.shortcut.join('+')}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

// Main Command Palette component
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands = [],
  groups = [],
  onCommandSelect,
  placeholder = 'Type a command or search...',
  emptyMessage = 'No commands found',
  loadingMessage = 'Loading commands...',
  showRecentCommands = true,
  showShortcuts = true,
  maxResults = 50,
  searchThreshold = 0.3,
  position = 'top-center',
  className,
  overlayClassName,
  panelClassName,
}) => {
  const { recentCommands, addRecentCommand } = useCommandPalette();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Combine commands and groups
  const allCommands = useMemo(() => {
    const combinedCommands = [...commands];
    groups.forEach(group => {
      combinedCommands.push(...group.items);
    });
    return combinedCommands;
  }, [commands, groups]);

  // Filter and search commands
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      return showRecentCommands && recentCommands.length > 0
        ? recentCommands.slice(0, 5)
        : allCommands.slice(0, maxResults);
    }

    return fuzzySearch(allCommands, query, searchThreshold).slice(0, maxResults);
  }, [allCommands, query, recentCommands, showRecentCommands, maxResults, searchThreshold]);

  // Group filtered commands
  const groupedCommands = useMemo(() => {
    if (!query.trim() && showRecentCommands && recentCommands.length > 0) {
      return [{ id: 'recent', title: 'Recent', items: recentCommands.slice(0, 5) }];
    }
    
    if (groups.length > 0 && query.trim()) {
      return groupCommands(filteredCommands);
    }
    
    return [{ id: 'all', title: 'Commands', items: filteredCommands }];
  }, [filteredCommands, query, groups, recentCommands, showRecentCommands]);

  // Handle command selection
  const handleCommandSelect = useCallback(async (command: CommandItem) => {
    if (command.disabled) return;

    setLoading(true);
    
    try {
      addRecentCommand(command);
      
      if (command.action) {
        await command.action();
      }
      
      if (command.href) {
        window.location.href = command.href;
      }
      
      onCommandSelect?.(command);
      onClose();
    } catch (error) {
      console.error('Command execution failed:', error);
    } finally {
      setLoading(false);
    }
  }, [addRecentCommand, onCommandSelect, onClose]);

  // Reset selection when commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const totalItems = filteredCommands.length;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % totalItems);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            handleCommandSelect(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose, handleCommandSelect]);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={cn(commandPaletteVariants({ position }), className)}>
      {/* Overlay */}
      <div
        className={cn('fixed inset-0 bg-background/80 backdrop-blur-sm', overlayClassName)}
        onClick={onClose}
      />
      
      {/* Panel */}
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.15 }}
        className={cn(
          'relative bg-popover border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-96 overflow-hidden',
          panelClassName
        )}
      >
        {/* Search Input */}
        <CommandSearch
          value={query}
          onChange={setQuery}
          placeholder={placeholder}
        />

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mr-3" />
              <span className="text-muted-foreground">{loadingMessage}</span>
            </div>
          )}

          {!loading && filteredCommands.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CommandLineIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">{emptyMessage}</p>
              {query && (
                <p className="text-sm text-muted-foreground mt-1">
                  Try searching for something else
                </p>
              )}
            </div>
          )}

          {!loading && groupedCommands.map((group) => (
            <div key={group.id}>
              {group.items.length > 0 && (
                <>
                  {groupedCommands.length > 1 && (
                    <div className="px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                      {group.title}
                    </div>
                  )}
                  {group.items.map((command, index) => {
                    const globalIndex = groupedCommands
                      .slice(0, groupedCommands.indexOf(group))
                      .reduce((acc, g) => acc + g.items.length, 0) + index;
                    
                    return (
                      <CommandItemComponent
                        key={command.id}
                        command={command}
                        isSelected={globalIndex === selectedIndex}
                        onSelect={handleCommandSelect}
                      />
                    );
                  })}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">⏎</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
          
          {showShortcuts && (
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">⌘K</kbd>
              <span>Toggle</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Command Palette Trigger
export const CommandPaletteTrigger: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const { setIsOpen } = useCommandPalette();

  return (
    <button
      type="button"
      onClick={() => setIsOpen(true)}
      className={cn(
        'flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border border-input rounded-md hover:bg-accent transition-colors',
        className
      )}
    >
      {children || (
        <>
          <MagnifyingGlassIcon className="h-4 w-4" />
          <span>Search commands...</span>
          <kbd className="ml-auto px-1.5 py-0.5 bg-muted rounded border border-border text-xs">
            ⌘K
          </kbd>
        </>
      )}
    </button>
  );
};

// Default command icons
export const CommandIcons = {
  Document: DocumentIcon,
  Folder: FolderIcon,
  User: UserIcon,
  Settings: Cog6ToothIcon,
  Search: MagnifyingGlassIcon,
  Command: CommandLineIcon,
  Hash: HashtagIcon,
  Clock: ClockIcon,
  Enter: ArrowDownIcon,
  ArrowUp: ArrowUpIcon,
  ArrowDown: ArrowDownIcon,
  Close: XMarkIcon,
};

export default CommandPalette;
