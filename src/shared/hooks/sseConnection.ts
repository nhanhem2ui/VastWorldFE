type Handler = (data: unknown) => void;

const eventHandlers = new Map<string, Set<Handler>>();
const connectionListeners = new Set<() => void>();

let eventSource: EventSource | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;

/** SSE connect to the server */
function connect() {  
  if (eventSource) return;

const baseUrl = import.meta.env.VITE_API_BASE_URL;

eventSource = new EventSource(`${baseUrl}/api/notifications/subscribe`, {
  withCredentials: true,
});

  eventSource.onopen = () => {
    reconnectAttempts = 0;
  };

  eventSource.onerror = () => {
    eventSource?.close();
    eventSource = null;

    //Check if anyone still needs SSE
    if (connectionListeners.size > 0) {
      const delay = Math.min(1000 * 2 ** reconnectAttempts, 60_000); // max 60s
      reconnectAttempts++;
      reconnectTimer = setTimeout(connect, delay);
    }
  };

  //attach listeners for every registered event type
  eventHandlers.forEach((handlers, eventType) => {
    eventSource!.addEventListener(eventType, (event: MessageEvent) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        return; // ignore malformed payloads
      }
      handlers.forEach(h => h(parsed));
    });
  });
}

function disconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  eventSource?.close();
  eventSource = null;
  reconnectAttempts = 0;
}

/** Allow a single SSE connection, use onChange() as a unique identifier */ 
export function holdConnection(onChange: () => void) {
  connectionListeners.add(onChange);
  if (connectionListeners.size === 1) connect();

  return () => {
    connectionListeners.delete(onChange);
    if (connectionListeners.size === 0) disconnect();
  };
}

/** Attaches custom functions to specific incoming SSE event names (e.g., "quest-completed").. */
export function onSSE(eventType: string, handler: Handler) {
  
  if (!eventHandlers.has(eventType)) {
    eventHandlers.set(eventType, new Set());

    // if we're already connected, attach immediately
    eventSource?.addEventListener(eventType, (event: MessageEvent) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        return;
      }
      eventHandlers.get(eventType)?.forEach(h => h(parsed));
    });
  }
  eventHandlers.get(eventType)!.add(handler);

  return () => {
    eventHandlers.get(eventType)?.delete(handler);
  };
}