import React, { useMemo } from "react";
import { useUMLEditor, BlockType, Block } from "@ginger-society/ginger-ui-uml";
import { Select } from "@ginger-society/ginger-ui";

interface TableSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const TableSelector: React.FC<TableSelectorProps> = ({ value, onChange }) => {
  const { blocks } = useUMLEditor();

  const tableBlocks = useMemo(() => {
    return Object.values(blocks).filter(
      (block: Block) => block.type === BlockType.Table
    );
  }, [blocks]);

  return (
    <Select
      label="Relates to"
      value={{ value, label: value || "Not selected" }}
      options={tableBlocks.map((block) => {
        return {
          value: block.id,
          label: block.data.name,
        };
      })}
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

export default TableSelector;
