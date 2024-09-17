import {
  LegendItemProps,
  LegendProps,
  MarkerType,
} from "@/components/organisms/UMLEditor/types";
import React from "react";
import { LegendItemT } from "./types";
import { Text, TextSize, TextWeight } from "@ginger-society/ginger-ui";

const LegendItem: React.FC<LegendItemProps> = ({ item, marker }) => {
  const getMarker = () => {
    switch (marker) {
      case MarkerType.Triangle:
        return <polygon points="0,0 12,0 6,10" fill={item.color} />;
      case MarkerType.Rectangle:
        return <rect x="0" y="0" width="12" height="12" fill={item.color} />;
      case MarkerType.Circle:
        return <circle cx="6" cy="6" r="6" fill={item.color} />;
      case MarkerType.Hexagon:
        return (
          <polygon points="0,6 3,0 9,0 12,6 9,12 3,12" fill={item.color} />
        );
      case MarkerType.Pentagon:
        return (
          <polygon
            points="6,0 11.52,4.39 9.41,11.22 2.59,11.22 0.48,4.39"
            fill={item.color}
          />
        );
      case MarkerType.Rectangle2:
        return <rect x="0" y="0" width="12" height="12" fill={item.color} />;
      case MarkerType.Rectangle3:
        return <rect x="0" y="0" width="12" height="12" fill={item.color} />;
      default:
        return null;
    }
  };

  return (
    <div className="legend-item">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 12 12"
        fill="none"
      >
        {getMarker()}
      </svg>
      <Text size={TextSize.Small}>{item.label}</Text>
    </div>
  );
};

const Legend: React.FC<LegendProps> = ({ items, onClick, title }) => {
  return (
    <div className="legend">
      <Text weight={TextWeight.Bold}>{title}</Text>
      <ul>
        {Object.keys(items).map((key, index) => {
          const typedKey = key as MarkerType;
          const item = items[typedKey];
          return (
            <li
              key={index}
              onClick={() => item && onClick && onClick(item)}
              style={onClick && { cursor: "pointer" }}
            >
              {item && <LegendItem item={item} marker={typedKey} />}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Legend;
