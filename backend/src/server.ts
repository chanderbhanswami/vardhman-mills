import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config();

import app from './app.js';
import { initializeComparisonSocket } from './events/comparison.socket.js';

const DB = process.env.MONGODB_URI?.replace('<password>', process.env.MONGODB_PASSWORD || '') || '';

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.error('DB connection error:', err));

const port = Number(process.env.PORT) || 5000;

try {
  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        process.env.ADMIN_URL || 'http://localhost:3001'
      ],
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  // Initialize comparison namespace
  initializeComparisonSocket(io);

  console.log('✅ Socket.IO initialized');
  console.log('🔌 Comparison namespace: /comparison');

  const server = httpServer.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${port}`);
    console.log(`🌐 Server running on port ${port}`);
    console.log('✅ Server successfully bound to port');
    console.log('🔌 WebSocket server ready for connections');
  });

  server.on('error', (error: any) => {
    console.error('Server error:', error);
  });

  process.on('unhandledRejection', (err: any) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });

  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}