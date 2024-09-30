import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";

export const NotificationContext = createContext<any>(null);

interface NotificationProviderProps {
  channel?: string;
  children: React.ReactNode;
}

interface WebSocketMessage {
  topic: string;
  payload: any;
}

export const NotificationProvider = ({
  channel,
  children,
}: NotificationProviderProps) => {
  const { user } = useContext(AuthContext);
  const subscriptions = useRef<{ [topic: string]: (msg: any) => void }>({});
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!user && !channel) {
      return;
    }

    let ws: WebSocket | null = null;
    let retryTimeout: number | null = null;
    const accessToken = localStorage.getItem("access_token");
    const websocketChannel = channel || user?.userId;

    const connectWebSocket = () => {
      if (websocketChannel && accessToken) {
        ws = new WebSocket(
          `ws://api-staging.gingersociety.org/notification/ws/${websocketChannel}?token=${accessToken}`
        );

        ws.onopen = () => {
          console.log("WebSocket connection established.");
          setRetryCount(0); // Reset retry count on success
        };

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data) as WebSocketMessage;
          const callback = subscriptions.current[message.topic];

          if (callback) {
            callback(message.payload);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
          console.log("WebSocket connection closed. Retrying...");
          if (retryCount < 5) {
            retryTimeout = setTimeout(() => {
              setRetryCount((prevCount) => prevCount + 1);
              connectWebSocket();
            }, 2000 * retryCount); // Exponential backoff
          }
        };
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [channel, user, retryCount]);

  const subscribeToTopic = (topic: string, callback: (msg: any) => void) => {
    subscriptions.current[topic] = callback;
  };

  return (
    <NotificationContext.Provider value={{ subscribeToTopic }}>
      {children}
    </NotificationContext.Provider>
  );
};
