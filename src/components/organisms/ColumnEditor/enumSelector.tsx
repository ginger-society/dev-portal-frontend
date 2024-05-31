import React, { useMemo } from "react";
import { useUMLEditor } from "../UMLEditor/context";
import { BlockType, Block } from "../UMLEditor/types";
import styles from "./column-editor.module.scss";

interface EnumSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const EnumSelector: React.FC<EnumSelectorProps> = ({ value, onChange }) => {
  const { blocks } = useUMLEditor();

  const enumBlocks = useMemo(() => {
    return Object.values(blocks).filter(
      (block: Block) => block.type === BlockType.Enum,
    );
  }, [blocks]);

  return (
    <div className="form-group">
      <label>Enum</label>
      <select
        className="base-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value={undefined}>Not selected</option>
        {enumBlocks.map((block) => (
          <option key={block.id} value={block.id}>
            {block.data.name || block.id}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EnumSelector;
