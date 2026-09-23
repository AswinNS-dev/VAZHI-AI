import type { TrafficFrame } from '../types/traffic';
import { useTrafficStore } from '../store/trafficStore';

class WebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectTimer: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 30;
  private isIntentionallyClosed = false;

  private getUrl(): string {
    const wsUrl = import.meta.env.VITE_WS_URL;
    if (wsUrl) return wsUrl;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    return `${protocol}//${host}:8000/ws/traffic`;
  }

  public connect() {
    this.isIntentionallyClosed = false;
    const url = this.getUrl();

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        useTrafficStore.getState().setConnected(true);
      };

      this.socket.onmessage = (event) => {
        try {
          const frame: TrafficFrame = JSON.parse(event.data);
          useTrafficStore.getState().setFrame(frame);
        } catch (e) {
          console.error('[WS] Failed to parse frame:', e);
        }
      };

      this.socket.onerror = (err) => {
        console.warn('[WS] Error:', err);
      };

      this.socket.onclose = () => {
        useTrafficStore.getState().setConnected(false);
        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch (e) {
      console.error('[WS] Connection error:', e);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[WS] Max reconnect attempts reached.');
      return;
    }

    const backoff = Math.min(5000, 1000 * Math.pow(1.5, this.reconnectAttempts));
    this.reconnectAttempts++;

    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, backoff);
  }

  public disconnect() {
    this.isIntentionallyClosed = true;
    clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    useTrafficStore.getState().setConnected(false);
  }
}

export const wsClient = new WebSocketClient();
