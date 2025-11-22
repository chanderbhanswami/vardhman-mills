import { useRef, useEffect, useCallback, useState, useMemo } from 'react';

export interface WebSocketOptions {
  protocols?: string | string[];
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeat?: boolean;
  heartbeatInterval?: number;
  heartbeatMessage?: string;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onReconnect?: (attempt: number) => void;
  onReconnectFailed?: () => void;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  readyState: number;
  lastMessage: MessageEvent | null;
  error: Event | null;
  reconnectCount: number;
}

export interface WebSocketReturn {
  socket: WebSocket | null;
  state: WebSocketState;
  sendMessage: (message: string | ArrayBuffer | Blob) => boolean;
  sendJSON: <T>(data: T) => boolean;
  close: (code?: number, reason?: string) => void;
  reconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  lastMessage: MessageEvent | null;
  error: Event | null;
}

export const useWebSocket = (url: string, options: WebSocketOptions = {}): WebSocketReturn => {
  const {
    protocols,
    reconnect = true,
    maxReconnectAttempts = 3,
    reconnectInterval = 3000,
    heartbeat = false,
    heartbeatInterval = 30000,
    heartbeatMessage = 'ping',
    onOpen,
    onClose,
    onError,
    onMessage,
    onReconnect,
    onReconnectFailed,
  } = options;

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);
  const isManualClose = useRef(false);

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    readyState: WebSocket.CLOSED,
    lastMessage: null,
    error: null,
    reconnectCount: 0,
  });

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const clearHeartbeatInterval = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    if (heartbeat && socketRef.current?.readyState === WebSocket.OPEN) {
      clearHeartbeatInterval();
      heartbeatIntervalRef.current = setInterval(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(heartbeatMessage);
        }
      }, heartbeatInterval);
    }
  }, [heartbeat, heartbeatInterval, heartbeatMessage, clearHeartbeatInterval]);

  const updateState = useCallback((updates: Partial<WebSocketState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    updateState({ 
      isConnecting: true, 
      isReconnecting: reconnectCountRef.current > 0,
      error: null 
    });

    try {
      const socket = new WebSocket(url, protocols);
      socketRef.current = socket;

      socket.onopen = (event) => {
        clearReconnectTimeout();
        reconnectCountRef.current = 0;
        updateState({
          isConnected: true,
          isConnecting: false,
          isReconnecting: false,
          readyState: socket.readyState,
          reconnectCount: 0,
        });
        startHeartbeat();
        onOpen?.(event);
      };

      socket.onclose = (event) => {
        clearHeartbeatInterval();
        updateState({
          isConnected: false,
          isConnecting: false,
          readyState: socket.readyState,
        });
        
        onClose?.(event);

        // Attempt reconnection if not manually closed and reconnect is enabled
        if (!isManualClose.current && reconnect && reconnectCountRef.current < maxReconnectAttempts) {
          reconnectCountRef.current += 1;
          updateState({ 
            isReconnecting: true,
            reconnectCount: reconnectCountRef.current 
          });
          
          onReconnect?.(reconnectCountRef.current);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectCountRef.current >= maxReconnectAttempts) {
          updateState({ isReconnecting: false });
          onReconnectFailed?.();
        }
      };

      socket.onerror = (event) => {
        updateState({ 
          error: event,
          isConnecting: false,
          isReconnecting: false 
        });
        onError?.(event);
      };

      socket.onmessage = (event) => {
        updateState({ lastMessage: event });
        onMessage?.(event);
      };

    } catch (error) {
      const errorEvent = error instanceof Event ? error : new Event('error');
      updateState({ 
        error: errorEvent,
        isConnecting: false,
        isReconnecting: false 
      });
      onError?.(errorEvent);
    }
  }, [
    url,
    protocols,
    reconnect,
    maxReconnectAttempts,
    reconnectInterval,
    onOpen,
    onClose,
    onError,
    onMessage,
    onReconnect,
    onReconnectFailed,
    updateState,
    clearReconnectTimeout,
    clearHeartbeatInterval,
    startHeartbeat,
  ]);

  const sendMessage = useCallback((message: string | ArrayBuffer | Blob): boolean => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(message);
        return true;
      } catch (error) {
        console.error('Failed to send message:', error);
        return false;
      }
    }
    return false;
  }, []);

  const sendJSON = useCallback(<T,>(data: T): boolean => {
    try {
      const message = JSON.stringify(data);
      return sendMessage(message);
    } catch (error) {
      console.error('Failed to serialize JSON:', error);
      return false;
    }
  }, [sendMessage]);

  const close = useCallback((code?: number, reason?: string) => {
    isManualClose.current = true;
    clearReconnectTimeout();
    clearHeartbeatInterval();
    
    if (socketRef.current) {
      socketRef.current.close(code, reason);
      socketRef.current = null;
    }
    
    updateState({
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      readyState: WebSocket.CLOSED,
    });
  }, [clearReconnectTimeout, clearHeartbeatInterval, updateState]);

  const reconnectManual = useCallback(() => {
    isManualClose.current = false;
    reconnectCountRef.current = 0;
    close();
    setTimeout(connect, 100);
  }, [close, connect]);

  // Auto-connect on mount
  useEffect(() => {
    isManualClose.current = false;
    connect();
    
    return () => {
      isManualClose.current = true;
      clearReconnectTimeout();
      clearHeartbeatInterval();
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect, clearReconnectTimeout, clearHeartbeatInterval]);

  // Update ready state when socket changes
  useEffect(() => {
    if (socketRef.current) {
      updateState({ readyState: socketRef.current.readyState });
    }
  }, [socketRef.current?.readyState, updateState]);

  const memoizedReturn = useMemo((): WebSocketReturn => ({
    socket: socketRef.current,
    state,
    sendMessage,
    sendJSON,
    close,
    reconnect: reconnectManual,
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    isReconnecting: state.isReconnecting,
    lastMessage: state.lastMessage,
    error: state.error,
  }), [
    state,
    sendMessage,
    sendJSON,
    close,
    reconnectManual,
  ]);

  return memoizedReturn;
};

// Specialized hooks for common WebSocket patterns

// Real-time notifications
export const useWebSocketNotifications = (url: string) => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>>([]);

  const webSocket = useWebSocket(url, {
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          setNotifications(prev => [
            {
              id: data.id || Date.now().toString(),
              type: data.notificationType || 'info',
              message: data.message,
              timestamp: new Date(data.timestamp || Date.now()),
              read: false,
            },
            ...prev,
          ]);
        }
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    },
  });

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    ...webSocket,
    notifications,
    markAsRead,
    clearNotifications,
    unreadCount: notifications.filter(n => !n.read).length,
  };
};

// Chat functionality
export const useWebSocketChat = (url: string) => {
  const [messages, setMessages] = useState<Array<{
    id: string;
    user: string;
    message: string;
    timestamp: Date;
  }>>([]);

  const webSocket = useWebSocket(url, {
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          setMessages(prev => [...prev, {
            id: data.id || Date.now().toString(),
            user: data.user,
            message: data.message,
            timestamp: new Date(data.timestamp || Date.now()),
          }]);
        }
      } catch (error) {
        console.error('Failed to parse chat message:', error);
      }
    },
  });

  const sendChatMessage = useCallback((message: string, user: string) => {
    return webSocket.sendJSON({
      type: 'message',
      user,
      message,
      timestamp: new Date().toISOString(),
    });
  }, [webSocket]);

  return {
    ...webSocket,
    messages,
    sendChatMessage,
  };
};

export default useWebSocket;