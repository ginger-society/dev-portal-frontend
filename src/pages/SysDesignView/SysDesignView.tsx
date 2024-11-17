import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  version,
} from "react";
import {
  FaLock,
  FaLockOpen,
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
  FaExternalLinkAlt,
  FaDigitalOcean,
  FaAws,
  FaDocker,
  FaPython,
  FaGoogle,
} from "react-icons/fa";
import {
  UMLEditorProvider,
  Block,
  Connection,
  EditorData,
} from "@ginger-society/ginger-ui-uml";

import SysDesignWrapper from "./SysDesignWrapper";
import HeaderContainer from "@/components/atoms/HeaderContainer";
import {
  Button,
  Dropdown,
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
import WorkspaceSwitcher from "@/components/organisms/WorkspaceSwitcher";
import { IconType } from "react-icons";
import Markdown from "react-markdown";
import {
  SnapshotsResponse,
  WorkspaceSummaryResponse,
} from "@/services/MetadataService_client";
import { NotificationContext } from "@/shared/NotificationContext";
import { processAndBuildBlocks } from "./utils";

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

export const blockColorMap = {
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

  const [orgs, setOrgs] = useState<WorkspaceSummaryResponse[]>([]);

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
    if (!env || !org_id) {
      return {};
    }
    const packages = await MetadataService.metadataGetUserPackagesUserLand({
      env,
      orgId: org_id,
    });

    const dbSchemas =
      await MetadataService.metadataGetDbschemasAndTablesUserLand({
        env,
        orgId: org_id,
      });

    const services = await MetadataService.metadataGetServicesAndEnvsUserLand({
      orgId: org_id,
    });

    const { blocks, statusTxt, statusColor } = processAndBuildBlocks(services, packages, dbSchemas, env)
    setPipeline_status(statusTxt);
    setPipeline_status_color(statusColor);
    return blocks;

  }, [env, org_id]);


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
            <ul style={{paddingInlineStart: 0}}>
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
