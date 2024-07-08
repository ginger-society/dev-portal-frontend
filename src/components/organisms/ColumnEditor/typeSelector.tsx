import React from "react";
import { ColumnType } from "./types";
import styles from "./column-editor.module.scss";
import {
  CharFieldIcon,
  BooleanFieldIcon,
  DateFieldIcon,
  BigAutoFieldIcon,
  ForeignKeyIcon,
  PositiveIntegerFieldIcon,
  ManyToManyFieldIcon,
  TextFieldIcon,
} from "@/shared/svgIcons"; // Import the icons for each column type
import { Text, TextWeight } from "@ginger-society/ginger-ui";

interface CustomSelectProps {
  value: ColumnType;
  onChange: (value: ColumnType) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange }) => {
  const options = Object.values(ColumnType).filter((v) => v !== ColumnType.PK); // Get all enum values as options
  const handleOptionClick = (option: ColumnType) => {
    onChange(option);
  };

  return (
    <div className={styles["type-selector-container"]}>
      <Text weight={TextWeight.Bold}>Field Type</Text>
      <div className={styles["custom-select-container"]}>
        {options.map((option) => (
          <div
            key={option}
            className={`${styles["option"]} ${
              option === value ? styles["selected"] : ""
            }`}
            onClick={() => handleOptionClick(option)}
          >
            {getOptionIcon(option)} {/* Render the icon based on the option */}
            <span className={styles["label"]}>{option}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;

// Helper function to get the icon for each column type
const getOptionIcon = (option: ColumnType) => {
  switch (option) {
    case ColumnType.String:
      return CharFieldIcon;
    case ColumnType.Boolean:
      return BooleanFieldIcon;
    case ColumnType.DateField:
      return DateFieldIcon;
    case ColumnType.ForeignKey:
      return ForeignKeyIcon;
    case ColumnType.PositiveIntegerField:
      return PositiveIntegerFieldIcon;
    case ColumnType.ManyToManyField:
      return ManyToManyFieldIcon;
    case ColumnType.TextField:
      return TextFieldIcon;
    default:
      return null;
  }
};
