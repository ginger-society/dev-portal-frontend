import { useEffect, useState } from "react";
import Child from "./Child";
import "./test.css";

const Test = (): JSX.Element => {
  const [d, setData] = useState<string>();
  const fetchData = async () => {
    const response = await fetch("/api/value");
    const data = await response.json();
    console.log(data);
    setData(data.a);
  };

  useEffect(() => {
    fetchData();
  });

  return (
    <span className="testText">
      test component
      <Child title="OK" />
      <span>{d}</span>
    </span>
  );
};

export default Test;
