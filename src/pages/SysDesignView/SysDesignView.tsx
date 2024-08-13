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

const initialBlocks: { [key: string]: Block } = {
  "iam-db": {
    id: "iam-db",
    position: { top: 100, left: 200 },
    rows: [
      {
        id: "iam-db-tables",
        data: { heading: "Tables", list: ["user", "application"] },
      },
    ],
    ref: React.createRef(),
    data: {
      name: "IAM Database",
      type: "database",
      description: "Identity and Access management database",
      color: "#89439f",
    },
    type: BlockType.SystemBlock,
  },
  "ginger-scaffolder": {
    id: "ginger-scaffolder",
    position: { top: 100, left: 200 },
    rows: [],
    ref: React.createRef(),
    data: {
      name: "ginger-scaffolder",
      type: "executable",
      description: "Project scaffolding cli",
    },
    type: BlockType.SystemBlock,
  },
  "ginger-releaser": {
    id: "ginger-releaser",
    position: { top: 200, left: 300 },
    rows: [],
    ref: React.createRef(),
    data: {
      name: "ginger-releaser",
      type: "executable",
      description: "command line utility for Release management",
    },
    type: BlockType.SystemBlock,
  },
  "db-compose": {
    id: "db-compose",
    position: { top: 200, left: 300 },
    rows: [],
    ref: React.createRef(),
    data: {
      name: "db-compose",
      type: "executable",
      description:
        "A utility to work with Databases like postgreSQL, redis , mongo",
    },
    type: BlockType.SystemBlock,
  },
  "ginger-connector": {
    id: "ginger-connector",
    position: { top: 200, left: 300 },
    rows: [],
    ref: React.createRef(),
    data: {
      name: "ginger-connector",
      type: "executable",
      description: "A utility to connect different services",
    },
    type: BlockType.SystemBlock,
  },
  MetadataService: {
    id: "MetadataService",
    position: { top: 400, left: 500 },
    rows: [
      {
        id: "MetadataService-dependencies",
        data: { heading: "Uses", list: ["IAMService"] },
      },
      {
        id: "iam-db-tables",
        data: { heading: "IAM DB Tables", list: ["user"] },
      },
    ],
    ref: React.createRef(),
    data: {
      name: "MetadataService",
      type: "RPCEndpoint",
      description: "A utility to connect different services",
      color: "#799351",
    },
    type: BlockType.SystemBlock,
  },
  IAMService: {
    id: "IAMService",
    position: { top: 600, left: 700 },
    rows: [
      {
        id: "IAMService-dependencies",
        data: { heading: "Uses", list: ["MetadataService"] },
      },
    ],
    ref: React.createRef(),
    data: { name: "IAMService", type: "RPCEndpoint", color: "#799351" },
    type: BlockType.SystemBlock,
  },
  "dev-portal": {
    id: "dev-portal",
    position: { top: 600, left: 700 },
    rows: [
      {
        id: "dev-portal-dependencies",
        data: { heading: "Uses", list: ["IAMService", "MetadataService"] },
      },
    ],
    ref: React.createRef(),
    data: { name: "Dev Portal", type: "portal" },
    type: BlockType.SystemBlock,
  },
  "iam-frontend-users": {
    id: "iam-frontend-users",
    position: { top: 600, left: 700 },
    rows: [
      {
        id: "iam-frontend-users-dependencies",
        data: { heading: "Uses", list: ["IAMService"] },
      },
    ],
    ref: React.createRef(),
    data: { name: "IAM Portal - Users", type: "portal" },
    type: BlockType.SystemBlock,
  },
  "ginger-ui": {
    id: "ginger-ui",
    position: { top: 800, left: 900 },
    rows: [],
    ref: React.createRef(),
    data: { name: "ginger-ui", type: "package" },
    type: BlockType.SystemBlock,
  },
  "ginger-book": {
    id: "ginger-book",
    position: { top: 800, left: 900 },
    rows: [],
    ref: React.createRef(),
    data: { name: "ginger-book", type: "package" },
    type: BlockType.SystemBlock,
  },
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
      blocks[pkg.identifier] = {
        id: pkg.identifier,
        position: { top: 100, left: 100 },
        type: BlockType.SystemBlock,
        ref: React.createRef(),
        data: {
          name: pkg.identifier,
          description: pkg.description,
          type: pkg.packageType,
        },
        rows: [],
      };
    });

    const services = await MetadataService.metadataGetServicesAndEnvs();
    services.forEach((service) => {
      blocks[service.identifier] = {
        id: service.identifier,
        ref: React.createRef(),
        data: {
          name: service.identifier,
          type: service.serviceType,
          description: service.description,
          color:
            service.serviceType && (blockColorMap as any)[service.serviceType],
        },
        rows: [
          {
            id: `${service.identifier}-dependencies`,
            data: { heading: "Uses", list: service.dependencies },
          },
          {
            id: `${service.dbSchemaId}-tables`,
            data: { heading: "Tables in use", list: service.tables },
          },
        ],
        type: BlockType.SystemBlock,
        position: { top: 100, left: 100 },
      };
    });

    const dbSchemas = await MetadataService.metadataGetDbschemasAndTables();
    console.log(dbSchemas);
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
        console.log(block);
        return {
          ...accum,
          [block.id]: {
            ...block,
            position: (layoutJson[block.id] &&
              layoutJson[block.id].position) || { top: 100, left: 100 },
          },
        };
      }, {});
      console.log(data);
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
