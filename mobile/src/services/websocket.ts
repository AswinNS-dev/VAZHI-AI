import { WS_URL } from './api';
import { useTrafficStore } from '../store/trafficStore';
import { TrafficFrame } from '../types/traffic';

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 10000;
  private reconnectTimer: any = null;
  private shouldConnect = true;

  public connect() {
    this.shouldConnect = true;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    useTrafficStore.getState().setConnectionStatus('CONNECTING');

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        useTrafficStore.getState().setConnectionStatus('LIVE');
      };

      this.ws.onmessage = (event) => {
        try {
          const frame: TrafficFrame = JSON.parse(event.data);
          useTrafficStore.getState().setFrame(frame);
        } catch (err) {
          console.warn('Error parsing WebSocket frame:', err);
        }
      };

      this.ws.onclose = () => {
        useTrafficStore.getState().setConnectionStatus('CONNECTION LOST');
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        useTrafficStore.getState().setConnectionStatus('CONNECTION LOST');
        this.scheduleReconnect();
      };
    } catch (err) {
      useTrafficStore.getState().setConnectionStatus('CONNECTION LOST');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (!this.shouldConnect) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), this.maxReconnectDelay);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  public disconnect() {
    this.shouldConnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    useTrafficStore.getState().setConnectionStatus('CONNECTION LOST');
  }
}

export const wsClient = new WebSocketClient();
