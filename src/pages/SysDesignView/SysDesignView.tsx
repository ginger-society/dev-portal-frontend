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
      description: "Identity and Access management DB",
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
      description: "Release management utility cli",
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
  const [blocks, setBlocks] = useState<{ [key: string]: Block }>(initialBlocks);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [editorData, setEditorData] = useState<EditorData>();

  const transformDataToSave = () => {
    return Object.values(blocks).map((block) => {
      return {
        id: block.id,
        position: block.position,
        rows: block.rows,
        data: block.data,
        type: block.type,
      };
    });
  };

  const { show } = useSnackbar();

  const saveLayout = () => {
    localStorage.setItem("sys-design", JSON.stringify(transformDataToSave()));
    show(<>Saved in local storage</>, SnackbarTimer.Medium);
  };

  const loadLayout = () => {
    const layoutData = localStorage.getItem("sys-design");

    if (layoutData) {
      const layoutJson = Object.values(
        JSON.parse(layoutData) as BlockData[]
      ).reduce((accum, block) => {
        return {
          ...accum,
          [block.id]: {
            ...block,
            rows: block.rows || [],
            ref: React.createRef(),
            data: block.data || {},
            type: block.type || BlockType.Table,
          },
        };
      }, {});
      setBlocks(layoutJson);
    }
  };

  useEffect(() => {
    loadLayout();
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
