// Real-Time Multi-Device Synchronization Engine for RT Lab
// Supports BroadcastChannel (0ms), Server-Sent Events (SSE), and Cloud Sync

export type SyncEventType = 
  | 'NEW_INVOICE'
  | 'UPDATE_INVOICE'
  | 'DELETE_INVOICE'
  | 'REPORT_UPDATED'
  | 'CATALOG_SYNC'
  | 'HEARTBEAT';

export interface SyncPayload {
  type: SyncEventType;
  deviceId: string;
  timestamp: number;
  data: any;
}

const DEVICE_ID = typeof window !== 'undefined'
  ? (localStorage.getItem('rt_device_id') || (() => {
      const id = 'dev-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('rt_device_id', id);
      return id;
    })())
  : 'dev-server';

class RealtimeSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Array<(payload: SyncPayload) => void> = [];
  private eventSource: EventSource | null = null;
  private serverUrl: string = '';

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.channel = new BroadcastChannel('rt_lab_realtime_sync');
          this.channel.onmessage = (event) => {
            if (event.data && event.data.deviceId !== DEVICE_ID) {
              this.notifyListeners(event.data);
            }
          };
        }
      } catch (e) {
        console.warn('BroadcastChannel not available:', e);
      }

      // Check if server sync is available
      this.initServerSync();
    }
  }

  private initServerSync() {
    try {
      const customUrl = localStorage.getItem('rt_lab_sync_server_url') || '';
      const defaultUrl = window.location.origin.includes('run.app') ? window.location.origin : '';
      const targetUrl = customUrl || defaultUrl;
      
      if (targetUrl && 'EventSource' in window) {
        this.serverUrl = targetUrl;
        this.eventSource = new EventSource(`${targetUrl}/api/sync/events`);
        this.eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.deviceId !== DEVICE_ID) {
              this.notifyListeners(parsed);
            }
          } catch (e) {
            // Ignore parse errors
          }
        };
        this.eventSource.onerror = () => {
          // Reconnect handled automatically by EventSource
        };
      }
    } catch (e) {
      console.warn('Server sync init skipped:', e);
    }
  }

  public subscribe(callback: (payload: SyncPayload) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(payload: SyncPayload) {
    this.listeners.forEach(cb => {
      try {
        cb(payload);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  public broadcast(type: SyncEventType, data: any) {
    const payload: SyncPayload = {
      type,
      deviceId: DEVICE_ID,
      timestamp: Date.now(),
      data
    };

    // 1. Broadcast locally
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (e) {
        console.warn('Broadcast error:', e);
      }
    }

    // 2. Broadcast to server if connected
    if (this.serverUrl) {
      try {
        fetch(`${this.serverUrl}/api/sync/push`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch (e) {}
    }
  }

  public getDeviceId(): string {
    return DEVICE_ID;
  }
}

export const realtimeSync = new RealtimeSyncManager();
