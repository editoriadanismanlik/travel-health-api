class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;

  constructor() {
    this.connect();
  }

  private connect() {
    const token = localStorage.getItem(import.meta.env.VITE_JWT_STORAGE_KEY);
    if (!token) return;

    const wsUrl = `${import.meta.env.VITE_WS_URL}?token=${token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onerror = this.handleError.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
  }

  private handleOpen() {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
  }

  private handleClose() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectTimeout * this.reconnectAttempts);
    }
  }

  private handleError(error: Event) {
    console.error('WebSocket error:', error);
  }

  private handleMessage(event: MessageEvent) {
    const data = JSON.parse(event.data);
    // Handle different message types
    switch (data.type) {
      case 'NOTIFICATION':
        this.handleNotification(data.payload);
        break;
      // Add more message type handlers
    }
  }

  private handleNotification(notification: any) {
    // Implement notification handling
  }

  public send(type: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }
}

export const wsClient = new WebSocketClient(); 