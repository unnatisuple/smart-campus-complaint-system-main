import { Server } from 'socket.io';

interface ActiveUser {
  userId: string;
  role: string;
  socketId: string;
}

const activeUsers = new Map<string, ActiveUser>();

export const setupSockets = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── Join user room on authentication ───────────────────────────────────
    socket.on('user:join', (data: { userId: string; role: string }) => {
      const { userId, role } = data;
      activeUsers.set(socket.id, { userId, role, socketId: socket.id });
      socket.join(`user:${userId}`);
      socket.join(`role:${role}`);
      console.log(`👤 User ${userId} (${role}) joined their room`);

      // Emit active user count to admins
      io.to('role:admin').emit('admin:user_count', { count: activeUsers.size });
    });

    // ─── Complaint Events ────────────────────────────────────────────────────
    socket.on('complaint:new', (data) => {
      // Notify all admins of new complaint
      io.to('role:admin').emit('complaint:new', data);
      console.log(`📝 New complaint submitted: ${data.complaintNo}`);
    });

    socket.on('complaint:assigned', (data) => {
      // Notify student that their complaint was assigned
      io.to(`user:${data.studentId}`).emit('complaint:assigned', data);
      // Notify the staff member
      io.to(`user:${data.staffId}`).emit('task:assigned', data);
      console.log(`👷 Complaint ${data.complaintNo} assigned to ${data.staffName}`);
    });

    socket.on('complaint:status_updated', (data) => {
      // Notify student of status change
      io.to(`user:${data.studentId}`).emit('complaint:status_updated', data);
      // Update admin dashboard in real time
      io.to('role:admin').emit('admin:dashboard_update', data);
    });

    socket.on('complaint:resolved', (data) => {
      // Notify student + celebration
      io.to(`user:${data.studentId}`).emit('complaint:resolved', data);
      io.to('role:admin').emit('admin:dashboard_update', data);
    });

    // ─── Notification ────────────────────────────────────────────────────────
    socket.on('notification:send', (data: { userId: string; notification: object }) => {
      io.to(`user:${data.userId}`).emit('notification:new', data.notification);
    });

    // ─── Dashboard Live Updates ──────────────────────────────────────────────
    socket.on('request:dashboard_data', () => {
      socket.emit('admin:dashboard_update', { type: 'ping', timestamp: new Date().toISOString() });
    });

    // ─── Disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        activeUsers.delete(socket.id);
        io.to('role:admin').emit('admin:user_count', { count: activeUsers.size });
        console.log(`🔌 Socket disconnected: ${socket.id} (${user.userId})`);
      }
    });
  });
};

// ─── Emit helper (call from controllers) ──────────────────────────────────────
export const emitToUser = (io: Server, userId: string, event: string, data: object) => {
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToRole = (io: Server, role: string, event: string, data: object) => {
  io.to(`role:${role}`).emit(event, data);
};
