import React, { useEffect, useState } from "react";
import { FaBox, FaServer, FaDatabase, FaCogs } from "react-icons/fa";
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
import { Button, SnackbarTimer, useSnackbar } from "@ginger-society/ginger-ui";
import { MetadataService } from "@/services";

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

  const transformDataToSave = () => {
    return Object.values(blocks).reduce((accum, block) => {
      return {
        ...accum,
        [block.id]: { position: block.position },
      };
    }, {});
  };

  const { show } = useSnackbar();

  const saveLayout = () => {
    localStorage.setItem("sys-design", JSON.stringify(transformDataToSave()));
    show(<>Saved in local storage</>, SnackbarTimer.Medium);
  };

  const fetchAndProcessSystemDesign = async (): Promise<{
    [key: string]: Block;
  }> => {
    const blocks: { [key: string]: Block } = {};

    const packages = await MetadataService.metadataGetUserPackages();

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
        },
        rows,
      };
    });

    const dbSchemas = await MetadataService.metadataGetDbschemasAndTables();
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
            color: blockColorMap.database,
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

    const services = await MetadataService.metadataGetServicesAndEnvs();
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
                {" "}
                <FaDatabase /> Database
              </div>
            ),
            list: service.tables,
            description: (
              <>
                From{" "}
                <strong>
                  {
                    dbSchemas.find(
                      (schema) => schema.identifier === service.dbSchemaId
                    )?.name
                  }
                </strong>{" "}
                Uses the following tables
              </>
            ),
          },
        });
      }

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
          color:
            service.serviceType && (blockColorMap as any)[service.serviceType],
        },
        rows: rows,
        type: BlockType.SystemBlock,
        position: { top: 100, left: 100 },
      };
    });

    return blocks;
  };

  const loadLayout = async () => {
    const layoutData = localStorage.getItem("sys-design");
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
    } else {
      setBlocks(sysBlockData);
    }
  };

  useEffect(() => {
    loadLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <Button label={"Save"} onClick={saveLayout}></Button>
      </HeaderContainer>
      <SysDesignWrapper />
    </UMLEditorProvider>
  );
};

export default SysDesignView;
