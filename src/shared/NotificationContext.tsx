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
  const [ws, setWs] = useState<WebSocket | null>(null);
  const reconnectAttempts = useRef<number>(0);
  const reconnectInterval = useRef<number | null>(null);

  useEffect(() => {
    if (!user && !channel) {
      return;
    }

    const accessToken = localStorage.getItem("access_token");
    const websocketChannel = channel || user?.userId;

    function connectWebSocket() {
      // Close existing WebSocket before creating a new one
      if (ws) {
        ws.close(); // Close the previous connection cleanly
      }
      if (websocketChannel && accessToken && !isConnected) {
        const newWs = new WebSocket(
          `wss://api-staging.gingersociety.org/notification/ws/${websocketChannel}?token=${accessToken}`
        );

        newWs.onopen = () => {
          console.log("WebSocket connection established.");
          setIsConnected(true);
          reconnectAttempts.current = 0; // Reset reconnect attempts on successful connection
        };

        newWs.onmessage = (event) => {
          const message = JSON.parse(event.data) as WebSocketMessage;
          const callback = subscriptions.current[message.topic];

          if (callback) {
            callback(JSON.parse(message.payload));
          }
        };

        newWs.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsConnected(false);
          attemptReconnect();
        };

        newWs.onclose = () => {
          console.log("WebSocket connection closed.");
          setIsConnected(false);
          attemptReconnect();
        };

        setWs(newWs); // Save WebSocket instance in state
      }
    }

    function attemptReconnect() {
      if (reconnectAttempts.current < 5) {
        // Limit number of reconnect attempts
        reconnectAttempts.current += 1;
        const timeout = setTimeout(() => {
          console.log(
            `Attempting to reconnect... (${reconnectAttempts.current})`
          );
          connectWebSocket();
        }, 2000); // Reconnect after 2 seconds
        reconnectInterval.current = timeout;
      } else {
        console.log("Max reconnect attempts reached.");
      }
    }

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectInterval.current) {
        clearTimeout(reconnectInterval.current);
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
