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
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    if (!user && !channel) {
      return;
    }

    let ws: WebSocket | null = null;
    const accessToken = localStorage.getItem("access_token");
    const websocketChannel = channel || user?.userId;

    function connectWebSocket() {
      if (websocketChannel && accessToken && !isConnected) {
        ws = new WebSocket(
          `wss://api-staging.gingersociety.org/notification/ws/${websocketChannel}?token=${accessToken}`
        );

        ws.onopen = () => {
          console.log("WebSocket connection established.");
          setIsConnected(true);
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
          setIsConnected(false);
        };

        ws.onclose = () => {
          console.log("WebSocket connection closed.");
          setIsConnected(false);
        };
      }
    }

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, channel]);

  const subscribeToTopic = (topic: string, callback: (msg: any) => void) => {
    subscriptions.current[topic] = callback;
  };

  return (
    <NotificationContext.Provider value={{ subscribeToTopic }}>
      {children}
    </NotificationContext.Provider>
  );
};
