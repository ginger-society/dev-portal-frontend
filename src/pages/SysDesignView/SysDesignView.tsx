import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  version,
} from "react";
import {
  FaBox,
  FaServer,
  FaDatabase,
  FaCogs,
  FaBuilding,
  FaLock,
  FaLockOpen,
  FaCodeBranch,
  FaRegPlayCircle,
  FaTasks,
  FaEllipsisV,
  FaChartLine,
  FaGithub,
  FaChartPie,
  FaRegFileAlt,
  FaLink,
  FaNpm,
  FaRust,
  FaGlobe,
  FaCheck,
  FaExternalLinkAlt,
  FaDigitalOcean,
  FaAws,
  FaDocker,
  FaPython,
  FaGoogle,
} from "react-icons/fa";
import UMLEditor from "@/components/organisms/UMLEditor";
import {
  UMLEditorProvider,
  useUMLEditor,
} from "@/components/organisms/UMLEditor/context";
import {
  Block,
  Connection,
  BlockType,
  Row,
  MarkerType,
  EditorData,
  BlockData,
} from "@/components/organisms/UMLEditor/types";
import { PageLayout } from "@/shared/PageLayout";
import { ColumnType } from "@/components/organisms/ColumnEditor/types";
import SysDesignWrapper from "./SysDesignWrapper";
import HeaderContainer from "@/components/atoms/HeaderContainer";
import {
  Button,
  Dropdown,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  ModalSize,
  SnackbarTimer,
  useSnackbar,
  Text,
  TextColor,
  Aside,
  TextSize,
  Loader,
  Accordion,
  Section,
  Table,
} from "@ginger-society/ginger-ui";
import { MetadataService } from "@/services";
import { useParams } from "react-router-dom";
import styles from "./sysDesignView.module.scss";
import router from "@/shared/router";
import WorkspaceSwitcher from "@/components/organisms/WorkspaceSwitcher";
import { IconType } from "react-icons";
import Markdown from "react-markdown";
import {
  SnapshotsResponse,
  WorkspaceSummary,
} from "@/services/MetadataService_client";
import { NotificationContext } from "@/shared/NotificationContext";

export const IconsMap = {
  FaCodeBranch,
  FaRegPlayCircle,
  FaTasks,
  FaChartLine,
  FaGithub,
  FaChartPie,
  FaRegFileAlt,
  FaLink,
  FaNpm,
  FaRust,
  FaGlobe,
  FaDigitalOcean,
  FaAws,
  FaDocker,
  FaPython,
  FaGoogle,
};

interface Service {
  identifier: string;
  version: string;
}

interface Package {
  identifier: string;
  version: string;
}

interface Database {
  name: string;
  version: string;
}

interface SystemSnapshot {
  services: Service[];
  packages: Package[];
  databases: Database[];
}

const blockColorMap = {
  database: "#89439f",
  RPCEndpoint: "#799351",
  Portal: "#1A4870",
  library: "#1A4870",
  Cache: "#6e46c0",
  MessageQueue: "#2E4053",
};

export const shadowClassMap: { [key: string]: string } = {
  running: "blink-orange",
  failed: "blink-red",
};

const SysDesignView = () => {
  const [isMarkdownViewertOpen, setIsMarkdownViewerOpen] =
    useState<boolean>(false);
  const [markdownViewerTitle, setMarkdownViewerTitle] = useState<string>();
  const [markdownContent, setMarkdownContent] = useState<string>();

  const [orgs, setOrgs] = useState<WorkspaceSummary[]>([]);

  const [blocks, setBlocks] = useState<{ [key: string]: Block }>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [editorData, setEditorData] = useState<EditorData>();
  const { env, org_id } = useParams<{ env: string; org_id: string }>();
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [pipeline_status, setPipeline_status] = useState<string>("checking...");
  const [pipeline_status_color, setPipeline_status_color] = useState<TextColor>(
    TextColor.Primary
  );

  const [snapshots, setSnapshots] = useState<SnapshotsResponse[]>([]);
  const [isSnapshotsViewertOpen, setIsSnapshotsViewerOpen] =
    useState<boolean>(false);

  const [snapshotDetails, setSnapshotDetails] = useState<{
    [key: string]: SystemSnapshot;
  }>({});

  const toggleLock = () => {
    setIsLocked((l) => {
      if (!l) {
        saveLayout();
      }
      return !l;
    });
  };

  const transformDataToSave = () => {
    return Object.values(blocks).reduce((accum, block) => {
      return {
        ...accum,
        [block.id]: { position: block.position },
      };
    }, {});
  };

  const { show } = useSnackbar();

  const saveLayout = async () => {
    if (!org_id) {
      return;
    }
    try {
      const response = await MetadataService.metadataUpdateBlockPositions({
        orgId: org_id,
        body: JSON.stringify(transformDataToSave()),
      });
      show(<>Layout Saved</>, SnackbarTimer.Medium);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAndProcessSystemDesign = useCallback(async (): Promise<{
    [key: string]: Block;
  }> => {
    const blocks: { [key: string]: Block } = {};
    if (!env || !org_id) {
      return {};
    }
    const packages = await MetadataService.metadataGetUserPackagesUserLand({
      env,
      orgId: org_id,
    });

    packages.forEach((pkg) => {
      const rows = [];
      if (pkg.dependencies.length > 0) {
        rows.push({
          id: `${pkg.identifier}-dependencies`,
          data: { heading: "Dependns on", list: pkg.dependencies },
        });
      }

      blocks[pkg.identifier] = {
        id: pkg.identifier,
        position: { top: 100, left: 100 },
        type: BlockType.SystemBlock,
        ref: React.createRef(),
        data: {
          name: pkg.identifier,
          description: pkg.description,
          type: pkg.packageType,
          dependencies: pkg.dependencies,
          version: pkg.version,
          blinkClass: pkg.pipelineStatus && shadowClassMap[pkg.pipelineStatus],
          color:
            pkg.pipelineStatus === "failed"
              ? "red"
              : pkg.packageType != "library"
              ? "#4793AF"
              : null,
          pipeline_status: pkg.pipelineStatus,
          repo_origin: pkg.repoOrigin,
          projectOptions: pkg.quickLinks
            ? JSON.parse(pkg.quickLinks).map((link: any) => {
                return {
                  ...link,
                  Icon: IconsMap[link.icon as keyof IconType],
                };
              })
            : null,
        },
        rows,
      };
    });

    const dbSchemas =
      await MetadataService.metadataGetDbschemasAndTablesUserLand({
        env,
        orgId: org_id,
      });
    // console.log(dbSchemas);
    dbSchemas.forEach((schema) => {
      if (schema.identifier) {
        if (schema.dbType === "rdbms") {
          blocks[schema.identifier] = {
            id: schema.identifier,
            ref: React.createRef(),
            data: {
              name: schema.name,
              type: "database",
              description: schema.description,
              blinkClass:
                schema.pipelineStatus && shadowClassMap[schema.pipelineStatus],
              color: blockColorMap.database,
              version: schema.version,
              pipeline_status: schema.pipelineStatus,
              repo_origin: schema.repoOrigin,
              projectOptions: schema.quickLinks
                ? JSON.parse(schema.quickLinks).map((link: any) => {
                    return {
                      ...link,
                      Icon: IconsMap[link.icon as keyof IconType],
                    };
                  })
                : null,
            },
            rows: [
              {
                id: `${schema.identifier}-tables`,
                data: { heading: "Tables", list: schema.tables },
              },
            ],
            type: BlockType.SystemBlock,
            position: { top: 100, left: 100 },
          };
        } else if (schema.dbType === "cache") {
          blocks[schema.identifier] = {
            id: schema.identifier,
            ref: React.createRef(),
            data: {
              name: schema.name,
              type: "cache",
              description: schema.description,

              blinkClass:
                schema.pipelineStatus && shadowClassMap[schema.pipelineStatus],

              color: blockColorMap.Cache,
              version: schema.version,
              pipeline_status: schema.pipelineStatus,
              repo_origin: schema.repoOrigin,
              projectOptions: schema.quickLinks
                ? JSON.parse(schema.quickLinks).map((link: any) => {
                    return {
                      ...link,
                      Icon: IconsMap[link.icon as keyof IconType],
                    };
                  })
                : null,
            },
            rows: [],
            type: BlockType.SystemBlock,
            position: { top: 100, left: 100 },
          };
        } else {
          blocks[schema.identifier] = {
            id: schema.identifier,
            ref: React.createRef(),
            data: {
              name: schema.name,
              type: "messagequeue",
              description: schema.description,
              blinkClass:
                schema.pipelineStatus && shadowClassMap[schema.pipelineStatus],

              color: blockColorMap.MessageQueue,
              version: schema.version,
              pipeline_status: schema.pipelineStatus,
              repo_origin: schema.repoOrigin,
              projectOptions: schema.quickLinks
                ? JSON.parse(schema.quickLinks).map((link: any) => {
                    return {
                      ...link,
                      Icon: IconsMap[link.icon as keyof IconType],
                    };
                  })
                : null,
            },
            rows: [],
            type: BlockType.SystemBlock,
            position: { top: 100, left: 100 },
          };
        }
      }
    });

    const services = await MetadataService.metadataGetServicesAndEnvsUserLand({
      orgId: org_id,
    });
    services.forEach((service) => {
      const rows = [];
      if (service.dependencies.length > 0) {
        rows.push({
          id: `${service.identifier}-dependencies`,
          data: {
            heading: "Depends on",
            list: service.dependencies,
          },
        });
      }

      if (service.tables.length > 0) {
        rows.push({
          id: `${service.dbSchemaId}-tables`,
          data: {
            heading: (
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <FaDatabase /> Database
              </div>
            ),
            list: service.tables,
            description: (
              <>
                From
                <strong>
                  {
                    dbSchemas.find(
                      (schema) => schema.identifier === service.dbSchemaId
                    )?.name
                  }
                </strong>
                uses the following tables
              </>
            ),
          },
        });
      }

      if (service.cacheSchemaId) {
        rows.push({
          id: `${service.cacheSchemaId}`,
          data: {
            heading: (
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <FaDatabase /> Cache
              </div>
            ),
            list: [],
            description: (
              <div style={{ display: "flex", gap: "5px" }}>
                Uses
                <strong>
                  {
                    dbSchemas.find(
                      (schema) => schema.identifier === service.cacheSchemaId
                    )?.name
                  }
                </strong>
                as Cache
              </div>
            ),
          },
        });
      }
      if (service.messageQueueSchemaId) {
        rows.push({
          id: `${service.messageQueueSchemaId}`,
          data: {
            heading: (
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <FaDatabase /> Message Queue
              </div>
            ),
            list: [],
            description: (
              <div style={{ display: "flex", gap: "5px" }}>
                Uses
                <strong>
                  {
                    dbSchemas.find(
                      (schema) =>
                        schema.identifier === service.messageQueueSchemaId
                    )?.name
                  }
                </strong>
                as Message Queue
              </div>
            ),
          },
        });
      }

      const pipeline_status = service.envs.find(
        (s) => s.envKey === env
      )?.pipelineStatus;

      blocks[service.identifier] = {
        id: service.identifier,
        ref: React.createRef(),
        data: {
          name: service.identifier,
          type: service.serviceType,
          description: service.description,
          dependencies: service.dependencies,
          dbSchemaId: service.dbSchemaId,
          cacheSchemaId: service.cacheSchemaId,
          messageQueueSchemaId: service.messageQueueSchemaId,
          org_id: service.organizationId,
          repo_origin: service.repoOrigin,
          blinkClass: pipeline_status && shadowClassMap[pipeline_status],
          color:
            pipeline_status === "failed"
              ? "red"
              : service.serviceType &&
                (blockColorMap as any)[service.serviceType],
          version: service.envs.find((s) => s.envKey === env)?.version,
          pipeline_status,
          projectOptions: service.quickLinks
            ? JSON.parse(service.quickLinks).map((link: any) => {
                return {
                  ...link,
                  Icon: IconsMap[link.icon as keyof IconType],
                };
              })
            : null,
        },
        rows: rows,
        type: BlockType.SystemBlock,
        position: { top: 100, left: 100 },
      };
    });
    updateOverallStatus(blocks);
    return blocks;
  }, [env, org_id]);

  const updateOverallStatus = (blocks: { [key: string]: Block }) => {
    const statuses = Object.keys(blocks).reduce(
      (allStatuses: string[], key) => {
        return [...allStatuses, blocks[key].data.pipeline_status];
      },
      []
    );

    if (statuses.includes("failed")) {
      setPipeline_status("failed");
      setPipeline_status_color(TextColor.Danger);
    } else if (statuses.includes("running")) {
      setPipeline_status("running...");
      setPipeline_status_color(TextColor.Warning);
    } else if (statuses.includes("waiting")) {
      setPipeline_status("Waiting...");
      setPipeline_status_color(TextColor.Warning);
    } else {
      setPipeline_status("Passing");
      setPipeline_status_color(TextColor.Success);
    }
  };

  const loadLayout = useCallback(async () => {
    if (!org_id) {
      return;
    }
    try {
      const response = await MetadataService.metadataGetWorkspace({
        orgId: org_id,
      });
      const layoutData = response.blockPositions;
      const sysBlockData = await fetchAndProcessSystemDesign();
      if (layoutData) {
        const layoutJson = JSON.parse(layoutData) as {
          [key: string]: { position: { top: number; left: number } };
        };

        const data = Object.values(sysBlockData).reduce((accum, block) => {
          return {
            ...accum,
            [block.id]: {
              ...block,
              position: (layoutJson[block.id] &&
                layoutJson[block.id].position) || { top: 100, left: 100 },
            },
          };
        }, {});
        setBlocks(data);
        setConnections([]);
      } else {
        setBlocks(sysBlockData);
        setConnections([]);
      }
    } catch (error) {
      console.log(error);
    }
  }, [fetchAndProcessSystemDesign, org_id]);

  useEffect(() => {
    loadLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [env, org_id]);

  const fetchData = async () => {
    try {
      const response = await MetadataService.metadataGetWorkspaces();

      setOrgs(
        response.map((r) => {
          return {
            ...r,
            quickLinks: JSON.parse(r.quickLinks || "[]").map((l: any) => {
              return {
                ...l,
                icon: IconsMap[l.icon as keyof IconType],
              };
            }),
          };
        })
      );
    } catch (error) {
      console.log(error);
    }
  };

  const { subscribeToTopic } = useContext(NotificationContext);
  useEffect(() => {
    subscribeToTopic("pipeline-update", (msg: any) => {
      console.log("Received message for pipeline-update:", msg);
      setBlocks((v) => {
        const updatedBlocks = {
          ...v,
          [msg.identifier]: {
            ...v[msg.identifier],
            data: {
              ...v[msg.identifier].data,
              pipeline_status: msg.status,
              blinkClass: shadowClassMap[msg.status],
            },
          },
        };
        updateOverallStatus(updatedBlocks);
        return updatedBlocks;
      });
    });
  }, [subscribeToTopic, loadLayout]);

  useEffect(() => {
    fetchData();
  }, []);

  const openOrgChangelog = async () => {
    const repoLink = orgs.find((o) => o.slug === org_id)?.infraRepoOrigin;
    if (!repoLink) {
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
      `${repoLink.replace(
        "github.com",
        "raw.githubusercontent.com"
      )}/main/CHANGELOG.md`
    );
    const changelogTxt = await response.text();
    setMarkdownContent(changelogTxt);
  };

  const openIACReadme = async () => {
    const repoLink = orgs.find((o) => o.slug === org_id)?.infraRepoOrigin;
    if (!repoLink) {
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
      `${repoLink.replace(
        "github.com",
        "raw.githubusercontent.com"
      )}/main/README.md`
    );
    const changelogTxt = await response.text();
    setMarkdownContent(changelogTxt);
  };

  const navigateToSnapshots = async () => {
    if (!org_id) return;
    const snapshots = await MetadataService.metadataGetSnapshots({
      orgId: org_id,
    });
    setSnapshots(snapshots);
    setIsSnapshotsViewerOpen(true);
    const details = await getSnapshotDetails(snapshots[0].version);
    if (!details) {
      return;
    }
    setSnapshotDetails((v) => {
      return {
        ...v,
        [snapshots[0].version]: details,
      };
    });
  };

  const getSnapshotDetails = async (
    version: string
  ): Promise<SystemSnapshot | null> => {
    const repoLink = orgs.find((o) => o.slug === org_id)?.infraRepoOrigin;
    if (!repoLink) {
      return null;
    }
    // https://github.com/ginger-society/infra-as-code-repo/blob/main/snapshots/0.10.0-nightly.0.json

    const response = await fetch(
      `${repoLink.replace(
        "github.com",
        "raw.githubusercontent.com"
      )}/main/snapshots/${version}.json`
    );
    const snapshotDetails = await response.json();
    return snapshotDetails;
  };

  const fetchSnapshotDetails = async (version: string) => {
    const details = await getSnapshotDetails(version);
    if (!details) {
      return;
    }
    setSnapshotDetails((v) => {
      return { ...v, [version]: details };
    });
  };

  return (
    <UMLEditorProvider
      value={{
        blocks,
        setBlocks,
        connections,
        setConnections,
        editorData,
        setEditorData,
      }}
    >
      <HeaderContainer>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <WorkspaceSwitcher />
          <Text color={pipeline_status_color}>
            Pipeline Status : {pipeline_status}
          </Text>
          <Button label="View changelog" onClick={openOrgChangelog} />
          <Button label="View Snapshots" onClick={navigateToSnapshots} />
          <Button label="Day 0 handbook" onClick={openIACReadme} />

          <Dropdown
            label={
              <Button
                label={
                  <>
                    <FaExternalLinkAlt />
                    Quick Links
                  </>
                }
              ></Button>
            }
            align="left"
          >
            <ul>
              {(
                (orgs.find((o) => o.slug === org_id)
                  ?.quickLinks as unknown as any[]) || []
              ).map((link: any, i: number) => {
                const Icon = link.icon;
                return (
                  <li
                    onClick={() => window.open(link.link, "_blank")}
                    key={i}
                    className={`${styles["quick-link-item"]}`}
                  >
                    {<Icon />}
                    {link.label}
                  </li>
                );
              })}
            </ul>
          </Dropdown>
        </div>
      </HeaderContainer>
      <button className={styles["save-layout-btn"]} onClick={toggleLock}>
        {isLocked ? (
          <>
            <FaLock /> Locked
          </>
        ) : (
          <>
            <FaLockOpen /> Lock to save
          </>
        )}
      </button>
      <SysDesignWrapper allowDrag={!isLocked} />
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

      <Aside
        isOpen={isSnapshotsViewertOpen}
        onClose={() => setIsSnapshotsViewerOpen(false)}
      >
        <div
          style={{ height: "100vh", overflow: "auto", paddingBottom: "200px" }}
        >
          <Accordion>
            {snapshots.map((s, i) => {
              return (
                <Section
                  head={<Text>{s.version}</Text>}
                  open={i === 0}
                  onOpen={() => fetchSnapshotDetails(s.version)}
                >
                  <Text size={TextSize.Large}>Databases</Text>

                  <Table>
                    <thead>
                      <tr>
                        <th>Identifier</th>
                        <th>Version</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshotDetails[s.version] &&
                        (snapshotDetails[s.version].databases.map((d) => {
                          return (
                            <tr>
                              <td>{d.name}</td>
                              <td>{d.version}</td>
                            </tr>
                          );
                        }) as any)}
                    </tbody>
                  </Table>
                  <Text size={TextSize.Large}>Services</Text>

                  <Table>
                    <thead>
                      <tr>
                        <th>Identifier</th>
                        <th>Version</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshotDetails[s.version] &&
                        (snapshotDetails[s.version].services.map((s) => {
                          return (
                            <tr>
                              <td>{s.identifier}</td>
                              <td>{s.version}</td>
                            </tr>
                          );
                        }) as any)}
                    </tbody>
                  </Table>

                  <Text size={TextSize.Large}>Packages</Text>

                  <Table>
                    <thead>
                      <tr>
                        <th>Identifier</th>
                        <th>Version</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshotDetails[s.version] &&
                        (snapshotDetails[s.version].packages.map((p) => {
                          return (
                            <tr>
                              <td>{p.identifier}</td>
                              <td>{p.version}</td>
                            </tr>
                          );
                        }) as any)}
                    </tbody>
                  </Table>
                </Section>
              );
            })}
          </Accordion>
        </div>
      </Aside>
    </UMLEditorProvider>
  );
};

export default SysDesignView;
