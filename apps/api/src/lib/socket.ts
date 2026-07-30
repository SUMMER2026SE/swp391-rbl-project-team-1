import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { prisma } from './prisma.js';


let ioInstance: Server | null = null;

export function initSocket(server: HTTPServer) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`[Socket] Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
      console.log(`[Socket] Socket ${socket.id} left room: ${roomId}`);
    });

    socket.on('join_user_room', (userId: string | number) => {
      socket.join(`user_${userId}`);
      console.log(`[Socket] Socket ${socket.id} joined personal room: user_${userId}`);
    });

    // Forum post thread live updates
    socket.on('join_post', (postId: string | number) => {
      const room = `post_${postId}`;
      socket.join(room);
      console.log(`[Socket] Socket ${socket.id} joined post thread: ${room}`);
    });

    socket.on('leave_post', (postId: string | number) => {
      const room = `post_${postId}`;
      socket.leave(room);
      console.log(`[Socket] Socket ${socket.id} left post thread: ${room}`);
    });

    socket.on('send_message', async (data: { id?: string | number; roomId: string; studentId: number; role: string; content: string; authorName?: string }) => {
      console.log(`[Socket] Message received for room ${data.roomId}:`, data.content);
      
      // Save message to database if it's a study group chat room
      if (data.roomId.startsWith('group_')) {
        const groupId = parseInt(data.roomId.replace('group_', ''), 10);
        if (!isNaN(groupId)) {
          try {
            await prisma.studyGroupChatMessage.create({
              data: {
                groupId: groupId,
                userId: data.studentId,
                role: data.role,
                content: data.content
              }
            });
            console.log(`[Socket] Saved chat message to DB for group ${groupId}`);
          } catch (err: any) {
            console.error('[Socket] Error saving chat message to DB:', err.message);
          }
        }
      }

      // Broadcast to room members
      io.to(data.roomId).emit('receive_message', {
        id: data.id || Date.now(),
        roomId: data.roomId,
        studentId: data.studentId,
        role: data.role,
        content: data.content,
        authorName: data.authorName,
        createdAt: new Date().toISOString()
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  return ioInstance;
}
