import React, { useMemo } from "react";
import { useUMLEditor } from "../UMLEditor/context";
import { BlockType, Block } from "../UMLEditor/types";
import styles from "./column-editor.module.scss";
import { Select } from "@ginger-society/ginger-ui";

interface EnumSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const EnumSelector: React.FC<EnumSelectorProps> = ({ value, onChange }) => {
  const { blocks } = useUMLEditor();

  const enumBlocks = useMemo(() => {
    return Object.values(blocks).filter(
      (block: Block) => block.type === BlockType.Enum
    );
  }, [blocks]);

  return (
    <Select
      label="Enum"
      value={{ label: value || "Not selected", value: value }}
      options={[
        { value: "", label: "Not selected" },
        ...enumBlocks.map((v) => {
          return { label: v.data.name || v.data.id, value: v.id };
        }),
      ]}
      renderer={(option) => (
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {option.label}
        </div>
      )}
      onChange={({ value }) => {
        onChange(value);
      }}
    />
  );
};

export default EnumSelector;
