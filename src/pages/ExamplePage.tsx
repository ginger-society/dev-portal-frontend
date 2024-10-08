import { NotificationContext } from "@/shared/NotificationContext";
import React, { useContext, useEffect } from "react";

const ExampleComponent = () => {
  const { subscribeToTopic } = useContext(NotificationContext);
  useEffect(() => {
    subscribeToTopic("my_topic", (msg: any) => {
      console.log("Received message for my_topic:", msg);
      // Handle the message here
    });
  }, [subscribeToTopic]);

  return (
    <div>
      <p>Listening for messages on "my_topic"</p>
    </div>
  );
};

export default ExampleComponent;
