import React, { useMemo } from "react";
import { useUMLEditor } from "../UMLEditor/context";
import { BlockType, Block } from "../UMLEditor/types";

interface TableSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const TableSelector: React.FC<TableSelectorProps> = ({ value, onChange }) => {
  const { blocks } = useUMLEditor();

  const tableBlocks = useMemo(() => {
    return Object.values(blocks).filter(
      (block: Block) => block.type === BlockType.Table,
    );
  }, [blocks]);

  return (
    <div className="form-group">
      <label>Relates to</label>
      <select
        className="base-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value={undefined}>Not selected</option>
        {tableBlocks.map((block) => (
          <option key={block.id} value={block.id}>
            {block.data.name || block.id}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TableSelector;
