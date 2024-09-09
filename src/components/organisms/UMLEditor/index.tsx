import Draggable from "react-draggable";
import Legend from "@/components/atoms/Legend";
import { calculatePath } from "@/shared/canvas.utils";
import {
  triangleIcon,
  rectangleIcon,
  circleIcon,
  hexagonIcon,
} from "@/shared/svgIcons";
import {
  Block,
  BlockType,
  Connection,
  EditorData,
  EditorTypeEnum,
  MarkerType,
  Row,
  UMLEditorProps,
} from "./types";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Aside } from "@ginger-society/ginger-ui";
import { NEW_BLOCK_ID_PREFIX } from "./constants";
import { ColumnType } from "../ColumnEditor/types";
import { FaPencilAlt } from "react-icons/fa";

const UMLEditor = ({
  setBlocks,
  setConnections,
  blocks,
  connections,
  legendConfigs,
  RowEditor,
  BlockEditor,
  setEditorData,
  HeadingRenderer = ({ blockData }) => {
    return blockData.id;
  },
  allowEdit = true,
  allowDrag = true,
  RowRenderer = ({ rowData }) => {
    return rowData.id;
  },
  updateConnections,
  createNewBlock,
  EnumRowRenderer = ({ blockData }) => {
    return blockData.id;
  },
}: UMLEditorProps) => {
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [editorType, setEditorType] = useState<EditorTypeEnum>();
  const [highlighted, setHighlighted] = useState<string>();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const toggleSlider = (
    type: EditorTypeEnum,
    blockId: string,
    rowIndex?: number
  ) => {
    setIsSliderOpen((isOpen) => !isOpen);
    setEditorType(type);
    setEditorData({ rowIndex, blockId });
  };

  const closeSlider = () => {
    setIsSliderOpen(false);

    setBlocks((v) => {
      const keysToDelete: string[] = [];
      const updatedBlocks = Object.keys(v).reduce(
        (accum: { [k: string]: Block }, key) => {
          if (v[key].id !== key) {
            accum[v[key].id] = v[key];
            keysToDelete.push(key);
          } else {
            accum[key] = v[key];
          }
          return accum;
        },
        {}
      );

      keysToDelete.forEach((k) => {
        delete updatedBlocks[k];
      });
      return updatedBlocks;
    });

    updateConnections();
  };

  const svgRef = React.createRef<SVGSVGElement>();
  const [paths, setPaths] = useState<
    { path: string; midX: number; midY: number; angle: number }[]
  >([]);

  const handleDrag = useCallback(() => {
    const newPaths = connections.map(
      ({ block1Id, fromRow, block2Id, toRow }) => {
        const rect1 = blocks[block1Id]?.ref.current?.getBoundingClientRect();
        const rect2 = blocks[block2Id]?.ref.current?.getBoundingClientRect();
        const { d, midX, midY, angle } = calculatePath(
          rect1,
          rect2,
          fromRow,
          toRow,
          blocks[block1Id]?.rows.length || 1,
          blocks[block2Id]?.rows.length || 1
        );
        return { path: d, midX, midY, angle: angle || 0 };
      }
    );

    setPaths(newPaths);
  }, [blocks, connections]);

  useEffect(() => {
    handleDrag();
  }, [connections, handleDrag]);

  const handleBlockDrag = (id: string, e: any, data: any) => {
    setBlocks((prevBlocks) => ({
      ...prevBlocks,
      [id]: {
        ...prevBlocks[id],
        position: { top: data.y, left: data.x },
      },
    }));
    handleDrag(); // Update paths after dragging
  };

  const handleAddBlock = (type: BlockType) => {
    if (!contextMenu) {
      return;
    }

    setBlocks((v) => {
      if (!createNewBlock) {
        return v;
      }
      const id = `${NEW_BLOCK_ID_PREFIX}-${type}`;
      return {
        ...v,
        [id]: createNewBlock(type, contextMenu.x, contextMenu.y, id),
      };
    });
    closeContextMenu();
  };

  const addNewRow = (id: string) => {
    setBlocks((prevBlocks) => ({
      ...prevBlocks,
      [id]: {
        ...prevBlocks[id],
        rows: [...prevBlocks[id].rows, { id: "new-row", data: {} }],
      },
    }));
    handleDrag(); // Update paths after dragging
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX + window.scrollX,
      y: e.clientY + window.scrollY - 50,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        closeContextMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div
        className="canvas-container"
        onContextMenu={handleContextMenu}
        onClick={() => setHighlighted(undefined)}
      >
        {Object.values(blocks).map((block) => (
          <Draggable
            key={block.id}
            onDrag={(e, data) => handleBlockDrag(block.id, e, data)}
            handle=".handle"
            position={{ x: block.position.left, y: block.position.top }}
          >
            <div
              className={`card block-card ${
                highlighted === block.id ? "bring-forward" : ""
              }`}
              ref={block.ref}
            >
              {/* Header row */}
              <div
                className={`${
                  block.type === BlockType.Enum
                    ? "options-header"
                    : "table-header"
                } block-header ${allowDrag ? "handle" : ""}`}
                style={{
                  backgroundColor: block.data.color,
                  borderTop: `solid 1px ${block.data.color}`,
                  borderBottom: `solid 1px ${block.data.color}`,
                }}
                onClick={(e) => {
                  setHighlighted(block.id);
                  e.stopPropagation();
                }}
              >
                <HeadingRenderer blockData={block} />
                {(allowEdit || block.data.allowEdit) && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSlider(EditorTypeEnum.BLOCK, block.id);
                    }}
                  >
                    <FaPencilAlt />
                  </span>
                )}
              </div>
              {/* Render dynamic number of rows */}
              {block.rows.map((row, index) => (
                <div
                  onClick={() =>
                    allowEdit &&
                    toggleSlider(EditorTypeEnum.ROW, block.id, index)
                  }
                  key={index}
                  className={`row-content ${
                    row.data.type !== ColumnType.PK ? "hoverable" : ""
                  }`}
                >
                  <RowRenderer rowData={row} />
                </div>
              ))}
              {block.type === BlockType.Table && (
                <div
                  onClick={() => {
                    addNewRow(block.id);
                  }}
                  className="row-content hoverable"
                >
                  Add new row
                </div>
              )}
              {block.type === BlockType.Enum && (
                <div
                  onClick={() => toggleSlider(EditorTypeEnum.BLOCK, block.id)}
                  className="row-content"
                >
                  <EnumRowRenderer blockData={block} />
                </div>
              )}
            </div>
          </Draggable>
        ))}
        {/* Render connections */}
        <svg ref={svgRef} className="svg-container">
          <defs>
            <filter
              id="highlight-shadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="3"
                floodColor="rgb(234 95 32)"
              />
            </filter>
          </defs>
          {connections.length > 0 &&
            paths.map(({ path, midX, midY, angle }, index) => (
              <g key={index}>
                <path
                  d={path}
                  stroke={
                    highlighted === connections[index].block1Id ||
                    highlighted === connections[index].block2Id
                      ? "rgb(234 95 32)"
                      : "var(--primary-color)"
                  }
                  fill="transparent"
                  strokeWidth={
                    highlighted === connections[index].block1Id ||
                    highlighted === connections[index].block2Id
                      ? "3px"
                      : "1px"
                  }
                  filter={
                    highlighted === connections[index].block1Id ||
                    highlighted === connections[index].block2Id
                      ? "url(#highlight-shadow)"
                      : "none"
                  }
                />
                <g
                  transform={`translate(${midX - 13}, ${midY - 13}) rotate(${
                    angle - 90
                  }, 13, 13)`}
                >
                  {(() => {
                    const marker = connections[index].marker;

                    const color =
                      highlighted === connections[index].block1Id ||
                      highlighted === connections[index].block2Id
                        ? "rgb(234 95 32)"
                        : marker
                        ? legendConfigs[marker]?.color || "var(--primary-color)"
                        : "var(--primary-color)";

                    if (!marker) {
                      return triangleIcon(color);
                    }
                    switch (connections[index].marker) {
                      case MarkerType.Triangle:
                        return triangleIcon(color);
                      case MarkerType.Rectangle:
                        return rectangleIcon(color);
                      case MarkerType.Circle:
                        return circleIcon(color);
                      case MarkerType.Hexagon:
                        return hexagonIcon(color);
                    }
                  })()}
                  {connections[index].label && (
                    <text
                      x="10"
                      y="-10"
                      fontSize="15"
                      textAnchor="middle"
                      fill={
                        highlighted === connections[index].block1Id ||
                        highlighted === connections[index].block2Id
                          ? "var(--secondary-color)"
                          : "var(--primary-color)"
                      }
                    >
                      {connections[index].label}
                    </text>
                  )}
                </g>
              </g>
            ))}
        </svg>
        {contextMenu && allowEdit && (
          <div
            ref={contextMenuRef}
            className="context-menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button onClick={() => handleAddBlock(BlockType.Table)}>
              Add Block
            </button>
            <button onClick={() => handleAddBlock(BlockType.Enum)}>
              Add Options
            </button>
          </div>
        )}
      </div>
      <Aside isOpen={isSliderOpen} onClose={closeSlider}>
        {editorType === EditorTypeEnum.ROW && <RowEditor close={closeSlider} />}
        {editorType === EditorTypeEnum.BLOCK && (
          <BlockEditor close={closeSlider} />
        )}
      </Aside>
      <Legend items={legendConfigs} />
    </>
  );
};

export default UMLEditor;
