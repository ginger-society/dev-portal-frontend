import React, { useEffect, useState, version } from "react";
import {
  FaBox,
  FaServer,
  FaDatabase,
  FaCogs,
  FaBuilding,
  FaLock,
  FaLockOpen,
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
} from "@ginger-society/ginger-ui";
import { MetadataService } from "@/services";
import { useParams } from "react-router-dom";
import styles from "./sysDesignView.module.scss";
import router from "@/shared/router";
import WorkspaceSwitcher from "@/components/organisms/WorkspaceSwitcher";

const blockColorMap = {
  database: "#89439f",
  RPCEndpoint: "#799351",
  Portal: "#1A4870",
  library: "#1A4870",
};

const SysDesignView = () => {
  const [blocks, setBlocks] = useState<{ [key: string]: Block }>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [editorData, setEditorData] = useState<EditorData>();
  const { env, org_id } = useParams<{ env: string; org_id: string }>();
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [pipeline_status, setPipeline_status] = useState<string>("checking...");
  const [pipeline_status_color, setPipeline_status_color] = useState<TextColor>(
    TextColor.Primary
  );

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

  const fetchAndProcessSystemDesign = async (): Promise<{
    [key: string]: Block;
  }> => {
    const blocks: { [key: string]: Block } = {};
    if (!env || !org_id) {
      return {};
    }
    const packages = await MetadataService.metadataGetUserPackages({
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
          color:
            pkg.pipelineStatus === "failed"
              ? "red"
              : pkg.packageType != "library"
              ? "#4793AF"
              : null,
          pipeline_status: pkg.pipelineStatus,
          repo_origin: pkg.repoOrigin,
        },
        rows,
      };
    });

    const dbSchemas = await MetadataService.metadataGetDbschemasAndTables({
      env,
      orgId: org_id,
    });
    // console.log(dbSchemas);
    dbSchemas.forEach((schema) => {
      if (schema.identifier) {
        blocks[schema.identifier] = {
          id: schema.identifier,
          ref: React.createRef(),
          data: {
            name: schema.name,
            type: "database",
            description: schema.description,
            color:
              schema.pipelineStatus === "failed"
                ? "red"
                : blockColorMap.database,
            version: schema.version,
            pipeline_status: schema.pipelineStatus,
            repo_origin: schema.repoOrigin,
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
          org_id: service.organizationId,
          repo_origin: service.repoOrigin,
          color:
            pipeline_status === "failed"
              ? "red"
              : service.serviceType &&
                (blockColorMap as any)[service.serviceType],
          version: service.envs.find((s) => s.envKey === env)?.version,
          pipeline_status,
        },
        rows: rows,
        type: BlockType.SystemBlock,
        position: { top: 100, left: 100 },
      };
    });

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
    } else {
      setPipeline_status("Passing");
      setPipeline_status_color(TextColor.Success);
    }

    return blocks;
  };

  const loadLayout = async () => {
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
  };

  useEffect(() => {
    loadLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [env, org_id]);

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
    </UMLEditorProvider>
  );
};

export default SysDesignView;
