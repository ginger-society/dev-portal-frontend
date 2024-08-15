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
import { Text, TextSize, TextWeight } from "@ginger-society/ginger-ui";
import {
  FaBoxOpen,
  FaDatabase,
  FaDesktop,
  FaPencilAlt,
  FaServer,
  FaTerminal,
} from "react-icons/fa";
import router from "@/shared/router";

const legendConfigs: LegendConfigs = {
  [MarkerType.Circle]: {
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
  [MarkerType.Rectangle]: {
    label: "Portal",
    color: "#1A4870",
  },
};

const SysDesignWrapper = () => {
  const { blocks, setBlocks, connections, setConnections, setEditorData } =
    useUMLEditor();

  const updateConnections = () => {
    const connections: Connection[] = [];
    Object.keys(blocks).forEach((key) => {
      const block = blocks[key];
      if (block.data.dependencies) {
        block.data.dependencies.forEach((dependency: string) => {
          connections.push({
            block1Id: key,
            block2Id: dependency.split("/")[1],
            fromRow: 0,
            toRow: 0,
            marker: MarkerType.Circle,
            label: ``,
          });
        });
      }
      if (block.data.dbSchemaId) {
        connections.push({
          block1Id: key,
          block2Id: block.data.dbSchemaId,
          fromRow: 0,
          toRow: 0,
          marker: MarkerType.Circle,
          label: ``,
        });
      }
    });

    setConnections(connections);
  };

  useEffect(() => {
    updateConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const navigateToDBEditor = (id: string) => {
    router.navigate(`/editor/${id}/main`);
  };

  const navigateToSwagger = (id: string, org_id: string) => {
    router.navigate(`/services/swagger/${org_id}/${id}/stage`);
  };

  return (
    <>
      <UMLEditor
        setBlocks={setBlocks}
        setConnections={setConnections}
        blocks={blocks}
        connections={connections}
        RowRenderer={({ rowData }) => (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Text size={TextSize.Small}>{rowData.data.heading}</Text>
            <Text size={TextSize.Small}>{rowData.data.description}</Text>
            {rowData.data.list.map((listItem: string) => {
              return (
                <>
                  <Text size={TextSize.Small}> &#x2192; {listItem}</Text>
                </>
              );
            })}
          </div>
        )}
        allowEdit={false}
        HeadingRenderer={({ blockData }) => (
          <>
            {blockData.type === BlockType.SystemBlock && (
              <div style={{ display: "flex" }}>
                <div style={{ width: "250px" }}>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {blockData.data.type === "database" && <FaDatabase />}
                    {blockData.data.type === "RPCEndpoint" && <FaServer />}
                    {blockData.data.type === "library" && <FaBoxOpen />}
                    {blockData.data.type === "executable" && <FaTerminal />}
                    {blockData.data.type === "Portal" && <FaDesktop />}
                    {blockData.data.name}
                  </span>
                  <span style={{ fontWeight: "normal", fontSize: "12px" }}>
                    {blockData.data.description}
                  </span>
                  <Text size={TextSize.Small}>{blockData.data.version}</Text>
                </div>
                {blockData.data.type === "database" && (
                  <FaPencilAlt
                    onClick={() => navigateToDBEditor(blockData.id)}
                  />
                )}
                {blockData.data.type === "RPCEndpoint" && (
                  <FaPencilAlt
                    onClick={() =>
                      navigateToSwagger(blockData.id, blockData.data.org_id)
                    }
                  />
                )}
              </div>
            )}
          </>
        )}
        setEditorData={setEditorData}
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
