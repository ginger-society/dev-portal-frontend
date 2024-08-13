import { LegendConfigs } from "@/components/atoms/Legend/types";
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
import { Text, TextWeight } from "@ginger-society/ginger-ui";
import {
  FaBoxOpen,
  FaDatabase,
  FaDesktop,
  FaServer,
  FaTerminal,
} from "react-icons/fa";

const legendConfigs: LegendConfigs = {
  [MarkerType.Rectangle]: {
    label: "Depends on",
    color: "#4793AF",
  },
  [MarkerType.Hexagon]: {
    label: "Database",
    color: "#89439f",
  },
  [MarkerType.Triangle]: {
    label: "RPCEndpoint",
    color: "#799351",
  },
  [MarkerType.Circle]: {
    label: "Portal",
    color: "#000",
  },
};

const SysDesignWrapper = () => {
  const { blocks, setBlocks, connections, setConnections, setEditorData } =
    useUMLEditor();

  const updateConnections = () => {
    const connections: Connection[] = [];
    Object.keys(blocks).forEach((key) => {
      const block = blocks[key];
      connections.push({
        block1Id: "IAMService",
        block2Id: "MetadataService",
        fromRow: 0,
        toRow: 0,
        marker: MarkerType.Rectangle,
        label: ``,
      });
      connections.push({
        block1Id: "dev-portal",
        block2Id: "MetadataService",
        fromRow: 0,
        toRow: 0,
        marker: MarkerType.Rectangle,
        label: ``,
      });
      connections.push({
        block1Id: "dev-portal",
        block2Id: "IAMService",
        fromRow: 0,
        toRow: 0,
        marker: MarkerType.Rectangle,
        label: ``,
      });
      connections.push({
        block1Id: "dev-portal",
        block2Id: "ginger-ui",
        fromRow: 0,
        toRow: 0,
        marker: MarkerType.Rectangle,
        label: ``,
      });
      connections.push({
        block1Id: "iam-frontend-users",
        block2Id: "IAMService",
        fromRow: 0,
        toRow: 0,
        marker: MarkerType.Rectangle,
        label: ``,
      });
      connections.push({
        block1Id: "ginger-ui",
        block2Id: "ginger-book",
        fromRow: 0,
        toRow: 0,
        marker: MarkerType.Rectangle,
        label: ``,
      });
      connections.push({
        block1Id: "db-compose",
        block2Id: "MetadataService",
        fromRow: 0,
        toRow: 0,
        marker: MarkerType.Rectangle,
        label: ``,
      });
      connections.push({
        block1Id: "ginger-connector",
        block2Id: "MetadataService",
        fromRow: 0,
        toRow: 0,
        marker: MarkerType.Rectangle,
        label: ``,
      });
      connections.push({
        block1Id: "ginger-scaffolder",
        block2Id: "MetadataService",
        fromRow: 0,
        toRow: 0,
        marker: MarkerType.Rectangle,
        label: ``,
      });
    });
    setConnections(connections);
  };

  useEffect(() => {
    updateConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const createNewBlock = (
    type: BlockType,
    x: number,
    y: number,
    id: string
  ): Block => {
    const rows: Row[] = [];
    const newBlock = {
      id,
      rows: [...rows],
      ref: React.createRef<HTMLDivElement>(),
      position: { top: y, left: x },
      data: { name: "IAM DB" },
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
          <div>
            <Text weight={TextWeight.Bold}>{rowData.data.heading}</Text>
            <br />
            {rowData.data.list.map((listItem: string) => {
              return (
                <>
                  <Text> &#x2192; {listItem}</Text>
                  <br />
                </>
              );
            })}
          </div>
        )}
        allowEdit={false}
        HeadingRenderer={({ blockData }) => (
          <>
            {blockData.type === BlockType.SystemBlock && (
              <div style={{ width: "250px" }}>
                <span
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  {blockData.data.type === "database" && <FaDatabase />}
                  {blockData.data.type === "RPCEndpoint" && <FaServer />}
                  {blockData.data.type === "package" && <FaBoxOpen />}
                  {blockData.data.type === "executable" && <FaTerminal />}
                  {blockData.data.type === "portal" && <FaDesktop />}
                  {blockData.data.name}
                </span>
                {blockData.data.description && <hr />}
                <span style={{ fontWeight: "normal" }}>
                  {blockData.data.description}
                </span>
              </div>
            )}
          </>
        )}
        setEditorData={setEditorData}
        createNewBlock={createNewBlock}
        legendConfigs={legendConfigs}
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
