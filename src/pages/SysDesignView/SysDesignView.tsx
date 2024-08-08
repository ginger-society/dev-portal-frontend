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
} from "@/components/organisms/UMLEditor/types";
import { PageLayout } from "@/shared/PageLayout";
import { ColumnType } from "@/components/organisms/ColumnEditor/types";
import SysDesignWrapper from "./SysDesignWrapper";

const initialBlocks = {
  "1": {
    id: "1",
    position: { top: 100, left: 200 },
    rows: [],
    ref: React.createRef(),
    data: { name: "Ginger-Scaffolder" },
    type: BlockType.Table,
  },
  "2": {
    id: "2",
    position: { top: 200, left: 300 },
    rows: [],
    ref: React.createRef(),
    data: { name: "Ginger-Releaser" },
    type: BlockType.Table,
  },
  "3": {
    id: "3",
    position: { top: 400, left: 500 },
    rows: [],
    ref: React.createRef(),
    data: { name: "Metadata Service" },
    type: BlockType.Table,
  },
  "4": {
    id: "4",
    position: { top: 600, left: 700 },
    rows: [],
    ref: React.createRef(),
    data: { name: "IAM Service" },
    type: BlockType.Table,
  },
  "5": {
    id: "5",
    position: { top: 800, left: 900 },
    rows: [],
    ref: React.createRef(),
    data: { name: "Ginger-UI" },
    type: BlockType.Table,
  },
};

const SysDesignView = () => {
  const [blocks, setBlocks] = useState<{ [key: string]: Block }>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [editorData, setEditorData] = useState<EditorData>();
  return (
    <PageLayout>
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
        <SysDesignWrapper />
      </UMLEditorProvider>
    </PageLayout>
  );
};

export default SysDesignView;
