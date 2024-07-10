import React, { useState, useEffect, ChangeEvent } from "react";
import styles from "./enum-editor.module.scss";
import { deleteIcon } from "@/shared/svgIcons";
import { slugGenerator } from "@/shared/utils";
import { Input, Text } from "@ginger-society/ginger-ui";
import { FaRegTrashAlt } from "react-icons/fa";

export interface Option {
  label: string;
  value: string;
}

interface EnumEditorProps {
  value?: Option[];
  onChange?: (value: Option[]) => void;
  className: string;
}

const EnumEditor: React.FC<EnumEditorProps> = ({
  value = [],
  onChange,
  className = "",
}) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setInputValue("");
  }, [value]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      const newOption = { label: inputValue, value: slugGenerator(inputValue) };
      onChange?.([...value, newOption]);
      setInputValue("");
    }
  };

  const handleDeleteOption = (index: number) => {
    const updatedOptions = value.filter((_, i) => i !== index);
    onChange?.(updatedOptions);
  };

  const handleOptionEdit = (index: number, editedLabel: string) => {
    const updatedOptions = value.map((option, i) =>
      i === index
        ? { ...option, label: editedLabel, value: slugGenerator(editedLabel) }
        : option
    );

    // Remove the option if the edited label is empty
    if (editedLabel.trim() === "") {
      updatedOptions.splice(index, 1);
      onChange?.(updatedOptions);
    } else {
      onChange?.(updatedOptions);
    }
  };

  return (
    <div>
      <Input
        label="Options"
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Enter text and press Enter"
      />
      <ul className={className}>
        {value.map((option, index) => (
          <li key={index} className={styles["option-container"]}>
            <span
              contentEditable
              onBlur={(e) =>
                handleOptionEdit(index, e.currentTarget.textContent || "")
              }
            >
              <Text>{option.label}</Text>
            </span>
            <button onClick={() => handleDeleteOption(index)}>
              <FaRegTrashAlt />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EnumEditor;
