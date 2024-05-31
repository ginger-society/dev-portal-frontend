import Header from "@/components/atoms/Header";
import { LegendConfigs } from "@/components/atoms/Legend/types";
import ColumnEditor from "@/components/organisms/ColumnEditor";
import { ColumnType } from "@/components/organisms/ColumnEditor/types";
import TableEditor from "@/components/organisms/TableEditor";
import UMLEditor from "@/components/organisms/UMLEditor";
import {
  UMLEditorProvider,
  useUMLEditor,
} from "@/components/organisms/UMLEditor/context";
import {
  Block,
  Connection,
  BlockData,
  MarkerType,
  EditorData,
  BlockType,
  Row,
} from "@/components/organisms/UMLEditor/types";
import { AuthContext } from "@/shared/AuthContext";
import { db } from "@/shared/firebase";
import { enumIcon, tableIcon } from "@/shared/svgIcons";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const legendConfigs: LegendConfigs = {
  [MarkerType.Rectangle]: {
    label: "Many To Many",
    color: "#4793AF",
  },
  [MarkerType.Hexagon]: {
    label: "Foreign Key",
    color: "#5E1675",
  },
  [MarkerType.Triangle]: {
    label: "One to One",
    color: "#799351",
  },
};

const Editor = () => {
  const [blocks, setBlocks] = useState<{ [key: string]: Block }>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [editorData, setEditorData] = useState<EditorData>();
  const { user } = useContext(AuthContext);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const { docId } = useParams<{ docId: string }>();

  const fetchData = async () => {
    if (!docId) {
      // Fetch document data with docId
      return;
    }
    const docRef = doc(db, "schemaDefs", docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const mockBlocks2 = docSnap.data().blocks as BlockData[];
      const blockData: { [key: string]: Block } = Object.values(
        mockBlocks2,
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
      setBlocks(blockData);
    } else {
      console.log("No such document!");
    }
  };

  useEffect(() => {
    fetchData();
  }, [docId]);

  const handleSave = async () => {
    setSaveLoading(true);
    const blocksStr = Object.values(blocks).map((block) => {
      return {
        id: block.id,
        position: block.position,
        rows: block.rows,
        data: block.data,
        type: block.type,
      };
    });
    if (docId) {
      await setDoc(doc(db, "schemaDefs", docId), {
        blocks: blocksStr,
        userId: user?.uid,
      });
      setSaveLoading(false);
    }

    // localStorage.setItem("data", JSON.stringify(blocksStr));
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
      <>
        <Header>
          <button
            className="base-button secondary editor-save-btn"
            onClick={handleSave}
          >
            {saveLoading ? "Saving..." : "Save"}
          </button>
        </Header>
        <UMLEditorWrapper />
      </>
    </UMLEditorProvider>
  );
};

const UMLEditorWrapper = () => {
  const { blocks, setBlocks, connections, setConnections, setEditorData } =
    useUMLEditor();

  const updateConnections = () => {
    const connections: Connection[] = [];
    Object.keys(blocks).forEach((key) => {
      const block = blocks[key];
      block.rows.forEach((row, index) => {
        if (row.data.type === ColumnType.ForeignKey) {
          const block1Id = row.data.target;
          const block2Id = block.id;
          const toRow = index;
          const fromRow = 0;

          connections.push({
            block1Id,
            block2Id,
            fromRow,
            toRow,
            marker: MarkerType.Hexagon,
            label: `column : ${row.data.field_name}_id`,
          });
        } else if (row.data.type === ColumnType.ManyToManyField) {
          const block1Id = row.data.target;
          const block2Id = block.id;
          const toRow = index;
          const fromRow = 0;

          connections.push({
            block1Id,
            block2Id,
            fromRow,
            toRow,
            marker: MarkerType.Rectangle,
            label: `Via table ${block.id}_${row.data.target}`,
          });
        } else if (row.data.type === ColumnType.OneToOneField) {
          const block1Id = row.data.target;
          const block2Id = block.id;
          const toRow = index;
          const fromRow = 0;

          connections.push({
            block1Id,
            block2Id,
            fromRow,
            toRow,
            marker: MarkerType.Triangle,
            label: `Uniquly via ${row.data.field_name}_id`,
          });
        }
      });
    });
    setConnections(connections);
  };

  useEffect(() => {
    updateConnections();
  }, [blocks]);

  const createNewBlock = (
    type: BlockType,
    x: number,
    y: number,
    id: string,
  ): Block => {
    const rows: Row[] = [];
    if (type === BlockType.Table) {
      rows.push({
        id: "pk",
        data: {
          type: "BigAutoField",
          name: "pk",
          field_name: "pk",
        },
      });
    }
    const newBlock = {
      id,
      rows: [...rows],
      ref: React.createRef<HTMLDivElement>(),
      position: { top: y, left: x },
      data: {},
      type: type,
    };
    return newBlock;
  };

  return (
    <UMLEditor
      setBlocks={setBlocks}
      setConnections={setConnections}
      blocks={blocks}
      RowRenderer={({ rowData }) => {
        let hasError = false;
        if (
          (rowData.data.type === ColumnType.ForeignKey ||
            rowData.data.type === ColumnType.ManyToManyField ||
            rowData.data.type === ColumnType.OneToOneField) &&
          !blocks[rowData.data.target]
        ) {
          hasError = true;
        }

        return (
          <div
            className="column-repr"
            onClick={(e) => {
              if (rowData.data.type === ColumnType.PK) {
                e.stopPropagation();
                e.preventDefault();
              }
            }}
          >
            <strong className={hasError ? "text-error" : ""}>
              {rowData.data.field_name}
            </strong>
            {!rowData.data.field_name && !rowData.data.type && (
              <span className="text-primary">New Row - Click to define</span>
            )}
            <small>{rowData.data.type || ""}</small>
          </div>
        );
      }}
      HeadingRenderer={({ blockData }) => (
        <>
          {blockData.type === BlockType.Table && (
            <>
              {tableIcon}
              <strong>{(blockData.data.name || "") + " : Table"}</strong>
            </>
          )}
          {blockData.type === BlockType.Enum && (
            <>
              {enumIcon}
              <strong>{(blockData.data.name || "") + " : Enums"}</strong>
            </>
          )}
        </>
      )}
      EnumRowRenderer={({ blockData }) => {
        const usedIn: string[] = [];
        Object.values(blocks).forEach((block) => {
          block.rows.forEach((row) => {
            if (
              row.data.type === ColumnType.String &&
              row.data.options_target === blockData.id
            ) {
              usedIn.push(block.id);
            }
          });
        });

        return (
          <div className="enum-row-renderer-container">
            <span>
              Total of {(blockData.data.options || []).length} Choices
            </span>
            <span>
              Used in{" "}
              {usedIn.map((u, index) => {
                return (
                  <>
                    <strong>{u}</strong>
                    {index < usedIn.length - 1 && ", "}
                  </>
                );
              })}
            </span>
          </div>
        );
      }}
      connections={connections}
      legendConfigs={legendConfigs}
      RowEditor={ColumnEditor}
      BlockEditor={TableEditor}
      setEditorData={setEditorData}
      updateConnections={updateConnections}
      createNewBlock={createNewBlock}
    />
  );
};

export default Editor;
