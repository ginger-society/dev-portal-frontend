import { useEffect, useState } from "react";
import { FaLock } from "react-icons/fa";
import { UMLEditorProvider } from "@/components/organisms/UMLEditor/context";
import {
  Block,
  Connection,
  EditorData,
} from "@/components/organisms/UMLEditor/types";
import SysDesignWrapper from "./SysDesignWrapper";
import { Button, ButtonType, Text, TextColor } from "@ginger-society/ginger-ui";
import { MetadataService } from "@/services";
import { useParams } from "react-router-dom";
import styles from "./sysDesignView.module.scss";
import { GINGER_SOCIETY_IAM_FRONTEND_USERS } from "@/shared/references";
import { processAndBuildBlocks } from "./utils";

const blockColorMap = {
  database: "#89439f",
  RPCEndpoint: "#799351",
  Portal: "#1A4870",
  library: "#1A4870",
  Cache: "#6e46c0",
};

const shadowClassMap: { [key: string]: string } = {
  running: "blink-orange",
  failed: "blink-red",
};

const SysDesignViewPublic = () => {
  const [blocks, setBlocks] = useState<{ [key: string]: Block }>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [editorData, setEditorData] = useState<EditorData>();
  const { env, org_id } = useParams<{ env: string; org_id: string }>();
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [pipeline_status, setPipeline_status] = useState<string>("checking...");
  const [pipeline_status_color, setPipeline_status_color] = useState<TextColor>(
    TextColor.Primary
  );

  const fetchAndProcessSystemDesign = async (): Promise<{
    [key: string]: Block;
  }> => {
    if (!env || !org_id) {
      return {};
    }
    const packages = await MetadataService.metadataGetUserPackagesPublic({
      env,
      orgId: org_id,
    });

    const dbSchemas = await MetadataService.metadataGetDbschemasAndTablesPublic(
      {
        env,
        orgId: org_id,
      }
    );

    const services = await MetadataService.metadataGetServicesAndEnvsPublic({
      orgId: org_id,
    });

    const { blocks, statusTxt, statusColor } = processAndBuildBlocks(services, packages, dbSchemas, env);

    setPipeline_status(statusTxt);
    setPipeline_status_color(statusColor);

    return blocks;
  };

  const loadLayout = async () => {
    if (!org_id) {
      return;
    }
    try {
      const response = await MetadataService.metadataGetWorkspacePublic({
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

  const navigateToLogin = () => {
    location.href = `${GINGER_SOCIETY_IAM_FRONTEND_USERS}#dev-portal-staging/login`;
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
      <div
        className={styles['public-view-header']}
      >
        <Text>Organization ID : {org_id}</Text>
        <Text color={pipeline_status_color}>
          Pipeline Status : {pipeline_status}
        </Text>
        <div style={{ marginLeft: "auto" }}>
          <Button
            onClick={navigateToLogin}
            type={ButtonType.Primary}
            label={
              "Sign in to create your own System Design out of your code base"
            }
          ></Button>
        </div>
      </div>
      <button className={styles["save-layout-btn"]}>
        <FaLock /> View Only
      </button>
      <SysDesignWrapper isPublicView={true} allowDrag={false} />
    </UMLEditorProvider>
  );
};

export default SysDesignViewPublic;
