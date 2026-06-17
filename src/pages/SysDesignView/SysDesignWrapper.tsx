import {
  LegendConfigs, LegendItemT, UMLEditor, useUMLEditor, Block,
  BlockType,
  Connection,
  MarkerType,
} from "@ginger-society/ginger-ui-uml";
import React, { useEffect, useMemo, useState } from "react";
import {
  Aside,
  Dropdown,
  Input,
  Loader,
  Modal,
  ModalBody,
  ModalHeader,
  ModalSize,
  SnackbarTimer,
  Text,
  TextSize,
  useSnackbar,
} from "@gingersociety/ginger-ui";
import {
  FaBoxOpen,
  FaCheckDouble,
  FaDatabase,
  FaDesktop,
  FaEllipsisV,
  FaEnvelopeOpenText,
  FaFileAlt,
  FaGit,
  FaInfoCircle,
  FaLayerGroup,
  FaPencilAlt,
  FaServer,
  FaTerminal,
} from "react-icons/fa";
import router from "@/shared/router";
import { shadowClassMap } from "./SysDesignView";
import { GingerGitter } from "@/services";
import { FileContentResponse } from "@/services/ginger-gitter_client";

const mockCatalog = [
  {
    id: 1,
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/919/919836.png',
    title: 'Rust Backend',
    description: 'Starter project for building APIs with Rust and Actix Web.',
  },
  {
    id: 2,
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/919/919825.png',
    title: 'Next.js Frontend',
    description: 'A production-ready frontend template using Next.js and Tailwind CSS.',
  },
  {
    id: 3,
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/919/919830.png',
    title: 'Go Microservice',
    description: 'Lightweight Go template for scalable microservices.',
  },
];

interface ProjectOption {
  Icon: React.ComponentType;
  label: string;
  link: string;
}

interface FooterRendererProps {
  blockData: Block;
  allowEdit?: boolean;
  staticOptionsHandler: (option: string, blockData: Block) => void;
}

const FooterRenderer: React.FC<FooterRendererProps> = React.memo(
  ({ blockData, allowEdit = false, staticOptionsHandler }) => {
    const { projectOptions } = blockData.data;

    const optionStartIndex = useMemo(() => {
      if (blockData.data.type === 'database' || blockData.data.type === 'RPCEndpoint') {
        return 0;
      }
      return 1;
    }, [blockData]);

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

          {moreOptions.length > 0 && (
            <div className="block-footer-action">
              <Dropdown
                label={
                  <button
                    className="block-footer-action"
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
                <ul style={{ listStyle: 'none', paddingInlineStart: '0', marginBlockStart: 0, marginBlockEnd: 0 }}>
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
            </div >
          )}
        </div >
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
    label: "database",
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
  const [isMarkdownViewerOpen, setIsMarkdownViewerOpen] = useState<boolean>(false);
  const [markdownViewerTitle, setMarkdownViewerTitle] = useState<string>();
  const [fileViewerContent, setFileViewerContent] = useState<FileContentResponse | undefined>(undefined);

  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [catalogSearchTxt, setCatalogSearchTxt] = useState<string>('');

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

  const openFile = async (blockId: string, filePath: string, title: string) => {
    setMarkdownViewerTitle(title);
    setIsMarkdownViewerOpen(true);
    setFileViewerContent(undefined);

    try {
      const response = await GingerGitter.handleFileContent({
        fileContentRequest: {
          repo: `org-${blockId}`,
          path: filePath,
          highlight: true,
          branch: "main",
        },
      });
      setFileViewerContent(response);
    } catch (e) {
      show(<>Failed to load {title}</>, SnackbarTimer.Short);
      setIsMarkdownViewerOpen(false);
    }
  };

  const openChangelog = (blockId: string) => {
    openFile(blockId, "CHANGELOG.md", "Changelog");
  };

  const openReadme = (blockId: string) => {
    openFile(blockId, "README.md", "Readme");
  };

  const updateConnections = () => {
    const connections: Connection[] = [];
    Object.keys(blocks).forEach((key) => {
      const block = blocks[key];

      if (block.data.dependencies) {
        block.data.dependencies.forEach((dependency: string) => {
          const existingReverseConnectionIndex = connections.findIndex(
            conn => conn.block1Id === dependency.split("/")[1] && conn.block2Id === key
          );
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
      openReadme(blockData.id);
    } else if (option === 'changelog') {
      openChangelog(blockData.id);
    } else if (option === 'db-studio') {
      navigateToDBEditor(blockData.id);
    } else if (option === 'swagger') {
      navigateToSwagger(blockData.id, blockData.data.org_id);
    }
  };

  const yourDoubleClickHandler = (event: React.MouseEvent<HTMLDivElement>) => {
    console.log(event);
    setIsCatalogOpen(true);
  };

  const filteredCatalog = mockCatalog.filter(item =>
    item.title.toLowerCase().includes(catalogSearchTxt.toLowerCase()) ||
    item.description.toLowerCase().includes(catalogSearchTxt.toLowerCase())
  );

  return (
    <div onDoubleClick={yourDoubleClickHandler}>
      <Modal
        size={ModalSize.XLarge}
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
      >
        <ModalHeader>Software Inventory</ModalHeader>
        <ModalBody>
          <div style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
            <Input
              label="Search"
              value={catalogSearchTxt}
              onChange={({ target: { value } }) => setCatalogSearchTxt(value)}
              style={{ marginBottom: '16px' }}
            />
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredCatalog.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                  }}
                  onClick={() => router.navigate(`/genesis/ginger-society/i`)}
                >
                  <img
                    src={item.iconUrl}
                    alt={item.title}
                    style={{ width: '40px', height: '40px', marginRight: '12px', borderRadius: '6px', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.title}</div>
                    <div style={{ fontSize: '14px', color: '#777' }}>{item.description}</div>
                  </div>
                </div>
              ))}
              {filteredCatalog.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#aaa' }}>
                  No matching templates found.
                </div>
              )}
            </div>
          </div>
        </ModalBody>
      </Modal>

      <UMLEditor
        handleLegendClick={handleLegendClick}
        setBlocks={setBlocks}
        setConnections={setConnections}
        blocks={blocks}
        connections={connections}
        RowRenderer={({ rowData }) => (
          <div
            key={rowData.id}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <Text size={TextSize.Small}>{rowData.data.heading}</Text>
            <Text size={TextSize.Small}>{rowData.data.description}</Text>
            {rowData.data.list.map((listItem: string) => (
              <>
                <Text size={TextSize.Small}> &#x2192; {listItem}</Text>
              </>
            ))}
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
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {blockData.data.type === "database" && <FaDatabase />}
                    {blockData.data.type === "RPCEndpoint" && <FaServer />}
                    {blockData.data.type === "library" && <FaBoxOpen />}
                    {blockData.data.type === "executable" && <FaTerminal />}
                    {blockData.data.type === "Portal" && <FaDesktop />}
                    {blockData.data.type === "cache" && <FaLayerGroup />}
                    {blockData.data.type === "messagequeue" && <FaEnvelopeOpenText />}
                    {blockData.data.name}
                  </span>
                  <span style={{ fontWeight: "normal", fontSize: "12px" }}>
                    {blockData.data.description}
                  </span>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "normal", fontSize: "13px" }}>
                      Version: {blockData.data.version}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: "normal", fontSize: "13px", display: "flex", alignItems: "center", gap: "10px" }}>
                      Pipeline:{" "}
                      <span style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px" }}>
                        {blockData.data.pipeline_status || "Not available"}{" "}
                        {blockData.data.pipeline_status === "passing" && <FaCheckDouble />}
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
        isOpen={isMarkdownViewerOpen}
        onClose={() => setIsMarkdownViewerOpen(false)}
      >
        <Text tag="h1" size={TextSize.Large}>
          {markdownViewerTitle}
        </Text>
        <div className="md-wrapper">
          {fileViewerContent ? (
            <pre style={{ margin: 0, padding: 0 }}>
              {fileViewerContent.lines?.map((line) => (
                <div
                  key={line.lineno}
                  dangerouslySetInnerHTML={{ __html: line.highlightedLight }}
                />
              ))}
            </pre>
          ) : (
            <Loader />
          )}
        </div>
      </Aside>
    </div>
  );
};

export default SysDesignWrapper;