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
import React, { useEffect, useMemo, useState } from "react";
import {
  Aside,
  Button,
  ButtonType,
  Dropdown,
  Loader,
  SnackbarTimer,
  Text,
  TextSize,
  TextWeight,
  useSnackbar,
} from "@ginger-society/ginger-ui";
import {
  FaBoxOpen,
  FaChartLine,
  FaChartPie,
  FaCheckDouble,
  FaCodeBranch,
  FaDatabase,
  FaDesktop,
  FaEllipsisV,
  FaEnvelopeOpenText,
  FaFileAlt,
  FaGit,
  FaGithub,
  FaInfoCircle,
  FaLayerGroup,
  FaPencilAlt,
  FaRegPlayCircle,
  FaServer,
  FaTasks,
  FaTerminal,
} from "react-icons/fa";
import router from "@/shared/router";
import Markdown from "react-markdown";
import styles from "./sysDesignWrapper.module.scss";
import { shadowClassMap } from "./SysDesignView";

interface ProjectOption {
  Icon: React.ComponentType;
  label: string;
  link: string;
}

interface FooterRendererProps {
  blockData: Block;
  allowEdit?: boolean;
  staticOptionsHandler: (option: string, blockData: Block) => void
}

const FooterRenderer: React.FC<FooterRendererProps> = React.memo(
  ({ blockData, allowEdit = false, staticOptionsHandler }) => {

    const { projectOptions } = blockData.data;

    const optionStartIndex = useMemo(() => {
      if (blockData.data.type === 'database' || blockData.data.type === 'RPCEndpoint') {
        return 0;
      }
      return 1;
    }, [blockData])

    if (!projectOptions || projectOptions.length === 0) {
      return;
    }


    const firstThreeOptions: ProjectOption[] = projectOptions.slice(0, optionStartIndex);
    const moreOptions: ProjectOption[] = projectOptions.slice(optionStartIndex);


    return (
      <>
        <div className="row-content block-footer-container">

          <button
            className="block-footer-action"
            onClick={() => staticOptionsHandler('readme', blockData)}
          >
            <FaFileAlt />
            Readme
          </button>

          <button
            className="block-footer-action"
            onClick={() => staticOptionsHandler('changelog', blockData)}
          >
            <FaGit />
            Changelog
          </button>

          {blockData.data.type === "database" && (
            <button className="block-footer-action" onClick={() => staticOptionsHandler('db-studio', blockData)}>
              <FaPencilAlt />
              DB Designer
            </button>
          )}

          {blockData.data.type === "RPCEndpoint" && (
            <button className="block-footer-action" onClick={() => staticOptionsHandler('swagger', blockData)}>
              <FaInfoCircle />
              Swagger
            </button>
          )}

          {/* Render the first 3 options */}
          {firstThreeOptions.map((option, index) => (
            <a
              key={index}
              className="block-footer-action"
              href={option.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <option.Icon />
              {option.label}
            </a>
          ))}

          {/* Render the dropdown only if there are more options */}
          {moreOptions.length > 0 && (
            <div className="block-footer-action">
              <Dropdown
                label={
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    <FaEllipsisV />
                    More
                  </button>
                }
                align="left"
              >
                <ul>
                  {moreOptions.map((option, index) => (
                    <li key={index}>
                      <a
                        className="block-footer-additional-menu-item"
                        href={option.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <option.Icon />
                        {option.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </Dropdown>
            </div>
          )}
        </div>
      </>
    );
  }
);

const legendConfigs: LegendConfigs = {
  [MarkerType.Rectangle4]: {
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
  [MarkerType.Rectangle3]: {
    label: "MessageQueue",
    color: "#2E4053",
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

  const { show } = useSnackbar();
  const [isMarkdownViewertOpen, setIsMarkdownViewerOpen] =
    useState<boolean>(false);
  const [markdownViewerTitle, setMarkdownViewerTitle] = useState<string>();
  const [markdownContent, setMarkdownContent] = useState<string>();

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
    const response = await fetch(
      `${repo_origin.replace(
        "github.com",
        "raw.githubusercontent.com"
      )}/main/README.md`
    );
    const changelogTxt = await response.text();
    setMarkdownContent(changelogTxt);
  };


  const updateConnections = () => {
    const connections: Connection[] = [];
    Object.keys(blocks).forEach((key) => {
      const block = blocks[key];

      if (block.data.dependencies) {
        block.data.dependencies.forEach((dependency: string) => {
          const existingReverseConnectionIndex = connections.findIndex(conn => conn.block1Id === dependency.split("/")[1] && conn.block2Id === key);
          if (existingReverseConnectionIndex === -1) {
            connections.push({
              block1Id: key,
              block2Id: dependency.split("/")[1],
              fromRow: -1,
              toRow: -1,
              label: ``,
            });
          } else {
            connections[existingReverseConnectionIndex].marker = MarkerType.Circle;
            connections[existingReverseConnectionIndex].label = 'circular';
          }
        });
      }
      if (block.data.dbSchemaId) {
        connections.push({
          block1Id: key,
          block2Id: block.data.dbSchemaId,
          fromRow: -1,
          toRow: -1,
          label: ``,
        });
      }
      if (block.data.cacheSchemaId) {
        connections.push({
          block1Id: key,
          block2Id: block.data.cacheSchemaId,
          fromRow: -1,
          toRow: -1,
          label: ``,
        });
      }
      if (block.data.messageQueueSchemaId) {
        connections.push({
          block1Id: key,
          block2Id: block.data.messageQueueSchemaId,
          fromRow: -1,
          toRow: -1,
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
          blinkClass = shadowClassMap[block.data.pipeline_status] || "";
        }

        (accum as { [key: string]: Block })[blockKey] = {
          ...block,
          data: { ...block.data, blinkClass },
        };
        return accum;
      }, {});
    });
  };

  const handleStaticOptionsClick = (option: string, blockData: Block) => {
    if (option === 'readme') {
      openReadme(blockData.data.repo_origin)
    } else if (option === 'changelog') {
      openChangelog(blockData.data.repo_origin);
    } else if (option === 'db-studio') {
      navigateToDBEditor(blockData.id)
    } else if (option === 'swagger') {
      navigateToSwagger(blockData.id, blockData.data.org_id)
    }
  }


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
            key={rowData.id}
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
        FooterRenderer={FooterRenderer}
        staticOptionsHandler={handleStaticOptionsClick}
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
                    {blockData.data.type === "messagequeue" && (
                      <FaEnvelopeOpenText />
                    )}
                    {/* <button
                      onClick={() => openReadme(blockData.data.repo_origin)}
                    >
                    </button> */}
                    {blockData.data.name}

                    {/* {blockData.data.type === "RPCEndpoint" && (
                      <FaInfoCircle
                        onClick={() =>
                          navigateToSwagger(blockData.id, blockData.data.org_id)
                        }
                      />
                    )} */}
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
                    {/* <button
                      onClick={(e) => {
                        openChangelog(blockData.data.repo_origin);
                        e.stopPropagation();
                      }}
                    >
                      <span style={{ fontWeight: "normal", fontSize: "13px" }}>
                        View changelog
                      </span>
                    </button> */}
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
        <div className="md-wrapper">
          {markdownContent ? (
            <Markdown>{markdownContent}</Markdown>
          ) : (
            <Loader />
          )}
        </div>
      </Aside>
    </>
  );
};

export default SysDesignWrapper;
