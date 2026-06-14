import 'dotenv/config';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { setupSockets } from './sockets';

const PORT = parseInt(process.env.PORT ?? '3001');

const httpServer = createServer(app);

// ─── Socket.io Setup ──────────────────────────────────────────────────────────
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupSockets(io);

// ─── Start Server ─────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log('\n🏛️  Smart Campus API Server');
  console.log(`✅  Running on http://localhost:${PORT}`);
  console.log(`📡  Socket.io ready`);
  console.log(`🌍  Client: ${process.env.CLIENT_URL}`);
  console.log(`📊  Environment: ${process.env.NODE_ENV}\n`);
});

export { io };
