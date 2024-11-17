import { Input, NotificationContext } from "@ginger-society/ginger-ui";
import React, { useContext, useEffect } from "react";

const ExampleComponent = () => {
  const { subscribeToTopic } = useContext(NotificationContext);
  useEffect(() => {
    subscribeToTopic("my_topic", (msg: any) => {
      console.log("Received message for my_topic:", msg);
      // Handle the message here
    });
  }, [subscribeToTopic]);

  const fetchData = async() => {
    const response = await fetch('/api/value')
    const data = await response.json();
    console.log(data);
  }

  useEffect(() => {
    fetchData();
  }, [])

  return (
    <div>
      <p>Listening for messages on "my_topic"</p>
      <Input />
    </div>
  );
};

export default ExampleComponent;
