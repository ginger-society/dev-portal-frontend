import React from "react";
import { ColumnType } from "./types";
import styles from "./column-editor.module.scss";
import { Text, TextWeight } from "@ginger-society/ginger-ui";

import {
  FaTextHeight,
  FaCheckSquare,
  FaCalendarAlt,
  FaLevelUpAlt,
  FaClock,
  FaClipboard,
  FaCompressArrowsAlt,
  FaCompressAlt,
} from "react-icons/fa";

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
      return <FaTextHeight />;
    case ColumnType.Boolean:
      return <FaCheckSquare />;
    case ColumnType.DateField:
      return <FaCalendarAlt />;
    case ColumnType.DateTimeField:
      return <FaClock />;
    case ColumnType.ForeignKey:
      return <FaLevelUpAlt />;
    case ColumnType.PositiveIntegerField:
      return <span>123</span>;
    case ColumnType.FloatField:
      return <span>1.23</span>;
    case ColumnType.ManyToManyField:
      return <FaCompressArrowsAlt />;
    case ColumnType.TextField:
      return <FaClipboard />;
    case ColumnType.OneToOneField:
      return <FaCompressAlt />;
    default:
      return null;
  }
};
