import { Button, ButtonType, Input, NotificationContext, Select, TextArea } from "@ginger-society/ginger-ui";
import React, { useContext, useEffect, useState } from "react";
import styles from "./genesis.module.scss";

const Genesis = () => {
  const { subscribeToTopic } = useContext(NotificationContext);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language: '',
    framework: '',
    database: ''
  });

  useEffect(() => {
    subscribeToTopic("my_topic", (msg: any) => {
      console.log("Received message for my_topic:", msg);
    });
  }, [subscribeToTopic]);


  return (
    <div className={styles.genesisContainer}>
      <h1 className={styles.title}>Ginger Scaffolder</h1>
      <p className={styles.subtitle}>Forge your Backend Component</p>

      <Input
        label="Component Name"
        placeholder="e.g. User Service"
        value={formData.name}
      />

      <TextArea label="Description" />

      <div className={styles.formGroup}>
        <Select
          label="Programming Language"
          options={[]}
          onChange={(v) => { }}
          value={{ label: 'test', value: 'test' }}
        >
        </Select>
      </div>

      <div className={styles.formGroup}>
        <Select
          label="Programming Language"
          options={[]}
          onChange={(v) => { }}
          value={{ label: 'test', value: 'test' }}
        >
        </Select>
      </div>

      <Button type={ButtonType.Primary} label="🚀 Create Component"></Button>

      <div className={styles.listeningNote}>
        Listening for messages on "<strong>my_topic</strong>"
      </div>
    </div>
  );
};

export default Genesis;
