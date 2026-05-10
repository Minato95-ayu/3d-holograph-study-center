import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  connect() {
    if (this.socket?.connected) return this.socket;

    this.socket = io("http://localhost:8888", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("🟢 Connected to Studo AI Brain");
      this.reconnectAttempts = 0;
    });

    this.socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    this.socket.on("disconnect", (reason) => {
      console.warn("🔴 Socket disconnected:", reason);
    });

    return this.socket;
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Cannot emit ${event}: Socket not connected`);
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const wsService = new WebSocketService();
