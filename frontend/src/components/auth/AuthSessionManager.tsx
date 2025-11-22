"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  User, 
  Smartphone,
  Key,
  RefreshCw
} from 'lucide-react';


interface ExtendedAuthSession {
  id: string;
  userId: string;
  sessionToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scope?: string[];
  provider?: string;
  providerAccountId?: string;
  tokenType: 'Bearer' | 'Basic';
  deviceType?: string;
  location?: string;
  ipAddress?: string;
  lastActivity?: string;
  deviceInfo?: string | { name: string; type: string; };
}

interface AuthSessionManagerProps {
  currentSession?: ExtendedAuthSession;
  onSessionExpire?: () => void;
  className?: string;
}

interface SecurityAlert {
  id: string;
  type: 'login_attempt' | 'password_change' | 'suspicious_activity' | 'device_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  location?: string;
  deviceInfo?: string;
  ipAddress?: string;
}

interface SessionData {
  sessions: ExtendedAuthSession[];
  activeSessions: number;
  totalDevices: number;
  securityAlerts: SecurityAlert[];
  lastActivity: Date;
}

const AuthSessionManager: React.FC<AuthSessionManagerProps> = ({
  currentSession,
  onSessionExpire,
  className = ""
}) => {
  const [sessionData, setSessionData] = useState<SessionData>({
    sessions: [],
    activeSessions: 0,
    totalDevices: 0,
    securityAlerts: [],
    lastActivity: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showSessions, setShowSessions] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch session data
  const fetchSessionData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/sessions');
      const data = await response.json();
      
      if (response.ok) {
        setSessionData(data);
      }
    } catch (error) {
      console.error('Failed to fetch session data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh session data
  const refreshSessions = useCallback(async () => {
    setIsRefreshing(true);
    await fetchSessionData();
    setIsRefreshing(false);
  }, [fetchSessionData]);

  // Revoke session
  const revokeSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSessionData(prev => ({
          ...prev,
          sessions: prev.sessions.filter(s => s.id !== sessionId),
          activeSessions: prev.activeSessions - 1
        }));
      }
    } catch (error) {
      console.error('Failed to revoke session:', error);
    }
  }, []);

  // Revoke all sessions except current
  const revokeAllOtherSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/sessions/revoke-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keepCurrent: true,
          currentSessionId: currentSession?.sessionToken 
        })
      });

      if (response.ok) {
        await refreshSessions();
      }
    } catch (error) {
      console.error('Failed to revoke sessions:', error);
    }
  }, [currentSession?.sessionToken, refreshSessions]);

  // Monitor session expiration
  useEffect(() => {
    if (!currentSession?.expiresAt) return;

    const expiryTime = new Date(currentSession.expiresAt).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;

    if (timeUntilExpiry > 0) {
      const timeout = setTimeout(() => {
        onSessionExpire?.();
      }, timeUntilExpiry);

      return () => clearTimeout(timeout);
    }
  }, [currentSession, onSessionExpire]);

  // Poll for updates
  useEffect(() => {
    fetchSessionData();
    
    const interval = setInterval(fetchSessionData, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [fetchSessionData]);

  // Get security level based on session data
  const getSecurityLevel = () => {
    const criticalAlerts = sessionData.securityAlerts.filter(a => a.severity === 'critical').length;
    const highAlerts = sessionData.securityAlerts.filter(a => a.severity === 'high').length;
    
    if (criticalAlerts > 0) return { level: 'critical', color: 'red' };
    if (highAlerts > 0) return { level: 'high', color: 'orange' };
    if (sessionData.activeSessions > 3) return { level: 'medium', color: 'yellow' };
    return { level: 'good', color: 'green' };
  };

  const securityLevel = getSecurityLevel();

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile': return Smartphone;
      case 'desktop': return User;
      default: return User;
    }
  };

  const getAlertIcon = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'login_attempt': return Key;
      case 'password_change': return Shield;
      case 'suspicious_activity': return AlertTriangle;
      case 'device_change': return Smartphone;
      default: return AlertTriangle;
    }
  };

  if (isLoading) {
    return (
      <div className={`auth-session-manager ${className}`}>
        <div className="flex items-center justify-center p-6">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading session data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`auth-session-manager bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className={`w-6 h-6 text-${securityLevel.color}-600`} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Account Security
              </h3>
              <p className="text-sm text-gray-600">
                Manage your active sessions and security settings
              </p>
            </div>
          </div>
          
          <button
            onClick={refreshSessions}
            disabled={isRefreshing}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Security Overview */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full bg-${securityLevel.color}-500`} />
            <div>
              <p className="text-sm font-medium text-gray-900">Security Status</p>
              <p className={`text-sm text-${securityLevel.color}-600 capitalize`}>
                {securityLevel.level}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Active Sessions</p>
              <p className="text-sm text-gray-600">
                {sessionData.activeSessions} of {sessionData.totalDevices} devices
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Last Activity</p>
              <p className="text-sm text-gray-600">
                {formatTimeAgo(sessionData.lastActivity)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      {sessionData.securityAlerts.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">
              Security Alerts ({sessionData.securityAlerts.length})
            </h4>
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showAlerts ? 'Hide' : 'Show'} Alerts
            </button>
          </div>
          
          <AnimatePresence>
            {showAlerts && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3"
              >
                {sessionData.securityAlerts.slice(0, 5).map((alert, index) => {
                  const AlertIcon = getAlertIcon(alert.type);
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-start space-x-3 p-3 rounded-lg border ${
                        alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                        alert.severity === 'high' ? 'border-orange-200 bg-orange-50' :
                        alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                        'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <AlertIcon className={`w-5 h-5 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-600' :
                        alert.severity === 'high' ? 'text-orange-600' :
                        alert.severity === 'medium' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {alert.message}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>{formatTimeAgo(alert.timestamp)}</span>
                          {alert.location && <span>from {alert.location}</span>}
                          {alert.ipAddress && <span>IP: {alert.ipAddress}</span>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Active Sessions */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">
            Active Sessions ({sessionData.sessions.length})
          </h4>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSessions(!showSessions)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showSessions ? 'Hide' : 'Show'} Sessions
            </button>
            {sessionData.activeSessions > 1 && (
              <button
                onClick={revokeAllOtherSessions}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Sign Out All Others
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showSessions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3"
            >
              {sessionData.sessions.map((session, index) => {
                const DeviceIcon = getDeviceIcon(session.deviceType || 'desktop');
                const isCurrentSession = session.id === currentSession?.id;
                
                return (
                  <motion.div
                    key={session.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isCurrentSession ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <DeviceIcon className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {typeof session.deviceInfo === 'object' && session.deviceInfo ? session.deviceInfo.name : (session.deviceInfo || session.deviceType || 'Unknown Device')}
                          </p>
                          {isCurrentSession && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>{session.location || 'Unknown location'}</span>
                          <span>IP: {session.ipAddress}</span>
                          <span>Last seen: {formatTimeAgo(new Date(session.lastActivity || session.expiresAt))}</span>
                        </div>
                      </div>
                    </div>
                    
                    {!isCurrentSession && (
                      <button
                        onClick={() => revokeSession(session.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Sign Out
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthSessionManager;