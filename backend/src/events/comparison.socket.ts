/**
 * Socket.IO Event Handlers for Product Comparison
 * Real-time collaboration and updates for product comparisons
 */

import { Server, Socket } from 'socket.io';
import ProductComparison from '../models/ProductComparison.model.js';

interface CollaborativeUser {
  userId: string;
  name: string;
  avatar?: string;
  socketId: string;
}

interface ComparisonRoom {
  comparisonId: string;
  participants: Map<string, CollaborativeUser>;
  lastActivity: Date;
}

// Store active comparison rooms
const activeRooms = new Map<string, ComparisonRoom>();

/**
 * Initialize comparison socket events
 */
export const initializeComparisonSocket = (io: Server) => {
  const comparisonNamespace = io.of('/comparison');

  comparisonNamespace.on('connection', (socket: Socket) => {
    console.log(`Comparison socket connected: ${socket.id}`);

    // Join comparison room
    socket.on('join_comparison', async (data: { 
      comparisonId: string; 
      userId?: string; 
      userName?: string;
      userAvatar?: string;
    }) => {
      try {
        const { comparisonId, userId, userName, userAvatar } = data;

        // Verify comparison exists
        const comparison = await ProductComparison.findById(comparisonId);
        if (!comparison) {
          socket.emit('error', { message: 'Comparison not found' });
          return;
        }

        // Join socket room
        socket.join(comparisonId);

        // Get or create room
        let room = activeRooms.get(comparisonId);
        if (!room) {
          room = {
            comparisonId,
            participants: new Map(),
            lastActivity: new Date()
          };
          activeRooms.set(comparisonId, room);
        }

        // Add user to participants
        const participant: CollaborativeUser = {
          userId: userId || socket.id,
          name: userName || 'Anonymous User',
          avatar: userAvatar,
          socketId: socket.id
        };
        room.participants.set(socket.id, participant);
        room.lastActivity = new Date();

        // Notify other participants
        socket.to(comparisonId).emit('user_joined', {
          participant,
          totalParticipants: room.participants.size
        });

        // Send current participants list to joining user
        socket.emit('participants_list', {
          participants: Array.from(room.participants.values()),
          comparisonId
        });

        console.log(`User ${participant.name} joined comparison ${comparisonId}`);
      } catch (error) {
        console.error('Error joining comparison:', error);
        socket.emit('error', { message: 'Failed to join comparison' });
      }
    });

    // Leave comparison room
    socket.on('leave_comparison', (data: { comparisonId: string }) => {
      const { comparisonId } = data;
      handleLeaveComparison(socket, comparisonId);
    });

    // Broadcast comparison update
    socket.on('comparison_update', async (data: {
      comparisonId: string;
      update: any;
      userId?: string;
    }) => {
      try {
        const { comparisonId, update, userId } = data;

        // Update room activity
        const room = activeRooms.get(comparisonId);
        if (room) {
          room.lastActivity = new Date();
        }

        // Broadcast to other users in the room
        socket.to(comparisonId).emit('comparison_updated', {
          comparisonId,
          update,
          updatedBy: userId || socket.id,
          timestamp: new Date()
        });

        console.log(`Comparison ${comparisonId} updated by ${userId || socket.id}`);
      } catch (error) {
        console.error('Error updating comparison:', error);
        socket.emit('error', { message: 'Failed to update comparison' });
      }
    });

    // Product added to comparison
    socket.on('product_added', async (data: {
      comparisonId: string;
      productId: string;
      userId?: string;
    }) => {
      try {
        const { comparisonId, productId, userId } = data;

        // Broadcast to room
        socket.to(comparisonId).emit('product_added_event', {
          comparisonId,
          productId,
          addedBy: userId || socket.id,
          timestamp: new Date()
        });

        console.log(`Product ${productId} added to comparison ${comparisonId}`);
      } catch (error) {
        console.error('Error broadcasting product add:', error);
      }
    });

    // Product removed from comparison
    socket.on('product_removed', async (data: {
      comparisonId: string;
      productId: string;
      userId?: string;
    }) => {
      try {
        const { comparisonId, productId, userId } = data;

        // Broadcast to room
        socket.to(comparisonId).emit('product_removed_event', {
          comparisonId,
          productId,
          removedBy: userId || socket.id,
          timestamp: new Date()
        });

        console.log(`Product ${productId} removed from comparison ${comparisonId}`);
      } catch (error) {
        console.error('Error broadcasting product remove:', error);
      }
    });

    // Comparison shared
    socket.on('comparison_shared', (data: {
      comparisonId: string;
      shareData: any;
    }) => {
      const { comparisonId, shareData } = data;

      // Broadcast to room
      socket.to(comparisonId).emit('comparison_shared', {
        comparisonId,
        shareData,
        timestamp: new Date()
      });
    });

    // Typing indicator
    socket.on('user_typing', (data: {
      comparisonId: string;
      userId: string;
      userName: string;
      field?: string;
    }) => {
      const { comparisonId, userId, userName, field } = data;

      // Broadcast to others in room
      socket.to(comparisonId).emit('user_typing_event', {
        userId,
        userName,
        field,
        timestamp: new Date()
      });
    });

    // User cursor position (for collaborative editing)
    socket.on('cursor_position', (data: {
      comparisonId: string;
      userId: string;
      position: { x: number; y: number };
    }) => {
      const { comparisonId, userId, position } = data;

      // Broadcast cursor position to others
      socket.to(comparisonId).emit('cursor_moved', {
        userId,
        position
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Comparison socket disconnected: ${socket.id}`);
      handleDisconnect(socket);
    });
  });

  // Cleanup stale rooms every 5 minutes
  setInterval(() => {
    cleanupStaleRooms();
  }, 5 * 60 * 1000);
};

/**
 * Handle user leaving comparison
 */
function handleLeaveComparison(socket: Socket, comparisonId: string) {
  const room = activeRooms.get(comparisonId);
  if (room) {
    const participant = room.participants.get(socket.id);
    room.participants.delete(socket.id);

    // Notify others
    socket.to(comparisonId).emit('user_left', {
      userId: participant?.userId,
      userName: participant?.name,
      totalParticipants: room.participants.size
    });

    // Remove room if empty
    if (room.participants.size === 0) {
      activeRooms.delete(comparisonId);
      console.log(`Removed empty room: ${comparisonId}`);
    }
  }

  socket.leave(comparisonId);
  console.log(`Socket ${socket.id} left comparison ${comparisonId}`);
}

/**
 * Handle socket disconnect
 */
function handleDisconnect(socket: Socket) {
  // Find and remove user from all rooms
  activeRooms.forEach((room, comparisonId) => {
    if (room.participants.has(socket.id)) {
      const participant = room.participants.get(socket.id);
      room.participants.delete(socket.id);

      // Notify others
      socket.to(comparisonId).emit('user_left', {
        userId: participant?.userId,
        userName: participant?.name,
        totalParticipants: room.participants.size
      });

      // Remove room if empty
      if (room.participants.size === 0) {
        activeRooms.delete(comparisonId);
      }
    }
  });
}

/**
 * Cleanup rooms with no activity for 30 minutes
 */
function cleanupStaleRooms() {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  activeRooms.forEach((room, comparisonId) => {
    if (room.lastActivity < thirtyMinutesAgo && room.participants.size === 0) {
      activeRooms.delete(comparisonId);
      console.log(`Cleaned up stale room: ${comparisonId}`);
    }
  });
}

/**
 * Get active room info
 */
export const getActiveRoomInfo = (comparisonId: string) => {
  const room = activeRooms.get(comparisonId);
  if (!room) return null;

  return {
    comparisonId: room.comparisonId,
    participants: Array.from(room.participants.values()),
    lastActivity: room.lastActivity,
    activeUsers: room.participants.size
  };
};

/**
 * Get all active rooms
 */
export const getAllActiveRooms = () => {
  const rooms: any[] = [];
  activeRooms.forEach((room, comparisonId) => {
    rooms.push({
      comparisonId,
      activeUsers: room.participants.size,
      lastActivity: room.lastActivity
    });
  });
  return rooms;
};

export default { initializeComparisonSocket, getActiveRoomInfo, getAllActiveRooms };
