import { ColumnType } from "@/components/organisms/ColumnEditor/types";
import UMLEditor from "@/components/organisms/UMLEditor";
import { useUMLEditor } from "@/components/organisms/UMLEditor/context";
import {
  Block,
  BlockType,
  Connection,
  MarkerType,
  Row,
} from "@/components/organisms/UMLEditor/types";
import React, { useEffect } from "react";

const SysDesignWrapper = () => {
  const { blocks, setBlocks, connections, setConnections, setEditorData } =
    useUMLEditor();

  const updateConnections = () => {
    const connections: Connection[] = [];
    Object.keys(blocks).forEach((key) => {
      const block = blocks[key];
      block.rows.forEach((row, index) => {
        if (row.data.type === ColumnType.ForeignKey) {
          const block1Id = row.data.target;
          const block2Id = block.id;
          const toRow = index;
          const fromRow = 0;

          connections.push({
            block1Id,
            block2Id,
            fromRow,
            toRow,
            marker: MarkerType.Hexagon,
            label: `column : ${row.data.field_name}_id`,
          });
        } else if (row.data.type === ColumnType.ManyToManyField) {
          const block1Id = row.data.target;
          const block2Id = block.id;
          const toRow = index;
          const fromRow = 0;

          connections.push({
            block1Id,
            block2Id,
            fromRow,
            toRow,
            marker: MarkerType.Rectangle,
            label: `Via table ${block.id}_${row.data.field_name}`,
          });
        } else if (row.data.type === ColumnType.OneToOneField) {
          const block1Id = row.data.target;
          const block2Id = block.id;
          const toRow = index;
          const fromRow = 0;

          connections.push({
            block1Id,
            block2Id,
            fromRow,
            toRow,
            marker: MarkerType.Triangle,
            label: `Uniquly via ${row.data.field_name}_id`,
          });
        }
      });
    });
    setConnections(connections);
  };

  useEffect(() => {
    updateConnections();
  }, [blocks]);

  const createNewBlock = (
    type: BlockType,
    x: number,
    y: number,
    id: string
  ): Block => {
    const rows: Row[] = [];
    if (type === BlockType.Table) {
      rows.push({
        id: "pk",
        data: {
          type: "BigAutoField",
          name: "pk",
          field_name: "pk",
        },
      });
    }
    const newBlock = {
      id,
      rows: [...rows],
      ref: React.createRef<HTMLDivElement>(),
      position: { top: y, left: x },
      data: {},
      type: type,
    };
    return newBlock;
  };
  return (
    <>
      <UMLEditor
        setBlocks={setBlocks}
        setConnections={setConnections}
        blocks={blocks}
        connections={connections}
        RowRenderer={({ rowData }) => (
          <div className="column-repr">
            <strong>{rowData.data.field_name}</strong>
            <small>{rowData.data.type}</small>
          </div>
        )}
        HeadingRenderer={({ blockData }) => (
          <>
            {blockData.type === BlockType.Table && (
              <span>{blockData.data.name} : Table</span>
            )}
          </>
        )}
        setEditorData={setEditorData}
        createNewBlock={createNewBlock}
        legendConfigs={{}}
        RowEditor={() => <></>}
        BlockEditor={() => <></>}
        updateConnections={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
    </>
  );
};

export default SysDesignWrapper;
