import { LegendConfigs, LegendItemT } from "@/components/atoms/Legend/types";
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
import React, { useEffect, useState } from "react";
import {
  Aside,
  Button,
  ButtonType,
  Loader,
  SnackbarTimer,
  Text,
  TextSize,
  TextWeight,
  useSnackbar,
} from "@ginger-society/ginger-ui";
import {
  FaBoxOpen,
  FaCheckDouble,
  FaDatabase,
  FaDesktop,
  FaInfoCircle,
  FaLayerGroup,
  FaPencilAlt,
  FaServer,
  FaTerminal,
} from "react-icons/fa";
import router from "@/shared/router";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./sysDesignWrapper.module.scss";

const legendConfigs: LegendConfigs = {
  [MarkerType.Circle]: {
    label: "Executable",
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
  [MarkerType.Pentagon]: {
    label: "Cache",
    color: "#6e46c0",
  },
  [MarkerType.Rectangle2]: {
    label: "Library",
    color: "#000",
  },
};

const SysDesignWrapper = ({
  allowDrag,
  isPublicView = false,
}: {
  allowDrag: boolean;
  isPublicView?: boolean;
}) => {
  const { blocks, setBlocks, connections, setConnections, setEditorData } =
    useUMLEditor();

  const [isMarkdownViewertOpen, setIsMarkdownViewerOpen] =
    useState<boolean>(false);
  const [markdownViewerTitle, setMarkdownViewerTitle] = useState<string>();
  const [markdownContent, setMarkdownContent] = useState<string>();

  const { show } = useSnackbar();

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
          label: ``,
        });
      }
      if (block.data.cacheSchemaId) {
        connections.push({
          block1Id: key,
          block2Id: block.data.cacheSchemaId,
          fromRow: 0,
          toRow: 0,
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
    if (!isPublicView) {
      router.navigate(`/editor/${id}/stage`);
    } else {
      router.navigate(`/public/editor/${id}/stage`);
    }
  };

  const navigateToSwagger = (id: string, org_id: string) => {
    if (!isPublicView) {
      router.navigate(`/services/swagger/${org_id}/${id}/stage`);
    } else {
      router.navigate(`/public/services/swagger/${org_id}/${id}/stage`);
    }
  };

  const openChangelog = async (repo_origin: string) => {
    if (!repo_origin) {
      show(
        <>No repo URL found, please check the releaser settings</>,
        SnackbarTimer.Short
      );
      return;
    }
    setIsMarkdownViewerOpen(true);
    setMarkdownContent(undefined);
    // https://raw.githubusercontent.com/ginger-society/dev-portal-frontend
    const response = await fetch(
      `${repo_origin.replace(
        "github.com",
        "raw.githubusercontent.com"
      )}/main/CHANGELOG.md`
    );
    const changelogTxt = await response.text();
    setMarkdownContent(changelogTxt);
  };

  const openReadme = async (repo_origin: string) => {
    if (!repo_origin) {
      show(
        <>No repo URL found, please check the releaser settings</>,
        SnackbarTimer.Short
      );
      return;
    }
    setIsMarkdownViewerOpen(true);
    setMarkdownContent(undefined);
    // https://raw.githubusercontent.com/ginger-society/dev-portal-frontend
    const response = await fetch(
      `${repo_origin.replace(
        "github.com",
        "raw.githubusercontent.com"
      )}/main/README.md`
    );
    const changelogTxt = await response.text();
    setMarkdownContent(changelogTxt);
  };

  const handleLegendClick = (item?: LegendItemT) => {
    setBlocks((existingBlocks) => {
      return Object.keys(existingBlocks).reduce((accum, blockKey) => {
        const block = existingBlocks[blockKey];
        let blinkClass;

        if (item) {
          if (
            block.data.type === item.label.toLowerCase() ||
            block.data.type === item.label
          ) {
            blinkClass = "bring-forward";
          } else {
            blinkClass = "no-shaddow ";
          }
        } else {
          blinkClass = "";
        }

        (accum as any)[blockKey] = {
          ...block,
          data: { ...block.data, blinkClass },
        };
        return accum;
      }, {});
    });
  };

  return (
    <>
      <UMLEditor
        handleLegendClick={handleLegendClick}
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
        allowDrag={allowDrag}
        HeadingRenderer={({ blockData }) => (
          <>
            {blockData.type === BlockType.SystemBlock && (
              <div style={{ display: "flex", width: "100%" }}>
                <div style={{ width: "300px" }}>
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
                    {blockData.data.type === "cache" && <FaLayerGroup />}
                    <button
                      onClick={() => openReadme(blockData.data.repo_origin)}
                    >
                      {blockData.data.name}
                    </button>
                    {blockData.data.type === "database" && (
                      <FaPencilAlt
                        onClick={() => navigateToDBEditor(blockData.id)}
                      />
                    )}
                    {blockData.data.type === "RPCEndpoint" && (
                      <FaInfoCircle
                        onClick={() =>
                          navigateToSwagger(blockData.id, blockData.data.org_id)
                        }
                      />
                    )}
                  </span>
                  <span style={{ fontWeight: "normal", fontSize: "12px" }}>
                    {blockData.data.description}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: "normal", fontSize: "13px" }}>
                      Version: {blockData.data.version}
                    </span>
                    <button
                      onClick={(e) => {
                        openChangelog(blockData.data.repo_origin);
                        e.stopPropagation();
                      }}
                    >
                      <span style={{ fontWeight: "normal", fontSize: "13px" }}>
                        View changelog
                      </span>
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "normal",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      Pipeline:{" "}
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {blockData.data.pipeline_status || "Not available"}{" "}
                        {blockData.data.pipeline_status === "passing" && (
                          <FaCheckDouble />
                        )}
                      </span>
                    </div>
                  </div>
                </div>
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
      <Aside
        isOpen={isMarkdownViewertOpen}
        onClose={() => setIsMarkdownViewerOpen(false)}
      >
        <Text tag="h1" size={TextSize.Large}>
          {markdownViewerTitle}
        </Text>
        <div className={styles["md-wrapper"]}>
          {markdownContent ? (
            <Markdown remarkPlugins={[remarkGfm]}>{markdownContent}</Markdown>
          ) : (
            <Loader />
          )}
        </div>
      </Aside>
    </>
  );
};

export default SysDesignWrapper;
